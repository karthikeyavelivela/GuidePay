"""
Model training script — run offline to train XGBoost models.
In production, trained models are loaded from disk.

Usage:
    python -m app.ml.train_models
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)


def generate_synthetic_training_data(n_samples: int = 1000):
    """Generate synthetic training data for fraud detection"""
    np.random.seed(42)

    # Features: [account_age, claim_count, avg_fraud, platforms, upi, risk_score]
    X = np.column_stack([
        np.random.exponential(1.0, n_samples),  # account age (years)
        np.random.poisson(2, n_samples),         # claim count
        np.random.beta(2, 5, n_samples),          # avg fraud score (skewed low)
        np.random.randint(1, 7, n_samples) / 6,  # platforms
        np.random.binomial(1, 0.7, n_samples),   # upi linked
        np.random.beta(5, 2, n_samples),          # risk score (skewed high)
    ])

    # Labels: fraud based on features
    fraud_prob = (
        0.3 * (1 - X[:, 0]) +   # newer accounts
        0.2 * (X[:, 2]) +        # higher fraud score history
        0.1 * np.random.random(n_samples)  # noise
    )
    y = (fraud_prob > 0.35).astype(int)

    return X, y


def train_flood_model():
    """Train XGBoost flood prediction model"""
    try:
        import xgboost as xgb
        logger.info("Training flood prediction model...")

        # In production: load real IMD historical data
        np.random.seed(42)
        n = 500

        X = np.column_stack([
            np.random.randint(1, 13, n),         # month
            np.random.uniform(0, 1, n),           # monsoon intensity
            np.random.randint(1, 10, n),          # historical floods
            np.random.uniform(5, 1000, n),        # elevation
        ])

        y = (
            (X[:, 0] >= 6) & (X[:, 0] <= 9) &   # monsoon months
            (X[:, 3] < 100)                        # low elevation
        ).astype(float)

        model = xgb.XGBClassifier(
            n_estimators=50,
            max_depth=4,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        model.fit(X, y)
        model.save_model("app/ml/flood_model.json")
        logger.info("Flood model trained and saved")
        return model

    except ImportError:
        logger.warning("XGBoost not available — using rule-based model")
        return None


def train_fraud_model():
    """Train XGBoost fraud detection model"""
    try:
        import xgboost as xgb
        logger.info("Training fraud detection model...")

        X, y = generate_synthetic_training_data(1000)

        model = xgb.XGBClassifier(
            n_estimators=50,
            max_depth=4,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric='logloss',
            scale_pos_weight=5,  # class imbalance
        )
        model.fit(X, y)
        model.save_model("app/ml/fraud_model.json")
        logger.info("Fraud model trained and saved")
        return model

    except ImportError:
        logger.warning("XGBoost not available — using rule-based model")
        return None


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_flood_model()
    train_fraud_model()
    logger.info("All models trained successfully")
