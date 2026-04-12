from fastapi import APIRouter, Depends
from app.routes.auth import get_current_worker

router = APIRouter()


@router.get("/feature-importance")
async def get_premium_feature_importance(
    current_worker=Depends(get_current_worker),
):
    """Feature importance for the premium RandomForest model."""
    from app.ml.ml_service import get_feature_importance
    return get_feature_importance("premium")


@router.get("/fraud-feature-importance")
async def get_fraud_feature_importance(
    current_worker=Depends(get_current_worker),
):
    """Feature importance for the fraud GradientBoosting model."""
    from app.ml.ml_service import get_feature_importance
    return get_feature_importance("fraud")
