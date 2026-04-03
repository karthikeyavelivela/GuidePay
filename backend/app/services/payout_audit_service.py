from datetime import datetime

from bson import ObjectId


async def append_payout_audit(
    db,
    claim_id: str,
    step: str,
    status: str,
    message: str,
    meta: dict | None = None,
):
    if db is None:
        return None

    entry = {
        "id": str(ObjectId()),
        "step": step,
        "status": status,
        "message": message,
        "meta": meta or {},
        "created_at": datetime.utcnow(),
    }

    await db.claims.update_one(
        {"_id": claim_id},
        {
            "$push": {"payout_audit_log": entry},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    await db.payout_audit_logs.insert_one(
        {
            "_id": str(ObjectId()),
            "claim_id": claim_id,
            **entry,
        }
    )
    return entry
