"""
ML service — loads trained models and makes predictions.
Falls back to rule-based calculations if models not found.
"""
import joblib
import numpy as np
import os
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

_models: dict = {}


def load_models() -> None:
    """Load all trained models into memory. Call once at startup."""
    global _models
    model_files = {
        "fraud": "fraud_model.pkl",
        "flood": "flood_model.pkl",
        "premium": "premium_model.pkl",
        "anomaly": "anomaly_model.pkl",
    }
    for name, filename in model_files.items():
        path = os.path.join(MODELS_DIR, filename)
        if os.path.exists(path):
            try:
                _models[name] = joblib.load(path)
                logger.info(f"Loaded {name} model")
            except Exception as e:
                logger.warning(f"Could not load {name} model: {e}")
        else:
            logger.warning(f"Model not found: {path} — using rule-based fallback")


def get_monsoon_factor(month: int) -> float:
    factors = {
        1: 0.02, 2: 0.03, 3: 0.05,
        4: 0.10, 5: 0.28, 6: 0.72,
        7: 0.95, 8: 0.90, 9: 0.65,
        10: 0.32, 11: 0.10, 12: 0.04,
    }
    return factors.get(month, 0.1)


ZONE_FEATURES = {
    "kondapur-hyderabad": {
        "flood_events_5yr": 9, "waterlogging_5yr": 23,
        "elevation_m": 487, "drainage_score": 0.55,
        "avg_rainfall_mm": 820,
    },
    "kurla-mumbai": {
        "flood_events_5yr": 12, "waterlogging_5yr": 45,
        "elevation_m": 11, "drainage_score": 0.35,
        "avg_rainfall_mm": 2400,
    },
    "koramangala-bengaluru": {
        "flood_events_5yr": 2, "waterlogging_5yr": 8,
        "elevation_m": 920, "drainage_score": 0.78,
        "avg_rainfall_mm": 970,
    },
    "tnagar-chennai": {
        "flood_events_5yr": 7, "waterlogging_5yr": 18,
        "elevation_m": 6, "drainage_score": 0.48,
        "avg_rainfall_mm": 1400,
    },
    "dwarka-delhi": {
        "flood_events_5yr": 3, "waterlogging_5yr": 12,
        "elevation_m": 216, "drainage_score": 0.62,
        "avg_rainfall_mm": 790,
    },
}


def predict_premium(
    zone: str,
    risk_score: float,
    month: Optional[int] = None,
    rainfall_mm: Optional[float] = None,
) -> dict:
    """Predict premium using trained ML model or rule-based fallback."""
    if month is None:
        month = datetime.utcnow().month
    monsoon = get_monsoon_factor(month)
    zone_feats = ZONE_FEATURES.get(zone, ZONE_FEATURES["kondapur-hyderabad"])

    if rainfall_mm is None:
        rainfall_mm = zone_feats["avg_rainfall_mm"] / 12 * monsoon

    if "premium" in _models:
        try:
            features = np.array([[
                zone_feats["flood_events_5yr"],
                zone_feats["waterlogging_5yr"],
                zone_feats["elevation_m"],
                zone_feats["drainage_score"],
                zone_feats["avg_rainfall_mm"],
                month, monsoon, risk_score,
                12,  # default experience months
            ]])
            predicted = float(_models["premium"].predict(features)[0])
            premium = int(max(35, min(89, predicted)))
            model_used = "GradientBoosting_ML"
        except Exception as e:
            logger.warning(f"Premium model prediction failed: {e}")
            premium, model_used = _rule_based_premium(zone_feats, risk_score, monsoon)
    else:
        premium, model_used = _rule_based_premium(zone_feats, risk_score, monsoon)

    base = 49
    zone_adj = premium - base
    worker_adj = -7 if risk_score > 0.80 else (-3 if risk_score > 0.65 else 0)
    final = max(35, premium + worker_adj)

    return {
        "final_premium": final,
        "base_premium": base,
        "zone_adjustment": zone_adj,
        "worker_adjustment": worker_adj,
        "coverage_cap": 600,
        "model_used": model_used,
        "zone": zone,
        "risk_score": risk_score,
        "month": month,
        "monsoon_intensity": round(monsoon, 2),
        "is_monsoon_season": monsoon > 0.5,
        "factors": {
            "flood_history": round(min(zone_feats["flood_events_5yr"] / 12, 1.0), 2),
            "waterlogging": round(min(zone_feats["waterlogging_5yr"] / 40, 1.0), 2),
            "elevation_risk": round(max(0, 1 - zone_feats["elevation_m"] / 800), 2),
            "drainage_quality": round(1 - zone_feats["drainage_score"], 2),
            "monsoon_season": round(monsoon, 2),
        },
    }


