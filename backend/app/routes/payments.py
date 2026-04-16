import razorpay
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from app.config import settings
from app.database import get_db
from app.routes.auth import get_current_worker
from datetime import datetime, timedelta
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

PLAN_CONFIG = {
    "daily": {
        "name": "Daily Shield",
        "price": 12.0,
        "coverage": 900,   # Max per-day coverage (Gold tier cap)
    },
    "basic": {
        "name": "Basic Shield",
        "price": 49.0,
        "coverage": 400,   # Basic plan coverage ceiling
    },
    "standard": {
        "name": "Standard Shield",
        "price": 62.0,
        "coverage": 600,   # Standard plan coverage ceiling
    },
    "premium": {
        "name": "Premium Shield",
        "price": 89.0,
        "coverage": 900,   # Premium plan coverage ceiling
    },
}

def get_razorpay_client():
    return razorpay.Client(
        auth=(
            settings.razorpay_key_id,
            settings.razorpay_key_secret
        )
    )

class CreateOrderRequest(BaseModel):
    plan_id: str
    amount: float = 0  # zone-adjusted amount from frontend

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str
    amount: float = 0  # zone-adjusted amount paid by worker

class PayoutRequest(BaseModel):
    claim_id: str
    upi_id: str

@router.post("/create-order")
async def create_payment_order(
    request: CreateOrderRequest,
    db=Depends(get_db)
):
    """Create Razorpay order for policy payment"""
    plan = PLAN_CONFIG.get(request.plan_id)
    if not plan:
        raise HTTPException(400, "Invalid plan")

    # Use zone-adjusted amount if provided by frontend, else fall back to base price
    charge_amount = request.amount if request.amount > 0 else plan["price"]

    mock_mode = getattr(
        settings, 'razorpay_mock_mode', 'true'
    ).lower() == 'true'

    if mock_mode:
        import uuid
        order_id = f"order_MOCK_{uuid.uuid4().hex[:16]}"
        return {
            "order_id": order_id,
            "amount": int(charge_amount * 100),
            "currency": "INR",
            "key": settings.razorpay_key_id,
            "mock": True,
            "actual_amount": charge_amount,
        }

    try:
        client = get_razorpay_client()
        order = client.order.create({
            "amount": int(charge_amount * 100),
            "currency": "INR",
            "notes": {
                "plan_id": request.plan_id,
                "product": "GuidePay Insurance",
            }
        })

        return {
            "order_id": order["id"],
            "amount": charge_amount,
            "currency": "INR",
            "key": settings.razorpay_key_id,
            "mock": False,
            "actual_amount": charge_amount,
        }
    except Exception as e:
        logger.error(f"Razorpay order error: {e}")
        raise HTTPException(
            500, "Payment initialization failed"
        )

