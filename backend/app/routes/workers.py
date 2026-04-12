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
import math

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


@router.get("/wellness-score")
async def get_wellness_score(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Calculate a wellness score 0-100 for the authenticated worker."""
    worker_id = str(current_worker["_id"])
    score = 0
    breakdown = {}

    # +30 for active policy
    policy = await db.policies.find_one({"worker_id": worker_id, "status": "ACTIVE"})
    if policy:
        score += 30
        breakdown["active_policy"] = {"points": 30, "label": "Active policy"}
    else:
        breakdown["active_policy"] = {"points": 0, "label": "No active policy"}

    # Zone risk
    zone = current_worker.get("zone", "")
    from app.services.premium_service import calculate_ml_premium, ZONE_RISK
    zone_risk_info = ZONE_RISK.get(zone, {})
    zone_flood = zone_risk_info.get("flood", 0.5)
    if zone_flood < 0.35:
        score += 20
        breakdown["zone_risk"] = {"points": 20, "label": "Low-risk zone"}
    elif zone_flood < 0.65:
        score += 10
        breakdown["zone_risk"] = {"points": 10, "label": "Medium-risk zone"}
    else:
        breakdown["zone_risk"] = {"points": 0, "label": "High-risk zone"}

    # +20 no claims in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_claims = await db.claims.count_documents({
        "worker_id": worker_id,
        "created_at": {"$gte": thirty_days_ago}
    })
    if recent_claims == 0:
        score += 20
        breakdown["recent_claims"] = {"points": 20, "label": "No recent claims"}
    else:
        breakdown["recent_claims"] = {"points": 0, "label": f"{recent_claims} claim(s) in last 30 days"}

    # +15 account age > 30 days
    created_at = current_worker.get("created_at", datetime.utcnow())
    account_age_days = (datetime.utcnow() - created_at).days
    if account_age_days > 30:
        score += 15
        breakdown["account_age"] = {"points": 15, "label": f"Account {account_age_days} days old"}
    else:
        breakdown["account_age"] = {"points": 0, "label": "Account less than 30 days old"}

    # +15 UPI verified
    if current_worker.get("upi_id"):
        score += 15
        breakdown["upi_verified"] = {"points": 15, "label": "UPI ID verified"}
    else:
        breakdown["upi_verified"] = {"points": 0, "label": "No UPI ID linked"}

    grade = "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"

    # Actionable tip
    if not policy:
        tip = "Buy a coverage plan to protect your income and boost your wellness score by 30 points."
    elif not current_worker.get("upi_id"):
        tip = "Link your UPI ID to enable instant payouts and earn 15 more wellness points."
    elif recent_claims > 0:
        tip = "Avoid unnecessary claims to maintain a clean record and keep your wellness score high."
    elif zone_flood >= 0.65:
        tip = "You're in a high-risk zone. Consider upgrading to a Premium plan for full flood coverage."
    else:
        tip = "Great job! Keep your policy active and stay protected during monsoon season."

    return {
        "score": score,
        "grade": grade,
        "breakdown": breakdown,
        "tip": tip,
    }


@router.get("/earnings-shield-summary")
async def get_earnings_shield_summary(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Monthly earnings shield summary for the authenticated worker."""
    worker_id = str(current_worker["_id"])
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Premiums paid this month
    premiums_result = await db.payments.aggregate([
        {"$match": {"worker_id": worker_id, "created_at": {"$gte": month_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)
    premiums_paid = premiums_result[0]["total"] if premiums_result else 0

    # Claims paid this month
    claims_result = await db.claims.aggregate([
        {"$match": {"worker_id": worker_id, "status": "PAID", "paid_at": {"$gte": month_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)
    actual_payouts = claims_result[0]["total"] if claims_result else 0

    # Trigger events in worker's zone this month
    zone = current_worker.get("zone", "")
    triggers_count = await db.trigger_events.count_documents({
        "zone": zone,
        "started_at": {"$gte": month_start}
    })

    # Total protected = coverage cap of active policy or avg payout tier
    from app.services.premium_service import calculate_payout_amount
    daily_orders = float(current_worker.get("avg_daily_orders", 8))
    payout_info = calculate_payout_amount(daily_orders)
    total_protected = payout_info["payout_amount"]

    protection_ratio = round(
        (actual_payouts / premiums_paid * 100) if premiums_paid > 0 else 0, 1
    )

    return {
        "total_protected": total_protected,
        "actual_payouts": actual_payouts,
        "premiums_paid": premiums_paid,
        "protection_ratio": protection_ratio,
        "triggers_faced": triggers_count,
        "payout_tier": payout_info["payout_tier"],
        "message": f"GuidePay protected ₹{total_protected} of your potential income this month",
    }


@router.get("/me/notifications")
async def get_smart_notifications(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Dynamic contextual notifications for the authenticated worker."""
    worker_id = str(current_worker["_id"])
    notifications = []
    now = datetime.utcnow()

    # 1. Active flood alert in zone
    zone = current_worker.get("zone", "")
    active_flood = await db.trigger_events.find_one({
        "zone": zone, "status": "ACTIVE", "trigger_type": "FLOOD"
    })
    if active_flood:
        notifications.append({
            "id": "flood_alert",
            "type": "flood",
            "icon": "🌊",
            "title": "Flood alert active in your zone",
            "message": "Your coverage is protecting you right now.",
            "urgency": "high",
            "color": "#2E90FA",
        })

    # 2. Policy expiry warning
    policy = await db.policies.find_one({"worker_id": worker_id, "status": "ACTIVE"})
    if policy:
        expires_at = policy.get("week_end") or policy.get("expires_at")
        if expires_at:
            hours_left = (expires_at - now).total_seconds() / 3600
            if 0 < hours_left < 48:
                notifications.append({
                    "id": "policy_expiry",
                    "type": "expiry",
                    "icon": "⚠️",
                    "title": "Coverage expiring soon",
                    "message": f"Your coverage expires in {int(hours_left)} hours. Renew to stay protected.",
                    "urgency": "high",
                    "color": "#F04438",
                })
    else:
        notifications.append({
            "id": "no_policy",
            "type": "unprotected",
            "icon": "🛡️",
            "title": "You are currently unprotected",
            "message": "A ₹10/day plan is available. Get covered now.",
            "urgency": "high",
            "color": "#F04438",
        })

    # 3. Recent payout confirmation
    seven_days_ago = now - timedelta(days=7)
    recent_paid = await db.claims.find_one({
        "worker_id": worker_id,
        "status": "PAID",
        "paid_at": {"$gte": seven_days_ago}
    }, sort=[("paid_at", -1)])
    if recent_paid:
        paid_date = recent_paid.get("paid_at", now).strftime("%d %b")
        notifications.append({
            "id": f"paid_{recent_paid['_id']}",
            "type": "paid",
            "icon": "✅",
            "title": "Payout received",
            "message": f"GuidePay paid you ₹{recent_paid.get('amount', 600)} on {paid_date}. Your coverage worked.",
            "urgency": "low",
            "color": "#12B76A",
        })

    # 4. ML flood forecast for next week
    from app.ml.ml_service import predict_flood_probability
    forecast = predict_flood_probability(zone)
    if forecast["probability"] > 0.60:
        notifications.append({
            "id": "ml_forecast",
            "type": "forecast",
            "icon": "📊",
            "title": "High flood probability forecasted",
            "message": f"ML forecast: {forecast['probability_percent']}% flood probability in your zone next week. Consider renewing now.",
            "urgency": "medium",
            "color": "#F79009",
        })

    return {"notifications": notifications, "count": len(notifications)}


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
