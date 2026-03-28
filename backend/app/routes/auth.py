from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import settings
from app.database import get_db
from app.services.firebase_service import verify_firebase_token
import logging

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)


class FirebaseAuthRequest(BaseModel):
    firebase_token: str
    name: Optional[str] = None
    phone: Optional[str] = None


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )


async def get_current_worker(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        worker_id = payload.get("sub")
        if not worker_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        worker = await db.workers.find_one({"_id": worker_id})
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        return worker
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/login")
async def login(request: FirebaseAuthRequest, db=Depends(get_db)):
    """
    Verify Firebase token and return JWT + worker data.
    Creates worker if first time.
    """
    try:
        firebase_user = await verify_firebase_token(request.firebase_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    worker = await db.workers.find_one({
        "firebase_uid": firebase_user["uid"]
    })

    is_new_user = worker is None

    if is_new_user:
        from bson import ObjectId
        worker_doc = {
            "_id": str(ObjectId()),
            "firebase_uid": firebase_user["uid"],
            "name": (request.name
                     or firebase_user.get("name")
                     or "Delivery Partner"),
            "phone": (request.phone
                      or firebase_user.get("phone")
                      or ""),
            "email": firebase_user.get("email"),
            "photo_url": firebase_user.get("photo_url"),
            "city": "",
            "zone": "",
            "zone_lat": 0.0,
            "zone_lng": 0.0,
            "platforms": [],
            "risk_score": 0.75,
            "risk_tier": "MEDIUM",
            "premium_amount": 58.0,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "total_claims": 0,
            "total_payouts": 0.0,
        }
        await db.workers.insert_one(worker_doc)
        worker = worker_doc

    access_token = create_access_token({
        "sub": str(worker["_id"]),
        "uid": firebase_user["uid"],
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "worker": {
            "id": str(worker["_id"]),
            "name": worker.get("name"),
            "phone": worker.get("phone"),
            "email": worker.get("email"),
            "city": worker.get("city"),
            "zone": worker.get("zone"),
            "platforms": worker.get("platforms", []),
            "risk_score": worker.get("risk_score", 0.75),
            "premium_amount": worker.get("premium_amount", 58.0),
            "photo_url": worker.get("photo_url"),
        }
    }


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
