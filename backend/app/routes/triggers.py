from fastapi import APIRouter, Depends, Query, HTTPException
from app.database import get_db
from app.routes.auth import get_current_worker
from app.utils.formatters import serialize_doc
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/active")
async def get_active_triggers(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get all active trigger events"""
    triggers = await db.trigger_events.find(
        {"status": "ACTIVE"}
    ).sort("started_at", -1).to_list(20)

    return {
        "triggers": [serialize_doc(t) for t in triggers],
        "total": len(triggers)
    }


@router.get("/my-zone")
async def get_my_zone_triggers(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get trigger events for worker's zone"""
    zone = current_worker.get("zone", "")

    triggers = await db.trigger_events.find({
        "zone": zone,
        "status": "ACTIVE"
    }).sort("started_at", -1).to_list(10)

    return {
        "zone": zone,
        "triggers": [serialize_doc(t) for t in triggers],
        "total": len(triggers)
    }


@router.get("/{trigger_id}")
async def get_trigger_detail(
    trigger_id: str,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get trigger event detail"""
    trigger = await db.trigger_events.find_one({"_id": trigger_id})
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")

    return serialize_doc(trigger)