@router.post("/verify")
async def verify_payment(
    request: VerifyPaymentRequest,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Verify payment and activate policy"""
    # Verify signature (skip for mock)
    is_mock = request.razorpay_payment_id.startswith(
        "MOCK_"
    ) or request.razorpay_order_id.startswith(
        "order_MOCK_"
    )

    if not is_mock:
        try:
            signature_data = (
                f"{request.razorpay_order_id}"
                f"|{request.razorpay_payment_id}"
            )
            expected_sig = hmac.new(
                settings.razorpay_key_secret.encode(),
                signature_data.encode(),
                hashlib.sha256
            ).hexdigest()

            if expected_sig != request.razorpay_signature:
                raise HTTPException(
                    400, "Invalid payment signature"
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Signature error: {e}")
            raise HTTPException(
                400, "Payment verification failed"
            )

    plan = PLAN_CONFIG.get(request.plan_id)
    if not plan:
        raise HTTPException(400, "Invalid plan")

    # Compute payout tier from worker's activity level
    worker_id = str(current_worker["_id"])
    daily_orders = float(
        current_worker.get("avg_orders_per_day") or
        current_worker.get("avg_daily_orders") or 8
    )
    if daily_orders >= 15:
        payout_tier = "gold"
        payout_amount = 900
    elif daily_orders >= 8:
        payout_tier = "silver"
        payout_amount = 600
    else:
        payout_tier = "bronze"
        payout_amount = 400

    now = datetime.utcnow()
    policy_id = str(ObjectId())

    # Daily plan expires in 24h
    is_daily = request.plan_id == "daily"
    expires_delta = timedelta(hours=24) if is_daily else timedelta(days=7)

    # Use the actual zone-adjusted amount paid by the worker
    actual_premium = request.amount if request.amount > 0 else plan["price"]

    # coverage_cap = plan's coverage ceiling (e.g. 900 for Premium)
    # payout_amount = worker's tier-based per-event payout (capped by plan ceiling)
    plan_coverage_cap = plan["coverage"]
    effective_payout = min(payout_amount, plan_coverage_cap)

    policy_doc = {
        "_id": policy_id,
        "worker_id": worker_id,
        "plan_id": request.plan_id,
        "plan_name": plan["name"],
        "plan_type": request.plan_id,
        "weekly_premium": actual_premium,       # zone-adjusted real amount
        "base_premium": plan["price"],           # original base for reference
        "premium_paid": actual_premium,
        "coverage_cap": float(plan_coverage_cap),  # plan's max coverage ceiling
        "payout_tier": payout_tier,
        "payout_amount": effective_payout,       # per-event payout (tier, capped by plan)
        "income_tier": payout_tier,
        "status": "ACTIVE",
        "payment_id": request.razorpay_payment_id,
        "order_id": request.razorpay_order_id,
        "week_start": now,
        "week_end": now + expires_delta,
        "expires_at": now + expires_delta,
        "auto_renew": not is_daily,
        "auto_payout": True,
        "created_at": now,
    }

    await db.policies.insert_one(policy_doc)

    payment_doc = {
        "_id": str(ObjectId()),
        "policy_id": policy_id,
        "worker_id": worker_id,
        "razorpay_payment_id": request.razorpay_payment_id,
        "razorpay_order_id": request.razorpay_order_id,
        "amount": actual_premium,
        "currency": "INR",
        "status": "captured",
        "created_at": now,
    }
    await db.payments.insert_one(payment_doc)

    return {
        "success": True,
        "policy": {
            "id": policy_id,
            "plan_id": request.plan_id,
            "plan_name": plan["name"],
            "plan_type": request.plan_id,
            "weekly_premium": actual_premium,
            "base_premium": plan["price"],
            "coverage_cap": plan_coverage_cap,   # plan's ceiling (e.g. 900 for Premium)
            "payout_tier": payout_tier,
            "payout_amount": effective_payout,   # actual per-event payout
            "income_tier": payout_tier,
            "status": "ACTIVE",
            "payment_id": request.razorpay_payment_id,
            "week_start": now.isoformat(),
            "week_end": (now + expires_delta).isoformat(),
        },
        "payment_id": request.razorpay_payment_id,
        "receipt": {
            "receipt_id": f"GP-{request.razorpay_payment_id[-8:].upper()}",
            "amount": actual_premium,
            "plan": plan["name"],
            "timestamp": now.isoformat(),
        }
    }

@router.post("/simulate-payout")
async def simulate_claim_payout(
    request: PayoutRequest,
    db=Depends(get_db)
):
    """
    Simulate instant UPI payout for a claim.
    Shows worker the exact payout flow.
    """
    claim = await db.claims.find_one({
        "_id": request.claim_id,
    })

    if not claim:
        raise HTTPException(404, "Claim not found")

    if claim.get("status") == "PAID":
        raise HTTPException(400, "Claim already paid")

    now = datetime.utcnow()

    import uuid
    payout_id = f"pout_TEST_{uuid.uuid4().hex[:12]}"
    transaction_id = f"IMPS{uuid.uuid4().hex[:15].upper()}"

    await db.claims.update_one(
        {"_id": request.claim_id},
        {"$set": {
            "status": "PAID",
            "paid_at": now,
            "razorpay_payout_id": payout_id,
            "upi_transaction_id": transaction_id,
            "upi_id": request.upi_id,
            "payout_mode": "UPI",
            "updated_at": now,
        }}
    )

    amount = claim.get("amount", 600)

    return {
        "success": True,
        "payout": {
            "payout_id": payout_id,
            "transaction_id": transaction_id,
            "upi_id": request.upi_id,
            "amount": amount,
            "currency": "INR",
            "mode": "UPI",
            "status": "PROCESSED",
            "processed_at": now.isoformat(),
            "expected_credit": "Instant",
        },
        "receipt": {
            "receipt_id": f"GP-PAY-{payout_id[-8:].upper()}",
            "claim_id": request.claim_id,
            "amount": amount,
            "upi_id": request.upi_id,
            "transaction_id": transaction_id,
            "timestamp": now.isoformat(),
            "message": f"₹{amount} credited to {request.upi_id}",
        }
    }