def _rule_based_premium(zone_feats: dict, risk_score: float, monsoon: float):
    zone_risk = (
        min(zone_feats["flood_events_5yr"] / 12, 1) * 0.35
        + max(0, 1 - zone_feats["elevation_m"] / 800) * 0.25
        + (1 - zone_feats["drainage_score"]) * 0.20
        + monsoon * 0.20
    )
    zone_mult = 0.80 + zone_risk * 0.70
    premium = int(49 * zone_mult)
    return premium, "rule_based_fallback"


def predict_flood_probability(
    zone: str,
    rainfall_mm: Optional[float] = None,
    month: Optional[int] = None,
) -> dict:
    """Predict flood probability for a zone."""
    if month is None:
        month = datetime.utcnow().month
    monsoon = get_monsoon_factor(month)
    zone_feats = ZONE_FEATURES.get(zone, ZONE_FEATURES["kondapur-hyderabad"])

    if rainfall_mm is None:
        rainfall_mm = zone_feats["avg_rainfall_mm"] / 12 * monsoon * 1.2

    if "flood" in _models:
        try:
            features = np.array([[
                zone_feats["flood_events_5yr"],
                zone_feats["waterlogging_5yr"],
                zone_feats["elevation_m"],
                zone_feats["drainage_score"],
                zone_feats["avg_rainfall_mm"],
                month, monsoon, rainfall_mm,
            ]])
            prob = float(_models["flood"].predict_proba(features)[0][1])
            model_used = "GradientBoosting_ML"
        except Exception as e:
            logger.warning(f"Flood model failed: {e}")
            prob = _rule_based_flood(zone_feats, monsoon)
            model_used = "rule_based_fallback"
    else:
        prob = _rule_based_flood(zone_feats, monsoon)
        model_used = "rule_based_fallback"

    prob = max(0.02, min(0.97, prob))
    return {
        "probability": round(prob, 3),
        "probability_percent": round(prob * 100, 1),
        "risk_level": "HIGH" if prob > 0.65 else ("MEDIUM" if prob > 0.35 else "LOW"),
        "rainfall_mm": round(rainfall_mm, 1),
        "model_used": model_used,
        "zone": zone,
        "month": month,
        "inputs": {
            "flood_events_5yr": zone_feats["flood_events_5yr"],
            "elevation_m": zone_feats["elevation_m"],
            "monsoon_intensity": round(monsoon, 2),
        },
    }


def _rule_based_flood(zone_feats: dict, monsoon: float) -> float:
    return (
        min(zone_feats["flood_events_5yr"] / 12, 1) * 0.35
        + max(0, 1 - zone_feats["elevation_m"] / 800) * 0.25
        + monsoon * 0.30
        + (1 - zone_feats["drainage_score"]) * 0.10
    )


def predict_fraud_score(worker: dict, claim: dict, trigger: dict) -> dict:
    """Predict fraud probability for a claim."""
    risk_score = worker.get("risk_score", 0.75)
    experience = worker.get("experience_months", 12)

    last_order = worker.get("last_order_timestamp")
    if last_order:
        try:
            age_min = (datetime.utcnow() - last_order).total_seconds() / 60
        except Exception:
            age_min = 999
    else:
        age_min = 999

    gps_dist = claim.get("gps_distance_km", 2.0)
    claim_freq = claim.get("recent_claims_30d", 0)

    if "fraud" in _models:
        try:
            month = datetime.utcnow().month
            monsoon = get_monsoon_factor(month)
            features = np.array([[
                risk_score,
                min(experience, 120),
                min(claim_freq, 10),
                min(gps_dist, 30),
                month,
                monsoon,
            ]])
            fraud_prob = float(_models["fraud"].predict_proba(features)[0][1])
            model_used = "GradientBoosting_ML"
        except Exception as e:
            logger.warning(f"Fraud model failed: {e}")
            fraud_prob = _rule_based_fraud(risk_score, gps_dist, claim_freq, age_min)
            model_used = "rule_based_fallback"
    else:
        fraud_prob = _rule_based_fraud(risk_score, gps_dist, claim_freq, age_min)
        model_used = "rule_based_fallback"

    fraud_prob = max(0.01, min(0.99, fraud_prob))
    decision = "AUTO_APPROVED" if fraud_prob < 0.70 else "MANUAL_REVIEW"

    return {
        "score": round(fraud_prob, 3),
        "decision": decision,
        "model_used": model_used,
        "factors": {
            "risk_score": risk_score,
            "gps_distance_km": gps_dist,
            "last_order_age_minutes": round(age_min),
            "claim_frequency": claim_freq,
        },
    }


def _rule_based_fraud(
    risk_score: float, gps_dist: float,
    claim_freq: int, age_min: float
) -> float:
    score = 0.0
    if gps_dist > 10:
        score += 0.30
    elif gps_dist > 5:
        score += 0.15
    if age_min > 360:
        score += 0.25
    elif age_min > 240:
        score += 0.12
    if claim_freq > 3:
        score += 0.20
    if risk_score < 0.40:
        score += 0.15
    return min(0.95, score)
