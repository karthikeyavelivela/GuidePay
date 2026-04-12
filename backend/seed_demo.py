import asyncio
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import connect_db, disconnect_db, get_db

async def seed_demo():
    await connect_db()
    db = get_db()
    if db is None:
        print("Database connection failed")
        return

    print("Clearing existing demo trigger events...")
    await db.trigger_events.delete_many({"source": {"$in": ["IMD_SACHET", "ML_FORECAST", "ADMIN_SIMULATION"]}})

    now = datetime.utcnow()

    # 1. Active Trigger Event (Flood)
    trigger1_id = str(ObjectId())
    trigger1 = {
        "_id": trigger1_id,
        "trigger_type": "FLOOD",
        "city": "Mumbai",
        "zone": "kurla-mumbai",
        "lat": 19.0728,
        "lng": 72.8826,
        "severity": "RED",
        "source": "IMD_SACHET",
        "event_hash": str(ObjectId())[:8],
        "status": "ACTIVE",
        "payout_percentage": 1.0,
        "affected_workers": 150,
        "total_exposure": 75000.0,
        "total_workers_in_zone": 420,
        "claims_count": 0,
        "confirmation_status": "PENDING",
        "started_at": now - timedelta(hours=2),
        "expires_at": now + timedelta(hours=22),
    }

    # 2. Predictive Pre-Trigger (Advance ML Forecast)
    trigger3_id = str(ObjectId())
    trigger3 = {
        "_id": trigger3_id,
        "trigger_type": "PREDICTIVE_FLOOD",
        "city": "Chennai",
        "zone": "tnagar-chennai",
        "lat": 13.0418,
        "lng": 80.2341,
        "severity": "RED",
        "source": "ML_FORECAST",
        "event_hash": str(ObjectId())[:8],
        "status": "ACTIVE",
        "payout_percentage": 0.50,
        "affected_workers": 80,
        "total_exposure": 24000.0,
        "total_workers_in_zone": 200,
        "claims_count": 0,
        "confirmation_status": "PENDING",
        "started_at": now,
        "expires_at": now + timedelta(hours=24),
    }
    
    await db.trigger_events.insert_many([trigger1, trigger3])
    print("Seeded 2 active triggers (1 Flood, 1 Predictive).")
    
    await disconnect_db()
    print("Demo Data Seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_demo())
