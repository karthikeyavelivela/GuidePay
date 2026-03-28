from typing import Dict

# Zone risk configuration
ZONE_RISK = {
    "kondapur-hyderabad": {
        "flood": 0.85, "curfew": 0.25, "outage": 0.40,
        "city": "Hyderabad", "lat": 17.4401, "lng": 78.3489
    },
    "kurla-mumbai": {
        "flood": 0.80, "curfew": 0.30, "outage": 0.45,
        "city": "Mumbai", "lat": 19.0728, "lng": 72.8826
    },
    "koramangala-bengaluru": {
        "flood": 0.40, "curfew": 0.20, "outage": 0.55,
        "city": "Bengaluru", "lat": 12.9352, "lng": 77.6245
    },
    "tnagar-chennai": {
        "flood": 0.60, "curfew": 0.25, "outage": 0.35,
        "city": "Chennai", "lat": 13.0418, "lng": 80.2341
    },
    "dwarka-delhi": {
        "flood": 0.25, "curfew": 0.65, "outage": 0.30,
        "city": "Delhi", "lat": 28.5921, "lng": 77.0460
    },
}

BASE_PREMIUM = 49.0
COVERAGE_CAP = 600.0
TARGET_LOSS_RATIO = 0.65


def get_zone_multiplier(zone: str) -> float:
    """Calculate zone risk multiplier 0.8-1.4"""
    risk = ZONE_RISK.get(zone)
    if not risk:
        return 1.0
    multiplier = (
        1 +
        (risk["flood"] * 0.50) +
        (risk["curfew"] * 0.30) +
        (risk["outage"] * 0.20)
    )
    return round(multiplier, 2)


def get_worker_multiplier(risk_score: float) -> float:
    """Calculate worker risk multiplier 0.85-1.15"""
    if risk_score > 0.75:
        return 0.85
    elif risk_score >= 0.50:
        return 1.00
    else:
        return 1.15


def calculate_premium(zone: str, risk_score: float) -> float:
    """Calculate final weekly premium"""
    zone_mult = get_zone_multiplier(zone)
    worker_mult = get_worker_multiplier(risk_score)
    premium = BASE_PREMIUM * zone_mult * worker_mult
    return round(premium, 2)


def get_premium_breakdown(zone: str, risk_score: float) -> Dict:
    """Get detailed premium breakdown"""
    zone_mult = get_zone_multiplier(zone)
    worker_mult = get_worker_multiplier(risk_score)

    zone_adj = round(BASE_PREMIUM * (zone_mult - 1), 2)
    worker_adj = round(BASE_PREMIUM * zone_mult * (worker_mult - 1), 2)
    total = round(BASE_PREMIUM * zone_mult * worker_mult, 2)

    return {
        "base": BASE_PREMIUM,
        "zone_multiplier": zone_mult,
        "worker_multiplier": worker_mult,
        "zone_adjustment": zone_adj,
        "worker_adjustment": worker_adj,
        "total": total,
        "coverage_cap": COVERAGE_CAP,
    }
