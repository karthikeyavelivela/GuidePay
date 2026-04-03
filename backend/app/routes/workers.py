from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.routes.auth import get_current_worker
from app.services.premium_service import calculate_premium
from app.services.ml_service import calculate_risk_score
from app.models.worker import WorkerCreate, WorkerUpdate
from app.utils.formatters import serialize_doc
from datetime import datetime, timedelta
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/me")
async def get_my_profile(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get current worker's full profile"""
    worker_id = str(current_worker["_id"])

    policy = await db.policies.find_one({
        "worker_id": worker_id,
        "status": "ACTIVE"
    })

    total_claims = await db.claims.count_documents({
        "worker_id": worker_id,
        "status": {"$ne": "REJECTED"}
    })
    paid_claims = await db.claims.count_documents({
        "worker_id": worker_id,
        "status": "PAID"
    })

    pipeline = [
        {"$match": {"worker_id": worker_id, "status": "PAID"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    payout_result = await db.claims.aggregate(pipeline).to_list(1)
    total_payouts = (payout_result[0]["total"] if payout_result else 0)

    result = serialize_doc(current_worker)
    result["active_policy"] = serialize_doc(policy) if policy else None
    result["stats"] = {
        "total_claims": total_claims,
        "paid_claims": paid_claims,
        "total_payouts": total_payouts,
    }
    return result


@router.put("/me")
async def update_my_profile(
    updates: WorkerUpdate,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Update worker profile and recalculate premium"""
    worker_id = str(current_worker["_id"])
    update_data = updates.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()

    if "zone" in update_data or "city" in update_data:
        zone = update_data.get("zone", current_worker["zone"])
        risk_score = current_worker.get("risk_score", 0.75)
        premium = calculate_premium(zone, risk_score)
        update_data["premium_amount"] = premium

    await db.workers.update_one(
        {"_id": worker_id},
        {"$set": update_data}
    )

    updated = await db.workers.find_one({"_id": worker_id})
    return serialize_doc(updated)


@router.get("/me/risk-score")
async def get_my_risk_score(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Calculate and return current risk score"""
    worker_id = str(current_worker["_id"])

    claims = await db.claims.find(
        {"worker_id": worker_id}
    ).to_list(100)

    score_data = await calculate_risk_score(
        worker=current_worker,
        claims=claims,
        db=db
    )

    await db.workers.update_one(
        {"_id": worker_id},
        {"$set": {
            "risk_score": score_data["score"],
            "risk_tier": score_data["tier"],
            "premium_amount": calculate_premium(
                current_worker.get("zone", ""),
                score_data["score"]
            )
        }}
    )

    return score_data


@router.get("/me/earnings")
async def get_my_earnings(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """
    Earnings Shield — aggregate monthly premiums paid vs payouts received.
    Powers the EarningsShield dashboard.
    """
    worker_id = str(current_worker["_id"])
    six_months_ago = datetime.utcnow() - timedelta(days=180)

    # Monthly payouts (claims paid)
    payouts_pipeline = [
        {"$match": {
            "worker_id": worker_id,
            "status": "PAID",
            "paid_at": {"$gte": six_months_ago}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m",
                    "date": "$paid_at"
                }
            },
            "total_payout": {"$sum": "$amount"},
            "claim_count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}}
    ]
    monthly_payouts = await db.claims.aggregate(payouts_pipeline).to_list(12)

    # Monthly premiums (payments made)
    premiums_pipeline = [
        {"$match": {
            "worker_id": worker_id,
            "created_at": {"$gte": six_months_ago}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m",
                    "date": "$created_at"
                }
            },
            "total_premium": {"$sum": "$amount"},
            "payment_count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}}
    ]
    monthly_premiums = await db.payments.aggregate(premiums_pipeline).to_list(12)

    # Total lifetime stats
    total_payouts_result = await db.claims.aggregate([
        {"$match": {"worker_id": worker_id, "status": "PAID"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)

    total_premiums_result = await db.payments.aggregate([
        {"$match": {"worker_id": worker_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)

    total_payouts = total_payouts_result[0]["total"] if total_payouts_result else 0
    total_claims = total_payouts_result[0]["count"] if total_payouts_result else 0
    total_premiums = total_premiums_result[0]["total"] if total_premiums_result else 0

    net_protection = total_payouts - total_premiums

    return {
        "monthly_payouts": monthly_payouts,
        "monthly_premiums": monthly_premiums,
        "summary": {
            "total_payouts": total_payouts,
            "total_premiums": total_premiums,
            "total_claims": total_claims,
            "net_protection": net_protection,
            "roi_percent": round(
                (total_payouts / total_premiums * 100) if total_premiums > 0 else 0, 1
            ),
        },
        "worker_zone": current_worker.get("zone", ""),
        "worker_city": current_worker.get("city", ""),
    }


@router.post("/me/update-last-order")
async def update_last_order(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """
    Mock endpoint — in production called by platform API webhooks
    when worker completes delivery
    """
    await db.workers.update_one(
        {"_id": str(current_worker["_id"])},
        {"$set": {"last_order_timestamp": datetime.utcnow()}}
    )
    return {"message": "Last order timestamp updated"}


@router.get("/me/premium-breakdown")
async def get_premium_breakdown(
    zone: str = None,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Returns full ML premium breakdown for the worker."""
    from app.services.premium_service import calculate_ml_premium

    worker_zone = zone or current_worker.get("zone", "")
    risk_score = current_worker.get("risk_score", 0.75)

    breakdown = calculate_ml_premium(
        zone=worker_zone,
        worker_risk_score=risk_score,
    )

    # Add personalized message
    if breakdown["zone_adjustment"] > 0:
        flood_events = breakdown["factors"].get("flood_history", 0) * 12
        breakdown["message"] = (
            f"Your zone has {flood_events:.0f} flood events in 5 years — "
            f"Rs{breakdown['zone_adjustment']} added for protection"
        )
    elif breakdown["worker_adjustment"] < 0:
        breakdown["message"] = (
            f"Your trusted worker discount saves you "
            f"Rs{abs(breakdown['worker_adjustment'])} this week"
        )
    else:
        breakdown["message"] = (
            "Your premium reflects standard risk for your zone"
        )

    return breakdown


@router.get("/premium-compare")
async def compare_zone_premiums(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Compare premiums across all zones. Used for zone selection screen."""
    from app.services.premium_service import ZONE_ML_DATA, calculate_ml_premium

    risk_score = current_worker.get("risk_score", 0.75)

    comparisons = []
    for zone_key in ZONE_ML_DATA.keys():
        calc = calculate_ml_premium(
            zone=zone_key,
            worker_risk_score=risk_score,
        )
        comparisons.append({
            "zone": zone_key,
            "city": calc["city"],
            "premium": calc["final_premium"],
            "risk_level": (
                "HIGH" if calc["zone_risk_score"] > 0.6
                else "MEDIUM" if calc["zone_risk_score"] > 0.35
                else "LOW"
            ),
            "zone_risk_score": calc["zone_risk_score"],
        })

    comparisons.sort(key=lambda x: x["premium"])
    return {"zones": comparisons}
