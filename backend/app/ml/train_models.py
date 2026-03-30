"""
Train real ML models for Guide-Pay.
Run once: python -m app.ml.train_models
Uses scikit-learn — no GPU needed.
Data: synthetic, based on real NDMA/IMD statistics 2019-2024.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import (
    GradientBoostingClassifier,
    RandomForestRegressor,
    IsolationForest,
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import os
import logging

logger = logging.getLogger(__name__)

ZONE_TRAINING_DATA = {
    "kondapur-hyderabad": {
        "flood_events_5yr": 9,
        "waterlogging_5yr": 23,
        "elevation_m": 487,
        "drainage_score": 0.55,
        "avg_rainfall_mm": 820,
        "historical_loss_ratio": 0.68,
    },
    "kurla-mumbai": {
        "flood_events_5yr": 12,
        "waterlogging_5yr": 45,
        "elevation_m": 11,
        "drainage_score": 0.35,
        "avg_rainfall_mm": 2400,
        "historical_loss_ratio": 0.82,
    },
    "koramangala-bengaluru": {
        "flood_events_5yr": 2,
        "waterlogging_5yr": 8,
        "elevation_m": 920,
        "drainage_score": 0.78,
        "avg_rainfall_mm": 970,
        "historical_loss_ratio": 0.22,
    },
    "tnagar-chennai": {
        "flood_events_5yr": 7,
        "waterlogging_5yr": 18,
        "elevation_m": 6,
        "drainage_score": 0.48,
        "avg_rainfall_mm": 1400,
        "historical_loss_ratio": 0.58,
    },
    "dwarka-delhi": {
        "flood_events_5yr": 3,
        "waterlogging_5yr": 12,
        "elevation_m": 216,
        "drainage_score": 0.62,
        "avg_rainfall_mm": 790,
        "historical_loss_ratio": 0.38,
    },
}


def _monsoon_factor(month: int) -> float:
    factors = {
        1: 0.02, 2: 0.03, 3: 0.05,
        4: 0.10, 5: 0.28, 6: 0.72,
        7: 0.95, 8: 0.90, 9: 0.65,
        10: 0.32, 11: 0.10, 12: 0.04,
    }
    return factors.get(month, 0.1)


def generate_training_data(n_samples: int = 5000) -> pd.DataFrame:
    """Generate synthetic training data based on real statistical distributions."""
    np.random.seed(42)
    records = []
    zones = list(ZONE_TRAINING_DATA.keys())

    for _ in range(n_samples):
        zone_key = np.random.choice(zones)
        z = ZONE_TRAINING_DATA[zone_key]
        month = np.random.randint(1, 13)
        monsoon = _monsoon_factor(month)

        risk_score = np.random.beta(5, 2)
        experience_months = np.random.exponential(18)
        claim_history_30d = np.random.poisson(0.3)

        rainfall_mm = (
            z["avg_rainfall_mm"] / 12 * monsoon
            * np.random.lognormal(0, 0.5)
        )
        gps_distance_km = np.random.exponential(2)

        # Fraud label (real fraud rate ~8-12%)
        base_fraud_prob = 0.08
        if gps_distance_km > 10:
            base_fraud_prob += 0.25
        if claim_history_30d > 3:
            base_fraud_prob += 0.20
        if experience_months < 30:
            base_fraud_prob += 0.05
        if risk_score < 0.4:
            base_fraud_prob += 0.15
        is_fraud = int(np.random.random() < base_fraud_prob)

        # Flood probability label
        flood_prob = (
            (z["flood_events_5yr"] / 12) * 0.25
            + monsoon * 0.40
            + max(0, 1 - z["elevation_m"] / 800) * 0.20
            + (rainfall_mm / 100) * 0.15
        )
        flood_prob = min(0.95, max(0.02, flood_prob))
        is_flood = int(np.random.random() < flood_prob)

        # Premium label (actuarially fair)
        zone_mult = 0.8 + z["historical_loss_ratio"] * 0.9
        worker_mult = (
            0.85 if risk_score > 0.8
            else 1.0 if risk_score > 0.5
            else 1.12
        )
        fair_premium = int(49 * zone_mult * worker_mult)

        records.append({
            "flood_events_5yr": z["flood_events_5yr"],
            "waterlogging_5yr": z["waterlogging_5yr"],
            "elevation_m": z["elevation_m"],
            "drainage_score": z["drainage_score"],
            "avg_rainfall_mm": z["avg_rainfall_mm"],
            "month": month,
            "monsoon_intensity": monsoon,
            "risk_score": risk_score,
            "experience_months": min(experience_months, 120),
            "claim_history_30d": claim_history_30d,
            "rainfall_mm": rainfall_mm,
            "gps_distance_km": gps_distance_km,
            "is_fraud": is_fraud,
            "is_flood": is_flood,
            "fair_premium": fair_premium,
        })

    return pd.DataFrame(records)


def train_fraud_model(df: pd.DataFrame):
    features = [
        "risk_score", "experience_months",
        "claim_history_30d", "gps_distance_km",
        "month", "monsoon_intensity",
    ]
    X, y = df[features], df["is_fraud"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.1,
            max_depth=4, random_state=42,
        )),
    ])
    model.fit(X_train, y_train)
    logger.info(f"Fraud model accuracy: {model.score(X_test, y_test):.3f}")
    return model


def train_flood_model(df: pd.DataFrame):
    features = [
        "flood_events_5yr", "waterlogging_5yr",
        "elevation_m", "drainage_score",
        "avg_rainfall_mm", "month",
        "monsoon_intensity", "rainfall_mm",
    ]
    X, y = df[features], df["is_flood"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.08,
            max_depth=3, random_state=42,
        )),
    ])
    model.fit(X_train, y_train)
    logger.info(f"Flood model accuracy: {model.score(X_test, y_test):.3f}")
    return model


def train_premium_model(df: pd.DataFrame):
    features = [
        "flood_events_5yr", "waterlogging_5yr",
        "elevation_m", "drainage_score",
        "avg_rainfall_mm", "month",
        "monsoon_intensity", "risk_score",
        "experience_months",
    ]
    X, y = df[features], df["fair_premium"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("reg", RandomForestRegressor(
            n_estimators=100, max_depth=6, random_state=42,
        )),
    ])
    model.fit(X_train, y_train)
    logger.info(f"Premium model R2: {model.score(X_test, y_test):.3f}")
    return model


def train_anomaly_model(df: pd.DataFrame):
    features = [
        "risk_score", "claim_history_30d",
        "gps_distance_km", "monsoon_intensity",
    ]
    X = df[df["is_fraud"] == 0][features]
    model = IsolationForest(
        contamination=0.1, random_state=42, n_estimators=100
    )
    model.fit(X)
    return model


def train_and_save_all() -> dict:
    """Train all models and save to disk. Returns loaded models dict."""
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    logger.info("Generating training data (5000 samples)...")
    df = generate_training_data(5000)

    logger.info("Training fraud detection model...")
    fraud_model = train_fraud_model(df)
    joblib.dump(fraud_model, os.path.join(models_dir, "fraud_model.pkl"))

    logger.info("Training flood probability model...")
    flood_model = train_flood_model(df)
    joblib.dump(flood_model, os.path.join(models_dir, "flood_model.pkl"))

    logger.info("Training premium regression model...")
    premium_model = train_premium_model(df)
    joblib.dump(premium_model, os.path.join(models_dir, "premium_model.pkl"))

    logger.info("Training anomaly detector...")
    anomaly_model = train_anomaly_model(df)
    joblib.dump(anomaly_model, os.path.join(models_dir, "anomaly_model.pkl"))

    logger.info("All 4 models trained and saved to app/ml/models/")
    return {
        "fraud": fraud_model,
        "flood": flood_model,
        "premium": premium_model,
        "anomaly": anomaly_model,
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_and_save_all()
    print("Done — models saved to backend/app/ml/models/")
