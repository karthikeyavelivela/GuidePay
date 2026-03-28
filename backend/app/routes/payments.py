import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_db
from app.routes.auth import get_current_worker
from app.config import settings
from datetime import datetime, timedelta
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class CreateOrderRequest(BaseModel):
    plan_id: str
    amount: float


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str


PLAN_CONFIG = {
    "basic": {"name": "Basic", "price": 49.0},
    "standard": {"name": "Standard", "price": 58.0},
    "premium": {"name": "Premium", "price": 69.0},
}


@router.post("/create-order")
async def create_order(
    request: CreateOrderRequest,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Create a mock payment order for policy activation"""
    plan = PLAN_CONFIG.get(request.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")

    mock_order_id = f"order_MOCK_{uuid.uuid4().hex[:16]}"
    return {
        "order_id": mock_order_id,
        "amount": plan["price"],
        "currency": "INR",
        "key": settings.razorpay_key_id,
        "mock": True,
    }


@router.post("/verify")
async def verify_payment(
    request: VerifyPaymentRequest,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Mock payment verification — activates policy immediately"""
    plan = PLAN_CONFIG.get(request.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")

    worker_id = str(current_worker["_id"])

    # Cancel any existing active policy
    await db.policies.update_many(
        {"worker_id": worker_id, "status": "ACTIVE"},
        {"$set": {"status": "CANCELLED"}}
    )

    now = datetime.utcnow()
    policy_doc = {
        "_id": str(ObjectId()),
        "worker_id": worker_id,
        "plan_id": request.plan_id,
        "plan_name": plan["name"],
        "weekly_premium": plan["price"],
        "coverage_cap": 600.0,
        "status": "ACTIVE",
        "payment_id": request.razorpay_payment_id,
        "week_start": now,
        "week_end": now + timedelta(days=7),
        "auto_renew": True,
        "created_at": now,
    }
    await db.policies.insert_one(policy_doc)

    # Record payment
    payment_doc = {
        "_id": str(ObjectId()),
        "worker_id": worker_id,
        "policy_id": policy_doc["_id"],
        "razorpay_payment_id": request.razorpay_payment_id,
        "razorpay_order_id": request.razorpay_order_id,
        "amount": plan["price"],
        "currency": "INR",
        "status": "captured",
        "created_at": now,
    }
    await db.payments.insert_one(payment_doc)

    logger.info(
        f"[MOCK PAYMENT] Plan {request.plan_id} activated "
        f"for worker {worker_id} — \u20b9{plan['price']}"
    )

    return {
        "success": True,
        "policy": policy_doc,
        "payment_id": request.razorpay_payment_id,
    }
