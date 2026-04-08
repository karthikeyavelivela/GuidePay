from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from app.database import get_db
from app.utils.formatters import serialize_doc
from datetime import datetime, timedelta
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


async def get_admin_db(db=Depends(get_db)):
    return db


@router.get("/stats")
async def get_admin_stats(db=Depends(get_admin_db)):
    """Main admin dashboard stats"""
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)

    total_workers = await db.workers.count_documents({"is_active": True})
    active_policies = await db.policies.count_documents({"status": "ACTIVE"})

    payments_pipeline = [
        {"$match": {"created_at": {"$gte": week_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payments.aggregate(payments_pipeline).to_list(1)
    weekly_revenue = (revenue_result[0]["total"] if revenue_result else 0)

    payouts_pipeline = [
        {"$match": {
            "status": "PAID",
            "paid_at": {"$gte": week_start}
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    payout_result = await db.claims.aggregate(payouts_pipeline).to_list(1)
    weekly_payouts = (payout_result[0]["total"] if payout_result else 0)

    loss_ratio = (
        round(weekly_payouts / weekly_revenue, 3)
        if weekly_revenue > 0 else 0
    )

    claims_by_type = await db.claims.aggregate([
        {"$group": {
            "_id": "$trigger_type",
            "count": {"$sum": 1},
            "total_amount": {"$sum": "$amount"}
        }}
    ]).to_list(10)

    active_triggers = await db.trigger_events.find(
        {"status": "ACTIVE"}
    ).to_list(20)

    zone_exposure = await db.trigger_events.aggregate([
        {"$match": {"status": "ACTIVE"}},
        {"$group": {
            "_id": "$city",
            "total_exposure": {"$sum": "$total_exposure"},
            "workers": {"$sum": "$affected_workers"}
        }}
    ]).to_list(10)

    return {
        "total_workers": total_workers,
        "active_policies": active_policies,
        "weekly_revenue": weekly_revenue,
        "weekly_payouts": weekly_payouts,
        "loss_ratio": loss_ratio,
        "claims_by_type": claims_by_type,
        "active_triggers": [serialize_doc(t) for t in active_triggers],
        "zone_exposure": zone_exposure,
        "generated_at": now.isoformat(),
    }


@router.get("/community-stats")
async def get_community_stats(db=Depends(get_admin_db)):
    """
    Community Stats — aggregated platform-wide statistics.
    Public endpoint for community trust indicators.
    """
    total_workers = await db.workers.count_documents({"is_active": True})
    total_policies = await db.policies.count_documents({"status": "ACTIVE"})

    # Total claims processed
    total_claims = await db.claims.count_documents({})
    paid_claims = await db.claims.count_documents({"status": "PAID"})

    # Total payouts distributed
    payout_pipeline = [
        {"$match": {"status": "PAID"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    payout_result = await db.claims.aggregate(payout_pipeline).to_list(1)
    total_payouts = payout_result[0]["total"] if payout_result else 0

    # Average payout time (from created_at to paid_at)
    avg_time_pipeline = [
        {"$match": {"status": "PAID", "paid_at": {"$exists": True}}},
        {"$project": {
            "payout_time_ms": {
                "$subtract": ["$paid_at", "$created_at"]
            }
        }},
        {"$group": {
            "_id": None,
            "avg_ms": {"$avg": "$payout_time_ms"}
        }}
    ]
    avg_result = await db.claims.aggregate(avg_time_pipeline).to_list(1)
    avg_payout_minutes = round(
        (avg_result[0]["avg_ms"] / 60000) if avg_result and avg_result[0].get("avg_ms") else 0,
        1
    )

    # Cities covered
    cities = await db.workers.distinct("city", {"is_active": True})
    cities_covered = [c for c in cities if c]

    # Trigger events processed
    total_triggers = await db.trigger_events.count_documents({})

    # Auto-approval rate
    auto_approved = await db.claims.count_documents({"status": "PAID"})
    manual_review = await db.claims.count_documents({"status": "MANUAL_REVIEW"})
    approval_rate = round(
        (auto_approved / (auto_approved + manual_review) * 100)
        if (auto_approved + manual_review) > 0 else 0,
        1
    )

    return {
        "total_workers": total_workers,
        "active_policies": total_policies,
        "total_claims_processed": total_claims,
        "paid_claims": paid_claims,
        "total_payouts_distributed": total_payouts,
        "avg_payout_minutes": avg_payout_minutes,
        "cities_covered": cities_covered,
        "cities_count": len(cities_covered),
        "total_trigger_events": total_triggers,
        "auto_approval_rate": approval_rate,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/claims/queue")
async def get_claims_queue(
    status: str = "MANUAL_REVIEW",
    limit: int = Query(50, le=200),
    skip: int = 0,
    db=Depends(get_admin_db)
):
    """Get claims queue for admin review"""
    query = {}
    if status != "ALL":
        query["status"] = status

    claims = await db.claims.find(query).sort(
        "created_at", -1
    ).skip(skip).limit(limit).to_list(limit)

    enriched = []
    for claim in claims:
        worker = await db.workers.find_one(
            {"_id": claim["worker_id"]}
        )
        trigger = await db.trigger_events.find_one(
            {"_id": claim.get("trigger_event_id")}
        )
        doc = serialize_doc(claim)
        doc["worker"] = {
            "name": worker.get("name") if worker else "Unknown",
            "phone": worker.get("phone") if worker else "",
            "city": worker.get("city") if worker else "",
        }
        doc["trigger"] = serialize_doc(trigger) if trigger else None
        enriched.append(doc)

    total = await db.claims.count_documents(query)

    return {
        "claims": enriched,
        "total": total,
    }


@router.patch("/claims/{claim_id}/approve")
async def approve_claim(
    claim_id: str,
    db=Depends(get_admin_db)
):
    """Manually approve a flagged claim"""
    claim = await db.claims.find_one({"_id": claim_id})
    if not claim:
        raise HTTPException(404, "Claim not found")

    await db.claims.update_one(
        {"_id": claim_id},
        {"$set": {
            "status": "AUTO_APPROVED",
            "updated_at": datetime.utcnow(),
            "admin_approved": True,
        }}
    )

    worker = await db.workers.find_one({"_id": claim["worker_id"]})
    if worker:
        from app.services.imd_service import process_payout_transfer
        await process_payout_transfer(claim=claim, worker=worker, db=db)

    return {"success": True, "claim_id": claim_id}


@router.patch("/claims/{claim_id}/reject")
async def reject_claim(
    claim_id: str,
    reason: str = "Manual review failed",
    db=Depends(get_admin_db)
):
    """Reject a flagged claim"""
    await db.claims.update_one(
        {"_id": claim_id},
        {"$set": {
            "status": "REJECTED",
            "reject_reason": reason,
            "updated_at": datetime.utcnow(),
        }}
    )
    return {"success": True, "claim_id": claim_id}


class SimulateTriggerRequest(BaseModel):
    city: str = "Hyderabad"
    trigger_type: str = "FLOOD"


SIMULATE_ZONE_MAP = {
    "Hyderabad": {"zone": "kondapur-hyderabad", "lat": 17.4401, "lng": 78.3489},
    "Mumbai":    {"zone": "kurla-mumbai",        "lat": 19.0728, "lng": 72.8826},
    "Chennai":   {"zone": "tnagar-chennai",      "lat": 13.0418, "lng": 80.2341},
    "Bengaluru": {"zone": "koramangala-bengaluru","lat": 12.9352, "lng": 77.6245},
    "Delhi":     {"zone": "dwarka-delhi",         "lat": 28.5921, "lng": 77.0460},
    "Kolkata":   {"zone": "kolkata",              "lat": 22.5726, "lng": 88.3639},
    "Pune":      {"zone": "pune",                 "lat": 18.5204, "lng": 73.8567},
}


@router.post("/simulate-trigger")
async def simulate_trigger(
    request: SimulateTriggerRequest,
    db=Depends(get_admin_db),
):
    """
    Simulate a trigger event for demo/testing purposes.
    Finds active policy holders in the zone, runs fraud detection, processes payouts.
    """
    from app.services.imd_service import process_trigger_events

    zone_info = SIMULATE_ZONE_MAP.get(request.city, SIMULATE_ZONE_MAP["Hyderabad"])

    mock_alert = {
        "city": request.city,
        "zone": zone_info["zone"],
        "lat": zone_info["lat"],
        "lng": zone_info["lng"],
        "severity": "RED",
        "type": request.trigger_type,
        "source": "ADMIN_SIMULATION",
        "title": f"SIMULATED: {request.trigger_type} Alert — {request.city}",
        "description": "Demo simulation for judges. Not a real event.",
        "published": datetime.utcnow().isoformat(),
    }

    events = await process_trigger_events([mock_alert], db)
    total_claims = sum(event.get("claims_count", 0) for event in events)
    total_payouts = await db.claims.count_documents({
        "trigger_event_id": {"$in": [event["_id"] for event in events]},
        "status": "PAID",
    })
    logger.info(
        f"Admin simulated {request.trigger_type} in {request.city}: "
        f"{len(events)} events, {total_claims} claims, {total_payouts} payouts"
    )

    return {
        "success": True,
        "message": f"Simulated {request.trigger_type} in {request.city}",
        "events_created": len(events),
        "claims_created": total_claims,
        "payouts_credited": total_payouts,
        "events": [serialize_doc(e) for e in events],
    }


@router.get("/analytics")
async def get_analytics(
    days: int = Query(30, le=90),
    db=Depends(get_admin_db)
):
    """Full analytics for admin dashboard"""
    since = datetime.utcnow() - timedelta(days=days)

    daily_revenue = await db.payments.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$created_at"
                }
            },
            "amount": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}}
    ]).to_list(90)

    daily_payouts = await db.claims.aggregate([
        {"$match": {
            "status": "PAID",
            "paid_at": {"$gte": since}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$paid_at"
                }
            },
            "amount": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}}
    ]).to_list(90)

    risk_distribution = await db.workers.aggregate([
        {"$bucket": {
            "groupBy": "$risk_score",
            "boundaries": [0, 0.25, 0.50, 0.75, 1.01],
            "default": "other",
            "output": {"count": {"$sum": 1}}
        }}
    ]).to_list(10)

    fraud_distribution = await db.claims.aggregate([
        {"$bucket": {
            "groupBy": "$fraud_score",
            "boundaries": [0, 0.2, 0.4, 0.6, 0.8, 1.01],
            "default": "other",
            "output": {"count": {"$sum": 1}}
        }}
    ]).to_list(10)

    plan_breakdown = await db.policies.aggregate([
        {"$match": {"status": "ACTIVE"}},
        {"$group": {
            "_id": "$plan_id",
            "count": {"$sum": 1},
            "revenue": {"$sum": "$weekly_premium"}
        }}
    ]).to_list(10)

    return {
        "daily_revenue": daily_revenue,
        "daily_payouts": daily_payouts,
        "risk_distribution": risk_distribution,
        "fraud_distribution": fraud_distribution,
        "plan_breakdown": plan_breakdown,
        "period_days": days,
    }


@router.get("/predictive-analytics")
async def get_predictive_analytics(
    db=Depends(get_admin_db)
):
    """
    ML-powered prediction for next week's claims.
    Uses weather forecasts + historical patterns.
    """
    from app.ml.predictive_model import (
        predict_next_week_claims
    )
    import os

    api_key = os.getenv("OPENWEATHER_API_KEY")

    result = await predict_next_week_claims(
        db=db,
        openweather_key=api_key,
    )
    return result
