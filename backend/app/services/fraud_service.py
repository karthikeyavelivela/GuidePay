from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


async def calculate_fraud_score(
    worker: dict,
    trigger_event: dict,
    db,
    claim_gps_lat: Optional[float] = None,
    claim_gps_lng: Optional[float] = None,
) -> Dict:
    """
    7-check fraud scoring system.
    Returns score 0.0-1.0 and list of flags.
    Score < 0.70 = auto approve
    Score >= 0.70 = manual review
    """
    score = 0.0
    flags = []
    checks = {}

    worker_id = str(worker["_id"])
    zone_lat = worker.get("zone_lat", 0)
    zone_lng = worker.get("zone_lng", 0)

    # CHECK 1 — Duplicate claim
    existing = await db.claims.find_one({
        "worker_id": worker_id,
        "trigger_event_id": str(trigger_event["_id"]),
        "status": {"$ne": "REJECTED"}
    })
    if existing:
        checks["duplicate"] = {"result": "FAIL", "score": 1.0}
        return {
            "score": 1.0,
            "flags": ["DUPLICATE_CLAIM"],
            "checks": checks,
            "decision": "REJECTED"
        }
    checks["duplicate"] = {"result": "PASS", "score": 0.0}

    # CHECK 2 — GPS distance from zone
    if claim_gps_lat and claim_gps_lng:
        from app.utils.geo import haversine_distance
        distance = haversine_distance(
            claim_gps_lat, claim_gps_lng,
            zone_lat, zone_lng
        )
        if distance > 10:
            score += 0.30
            flags.append("GPS_FAR_FROM_ZONE")
            checks["gps"] = {
                "result": "FAIL",
                "distance_km": distance,
                "score": 0.30
            }
        elif distance > 5:
            score += 0.15
            checks["gps"] = {
                "result": "WARNING",
                "distance_km": distance,
                "score": 0.15
            }
        else:
            checks["gps"] = {
                "result": "PASS",
                "distance_km": distance,
                "score": 0.0
            }

    # CHECK 3 — Activity verification
    last_order = worker.get("last_order_timestamp")
    if last_order:
        trigger_time = trigger_event.get("started_at", datetime.utcnow())
        age_minutes = (trigger_time - last_order).total_seconds() / 60

        if age_minutes > 360:  # 6 hours
            score += 0.25
            flags.append("NO_RECENT_ACTIVITY")
            checks["activity"] = {
                "result": "FAIL",
                "age_minutes": age_minutes,
                "score": 0.25
            }
        elif age_minutes > 240:  # 4 hours
            score += 0.12
            checks["activity"] = {
                "result": "WARNING",
                "age_minutes": age_minutes,
                "score": 0.12
            }
        else:
            checks["activity"] = {
                "result": "PASS",
                "age_minutes": age_minutes,
                "score": 0.0
            }

    # CHECK 4 — Claim frequency
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_claims = await db.claims.count_documents({
        "worker_id": worker_id,
        "created_at": {"$gte": thirty_days_ago},
        "status": {"$ne": "REJECTED"}
    })

    zone_avg_pipeline = [
        {"$match": {
            "created_at": {"$gte": thirty_days_ago},
            "status": {"$ne": "REJECTED"}
        }},
        {"$group": {"_id": "$worker_id", "count": {"$sum": 1}}},
        {"$group": {"_id": None, "avg": {"$avg": "$count"}}}
    ]
    zone_avg_result = await db.claims.aggregate(zone_avg_pipeline).to_list(1)
    zone_avg = (zone_avg_result[0]["avg"] if zone_avg_result else 1.5)

    if recent_claims > zone_avg * 2.5:
        score += 0.20
        flags.append("HIGH_CLAIM_FREQUENCY")
        checks["frequency"] = {
            "result": "FAIL",
            "recent_claims": recent_claims,
            "zone_avg": zone_avg,
            "score": 0.20
        }
    else:
        checks["frequency"] = {
            "result": "PASS",
            "recent_claims": recent_claims,
            "score": 0.0
        }

    # CHECK 5 — Zone correlation (FRAUD REDUCER)
    total_workers = trigger_event.get("total_workers_in_zone", 1)
    claims_count = trigger_event.get("claims_count", 0)

    if total_workers > 0:
        ratio = claims_count / total_workers
        if ratio >= 0.60:
            score -= 0.30  # Strong event confirmation
            checks["correlation"] = {
                "result": "CONFIRMED",
                "ratio": ratio,
                "score": -0.30
            }
        elif ratio < 0.10 and claims_count < 3:
            score += 0.40
            flags.append("LOW_ZONE_CORRELATION")
            checks["correlation"] = {
                "result": "ANOMALY",
                "ratio": ratio,
                "score": 0.40
            }
        else:
            checks["correlation"] = {
                "result": "NORMAL",
                "ratio": ratio,
                "score": 0.0
            }

    # CHECK 6 — Worker risk score
    worker_risk = worker.get("risk_score", 0.75)
    if worker_risk < 0.30:
        score += 0.20
        flags.append("HIGH_RISK_WORKER")
        checks["worker_risk"] = {
            "result": "FAIL",
            "risk_score": worker_risk,
            "score": 0.20
        }
    else:
        checks["worker_risk"] = {
            "result": "PASS",
            "risk_score": worker_risk,
            "score": 0.0
        }

    # CHECK 7 — Account age
    created_at = worker.get("created_at", datetime.utcnow())
    account_age_days = (datetime.utcnow() - created_at).days
    if account_age_days < 7:
        score += 0.15
        flags.append("NEW_ACCOUNT")
        checks["account_age"] = {
            "result": "WARNING",
            "age_days": account_age_days,
            "score": 0.15
        }
    else:
        checks["account_age"] = {
            "result": "PASS",
            "age_days": account_age_days,
            "score": 0.0
        }

    # Clamp score
    final_score = round(max(0.0, min(1.0, score)), 3)
    decision = "AUTO_APPROVED" if final_score < 0.70 else "MANUAL_REVIEW"

    return {
        "score": final_score,
        "flags": flags,
        "checks": checks,
        "decision": decision,
    }
