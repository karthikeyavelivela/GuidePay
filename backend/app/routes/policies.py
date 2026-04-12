from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.routes.auth import get_current_worker
from app.utils.formatters import serialize_doc
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

DAILY_PLAN = {
    "id": "daily",
    "name": "Daily Shield",
    "plan_type": "daily",
    "premium": 12,
    "coverage_hours": 24,
    "description": "Perfect for workers who want flexible daily protection",
    "badge": "MOST AFFORDABLE",
}


def check_daily_policy_expiry(policy: dict) -> bool:
    """Returns True if a daily policy is still valid."""
    if policy.get("plan_type") != "daily":
        return True
    expires_at = policy.get("expires_at")
    if not expires_at:
        return False
    return datetime.utcnow() < expires_at


@router.get("/my/active")
async def get_active_policy(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get current worker's active policy, respecting daily plan expiry."""
    worker_id = str(current_worker["_id"])

    policy = await db.policies.find_one({
        "worker_id": worker_id,
        "status": "ACTIVE"
    })

    if not policy:
        return {"policy": None, "message": "No active policy"}

    # Expire daily policies past 24 hours
    if policy.get("plan_type") == "daily" and not check_daily_policy_expiry(policy):
        await db.policies.update_one(
            {"_id": policy["_id"]},
            {"$set": {"status": "EXPIRED", "updated_at": datetime.utcnow()}}
        )
        return {"policy": None, "message": "Daily policy expired"}

    return serialize_doc(policy)


@router.get("/my")
async def get_my_policies(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get all policies for current worker"""
    worker_id = str(current_worker["_id"])

    policies = await db.policies.find(
        {"worker_id": worker_id}
    ).sort("created_at", -1).to_list(50)

    return {
        "policies": [serialize_doc(p) for p in policies],
        "total": len(policies)
    }


@router.get("/{policy_id}")
async def get_policy(
    policy_id: str,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get a specific policy"""
    worker_id = str(current_worker["_id"])

    policy = await db.policies.find_one({"_id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if policy["worker_id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return serialize_doc(policy)
