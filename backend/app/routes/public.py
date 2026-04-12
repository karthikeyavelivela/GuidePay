from fastapi import APIRouter
from app.core.constants import PLANS, TIER_PAYOUT_CAPS, RISK_MODIFIERS

router = APIRouter()

@router.get("/plans")
async def get_public_plans():
    """Serves standard pricing and constants for the frontend marketing/plans page without auth"""
    return {
        "plans": PLANS,
        "payout_caps": TIER_PAYOUT_CAPS,
        "risk_modifiers": RISK_MODIFIERS
    }
