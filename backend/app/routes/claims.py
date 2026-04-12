from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import get_db
from app.routes.auth import get_current_worker
from app.utils.formatters import serialize_doc
from datetime import datetime
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/my")
async def get_my_claims(
    status: Optional[str] = None,
    limit: int = Query(20, le=100),
    skip: int = 0,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get all claims for current worker"""
    worker_id = str(current_worker["_id"])

    query = {"worker_id": worker_id}
    if status:
        query["status"] = status

    claims = await db.claims.find(query).sort(
        "created_at", -1
    ).skip(skip).limit(limit).to_list(limit)

    total = await db.claims.count_documents(query)

    enriched = []
    for claim in claims:
        trigger = await db.trigger_events.find_one({
            "_id": claim.get("trigger_event_id")
        })
        doc = serialize_doc(claim)
        doc["trigger_event"] = serialize_doc(trigger) if trigger else None
        enriched.append(doc)

    return {
        "claims": enriched,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{claim_id}")
async def get_claim_detail(
    claim_id: str,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get detailed claim status"""
    worker_id = str(current_worker["_id"])

    claim = await db.claims.find_one({"_id": claim_id})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if claim["worker_id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    trigger = await db.trigger_events.find_one({
        "_id": claim.get("trigger_event_id")
    })

    doc = serialize_doc(claim)
    doc["trigger_event"] = serialize_doc(trigger) if trigger else None
    return doc

@router.get("/blockchain/audit-ledger")
async def get_audit_ledger(
    limit: int = 50,
    db=Depends(get_db)
):
    """Fetch the blockchain audit ledger to verify immutability."""
    logs = await db.payout_audit_logs.find().sort("created_at", -1).limit(limit).to_list(limit)
    return {
        "ledger": [serialize_doc(log) for log in logs]
    }
