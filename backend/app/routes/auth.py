from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.config import settings
from app.database import get_db
from app.services.firebase_service import verify_firebase_token
from app.services.auth_service import create_access_token, decode_token
import logging

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)


class FirebaseAuthRequest(BaseModel):
    firebase_token: str
    name: Optional[str] = None
    phone: Optional[str] = None


class CreateUserRequest(BaseModel):
    firebase_token: str
    name: str
    phone: Optional[str] = ""
    city: str
    zone: str
    upi_id: Optional[str] = None
    zone_lat: float = 0.0
    zone_lng: float = 0.0


class DirectSignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    city: str
    zone: str
    upi_id: Optional[str] = None
    zone_lat: float = 0.0
    zone_lng: float = 0.0


class DirectLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


async def get_current_worker(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("role") != "worker":
        raise HTTPException(status_code=403, detail="Worker token required")

    worker_id = payload.get("sub")
    if not worker_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    worker = await db.workers.find_one({"_id": worker_id})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = decode_token(credentials.credentials)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin token required")
    return payload


@router.post("/login")
async def login(request: FirebaseAuthRequest, db=Depends(get_db)):
    """
    Verify Firebase token and return JWT + worker data.
    If worker doesn't exist yet, auto-create a minimal profile and redirect to complete-profile.
    """
    try:
        firebase_user = await verify_firebase_token(request.firebase_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    worker = await db.workers.find_one({"firebase_uid": firebase_user["uid"]})

    if worker is None:
        # Auto-create a minimal worker profile so the frontend gets a valid token
        from bson import ObjectId
        worker_id = str(ObjectId())
        stored_phone = request.phone.strip() if request.phone and request.phone.strip() else f"temp_{worker_id[:12]}"

        worker = {
            "_id": worker_id,
            "firebase_uid": firebase_user["uid"],
            "name": request.name or firebase_user.get("name") or "Worker",
            "phone": stored_phone,
            "email": firebase_user.get("email"),
            "photo_url": firebase_user.get("photo_url"),
            "city": None,
            "zone": None,
            "upi_id": None,
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
        try:
            await db.workers.insert_one(worker)
        except Exception:
            # In case of race condition (duplicate insert), fetch the existing one
            worker = await db.workers.find_one({"firebase_uid": firebase_user["uid"]})
            if not worker:
                raise HTTPException(status_code=500, detail="Failed to create worker profile")

    access_token = create_access_token(
        subject=str(worker["_id"]),
        uid=firebase_user["uid"],
        role="worker",
    )

    requires_profile = not worker.get("city") or not worker.get("zone")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": not worker.get("city"),
        "requires_profile": requires_profile,
        "worker": {
            "id": str(worker["_id"]),
            "firebase_uid": worker.get("firebase_uid"),
            "name": worker.get("name"),
            "phone": worker.get("phone"),
            "email": worker.get("email"),
            "city": worker.get("city"),
            "zone": worker.get("zone"),
            "upi_id": worker.get("upi_id"),
            "platforms": worker.get("platforms", []),
            "risk_score": worker.get("risk_score", 0.75),
            "premium_amount": worker.get("premium_amount", 58.0),
            "photo_url": worker.get("photo_url"),
        }
    }


@router.get("/user/{uid}")
async def get_user_by_uid(uid: str, db=Depends(get_db)):
    worker = await db.workers.find_one({"firebase_uid": uid})
    return {
        "user": {
            "id": str(worker["_id"]),
            "firebase_uid": worker.get("firebase_uid"),
            "name": worker.get("name"),
            "phone": worker.get("phone"),
            "email": worker.get("email"),
            "city": worker.get("city"),
            "zone": worker.get("zone"),
            "upi_id": worker.get("upi_id"),
            "platforms": worker.get("platforms", []),
            "risk_score": worker.get("risk_score", 0.75),
            "premium_amount": worker.get("premium_amount", 58.0),
            "photo_url": worker.get("photo_url"),
        } if worker else None
    }


@router.post("/create-user")
async def create_user(request: CreateUserRequest, db=Depends(get_db)):
    try:
        firebase_user = await verify_firebase_token(request.firebase_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    # If user already exists in backend, return their data instead of 409
    existing = await db.workers.find_one({"firebase_uid": firebase_user["uid"]})
    if existing:
        access_token = create_access_token(
            subject=str(existing["_id"]),
            uid=firebase_user["uid"],
            role="worker",
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "is_new_user": False,
            "requires_profile": not existing.get("city") or not existing.get("zone"),
            "worker": {
                "id": str(existing["_id"]),
                "firebase_uid": existing.get("firebase_uid"),
                "name": existing.get("name"),
                "phone": existing.get("phone"),
                "email": existing.get("email"),
                "city": existing.get("city"),
                "zone": existing.get("zone"),
                "upi_id": existing.get("upi_id"),
                "platforms": existing.get("platforms", []),
                "risk_score": existing.get("risk_score", 0.75),
                "premium_amount": existing.get("premium_amount", 58.0),
                "photo_url": existing.get("photo_url"),
            }
        }

    # Only check phone uniqueness if a real phone number was provided
    phone_value = request.phone.strip() if request.phone else ""
    if phone_value and not phone_value.startswith("temp_"):
        existing_phone = await db.workers.find_one({"phone": phone_value})
        if existing_phone:
            raise HTTPException(status_code=409, detail="Phone number already registered")

    from bson import ObjectId
    worker_id = str(ObjectId())

    import h3
    h3_zone = h3.geo_to_h3(request.zone_lat, request.zone_lng, 7) if request.zone_lat else None

    worker_email = firebase_user.get("email")

    # Store a unique placeholder if no real phone provided
    stored_phone = phone_value if phone_value else f"temp_{worker_id[:12]}"

    worker_doc = {
        "_id": worker_id,
        "firebase_uid": firebase_user["uid"],
        "name": request.name,
        "phone": stored_phone,
        "email": worker_email,
        "photo_url": firebase_user.get("photo_url"),
        "city": request.city,
        "zone": request.zone,
        "upi_id": request.upi_id,
        "zone_lat": request.zone_lat,
        "zone_lng": request.zone_lng,
        "h3_zone": h3_zone,
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

    access_token = create_access_token(
        subject=str(worker_doc["_id"]),
        uid=firebase_user["uid"],
        role="worker",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": True,
        "requires_profile": False,
        "worker": {
            "id": str(worker_doc["_id"]),
            "firebase_uid": worker_doc.get("firebase_uid"),
            "name": worker_doc.get("name"),
            "phone": worker_doc.get("phone"),
            "email": worker_doc.get("email"),
            "city": worker_doc.get("city"),
            "zone": worker_doc.get("zone"),
            "upi_id": worker_doc.get("upi_id"),
            "platforms": worker_doc.get("platforms", []),
            "risk_score": worker_doc.get("risk_score", 0.75),
            "premium_amount": worker_doc.get("premium_amount", 58.0),
            "photo_url": worker_doc.get("photo_url"),
        }
    }


@router.post("/direct-signup")
async def direct_signup(request: DirectSignupRequest, db=Depends(get_db)):
    """
    Direct signup without Firebase. Uses email + password stored in MongoDB.
    For competition demo when Firebase keys are unavailable.
    """
    import hashlib

    existing = await db.workers.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
        
    if request.phone:
        existing_phone = await db.workers.find_one({"phone": request.phone})
        if existing_phone:
            raise HTTPException(status_code=409, detail="Phone number already registered")

    from bson import ObjectId
    worker_id = str(ObjectId())
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    import h3
    h3_zone = h3.geo_to_h3(request.zone_lat, request.zone_lng, 7) if request.zone_lat else None

    worker_doc = {
        "_id": worker_id,
        "name": request.name,
        "email": request.email,
        "password_hash": password_hash,
        "phone": request.phone if request.phone else f"temp_{worker_id[:8]}",
        "city": request.city,
        "zone": request.zone,
        "upi_id": request.upi_id,
        "zone_lat": request.zone_lat,
        "zone_lng": request.zone_lng,
        "h3_zone": h3_zone,
        "platforms": [],
        "risk_score": 0.75,
        "risk_tier": "MEDIUM",
        "premium_amount": 58.0,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "total_claims": 0,
        "total_payouts": 0.0,
        "firebase_uid": f"temp_uid_{worker_id}", # Prevent DuplicateKeyError for missing Firebase UIDs
        "photo_url": None, # Match schema with Google signup
    }
    await db.workers.insert_one(worker_doc)

    access_token = create_access_token(
        subject=worker_id,
        uid=worker_id,
        role="worker",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": True,
        "requires_profile": False,
        "worker": {
            "id": str(worker_doc["_id"]),
            "firebase_uid": worker_doc.get("firebase_uid"),
            "name": worker_doc.get("name"),
            "phone": worker_doc.get("phone"),
            "email": worker_doc.get("email"),
            "city": worker_doc.get("city"),
            "zone": worker_doc.get("zone"),
            "upi_id": worker_doc.get("upi_id"),
            "platforms": worker_doc.get("platforms", []),
            "risk_score": worker_doc.get("risk_score", 0.75),
            "premium_amount": worker_doc.get("premium_amount", 58.0),
            "photo_url": worker_doc.get("photo_url"),
        }
    }


@router.post("/direct-login")
async def direct_login(request: DirectLoginRequest, db=Depends(get_db)):
    """
    Direct login without Firebase. Matches email + password hash.
    """
    import hashlib

    worker = await db.workers.find_one({"email": request.email})
    if not worker:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if worker.get("password_hash") != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        subject=str(worker["_id"]),
        uid=str(worker["_id"]),
        role="worker",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": False,
        "requires_profile": not worker.get("city") or not worker.get("zone"),
        "worker": {
            "id": str(worker["_id"]),
            "name": worker.get("name"),
            "email": worker.get("email"),
            "phone": worker.get("phone"),
            "city": worker.get("city"),
            "zone": worker.get("zone"),
            "upi_id": worker.get("upi_id"),
            "platforms": worker.get("platforms", []),
            "risk_score": worker.get("risk_score", 0.75),
            "premium_amount": worker.get("premium_amount", 58.0),
            "photo_url": worker.get("photo_url"),
        }
    }


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    if (
        request.username != settings.admin_username
        or request.password != settings.admin_password
    ):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = create_access_token(
        subject=request.username,
        role="admin",
        expires_minutes=settings.admin_access_token_expire_minutes,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin",
        "username": request.username,
    }
