"""
seed_demo.py — Seeds demo data for GuidePay competition demo.

Creates 3 demo workers with different income tiers (Bronze/Silver/Gold),
active policies for each, and one past paid claim showing different payout amounts.

Run locally:  python seed_demo.py
Run on Render: use the Render shell and run 'python seed_demo.py'
"""

import asyncio
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/guidepay")

DEMO_WORKERS = [
    {
        "_id": "demo_bronze_001",
        "name": "Raju Kumar",
        "phone": "9111100001",
        "city": "Hyderabad",
        "zone": "kondapur-hyderabad",
        "upi_id": "raju@upi",
        "risk_score": 0.72,
        "risk_tier": "MEDIUM",
        "premium_amount": 58,
        "avg_daily_orders": 5,   # Bronze tier
        "platforms": ["swiggy"],
        "is_active": True,
        "experience_months": 8,
        "created_at": datetime.utcnow() - timedelta(days=45),
        "updated_at": datetime.utcnow(),
    },
    {
        "_id": "demo_silver_002",
        "name": "Priya Sharma",
        "phone": "9111100002",
        "city": "Hyderabad",
        "zone": "kondapur-hyderabad",
        "upi_id": "priya@upi",
        "risk_score": 0.80,
        "risk_tier": "LOW",
        "premium_amount": 51,
        "avg_daily_orders": 11,  # Silver tier
        "platforms": ["swiggy", "zomato"],
        "is_active": True,
        "experience_months": 18,
        "created_at": datetime.utcnow() - timedelta(days=90),
        "updated_at": datetime.utcnow(),
    },
    {
        "_id": "demo_gold_003",
        "name": "Arjun Reddy",
        "phone": "9999900000",   # Primary demo login
        "city": "Hyderabad",
        "zone": "kondapur-hyderabad",
        "upi_id": "arjun@upi",
        "risk_score": 0.88,
        "risk_tier": "LOW",
        "premium_amount": 49,
        "avg_daily_orders": 18,  # Gold tier
        "platforms": ["swiggy", "zomato", "blinkit"],
        "is_active": True,
        "experience_months": 24,
        "created_at": datetime.utcnow() - timedelta(days=120),
        "updated_at": datetime.utcnow(),
    },
]

now = datetime.utcnow()
week_start = now - timedelta(days=now.weekday())
week_end = week_start + timedelta(days=7)

DEMO_POLICIES = [
    {
        "_id": "demo_policy_bronze_001",
        "worker_id": "demo_bronze_001",
        "plan_id": "standard",
        "plan_name": "Standard",
        "status": "ACTIVE",
        "weekly_premium": 58,
        "coverage_cap": 600,
        "auto_payout": True,
        "week_start": week_start,
        "week_end": week_end,
        "payment_id": "pay_DEMO_BRONZE",
        "created_at": week_start,
        "updated_at": now,
    },
    {
        "_id": "demo_policy_silver_002",
        "worker_id": "demo_silver_002",
        "plan_id": "standard",
        "plan_name": "Standard",
        "status": "ACTIVE",
        "weekly_premium": 51,
        "coverage_cap": 600,
        "auto_payout": True,
        "week_start": week_start,
        "week_end": week_end,
        "payment_id": "pay_DEMO_SILVER",
        "created_at": week_start,
        "updated_at": now,
    },
    {
        "_id": "demo_policy_gold_003",
        "worker_id": "demo_gold_003",
        "plan_id": "premium",
        "plan_name": "Premium",
        "status": "ACTIVE",
        "weekly_premium": 49,
        "coverage_cap": 900,
        "auto_payout": True,
        "week_start": week_start,
        "week_end": week_end,
        "payment_id": "pay_DEMO_GOLD",
        "created_at": week_start,
        "updated_at": now,
    },
]

# Past trigger event (last week flood)
DEMO_TRIGGER = {
    "_id": "demo_trigger_flood_001",
    "trigger_type": "FLOOD",
    "city": "Hyderabad",
    "zone": "kondapur-hyderabad",
    "severity": "RED",
    "source": "IMD_SACHET",
    "event_hash": "demo_flood_hash_001",
    "status": "RESOLVED",
    "payout_percentage": 1.0,
    "affected_workers": 3,
    "claims_count": 3,
    "started_at": now - timedelta(days=5),
    "expires_at": now - timedelta(days=4),
}

# Past paid claims with different income tiers
DEMO_CLAIMS = [
    {
        "_id": "demo_claim_bronze_001",
        "worker_id": "demo_bronze_001",
        "policy_id": "demo_policy_bronze_001",
        "trigger_event_id": "demo_trigger_flood_001",
        "trigger_type": "FLOOD",
        "amount": 400,            # Bronze tier payout
        "payout_amount": 400,
        "payout_tier": "Bronze",
        "daily_orders_at_claim": 5,
        "status": "PAID",
        "fraud_score": 0.08,
        "fraud_flags": [],
        "fraud_checks": {},
        "payout_status": "SUCCESS",
        "razorpay_payout_id": "MOCK_GP_DEMO_BR",
        "created_at": now - timedelta(days=5),
        "paid_at": now - timedelta(days=5, hours=-2),
        "updated_at": now - timedelta(days=5),
    },
    {
        "_id": "demo_claim_silver_002",
        "worker_id": "demo_silver_002",
        "policy_id": "demo_policy_silver_002",
        "trigger_event_id": "demo_trigger_flood_001",
        "trigger_type": "FLOOD",
        "amount": 600,            # Silver tier payout
        "payout_amount": 600,
        "payout_tier": "Silver",
        "daily_orders_at_claim": 11,
        "status": "PAID",
        "fraud_score": 0.05,
        "fraud_flags": [],
        "fraud_checks": {},
        "payout_status": "SUCCESS",
        "razorpay_payout_id": "MOCK_GP_DEMO_SI",
        "created_at": now - timedelta(days=5),
        "paid_at": now - timedelta(days=5, hours=-1),
        "updated_at": now - timedelta(days=5),
    },
    {
        "_id": "demo_claim_gold_003",
        "worker_id": "demo_gold_003",
        "policy_id": "demo_policy_gold_003",
        "trigger_event_id": "demo_trigger_flood_001",
        "trigger_type": "FLOOD",
        "amount": 900,            # Gold tier payout
        "payout_amount": 900,
        "payout_tier": "Gold",
        "daily_orders_at_claim": 18,
        "status": "PAID",
        "fraud_score": 0.03,
        "fraud_flags": [],
        "fraud_checks": {},
        "payout_status": "SUCCESS",
        "razorpay_payout_id": "MOCK_GP_DEMO_GO",
        "created_at": now - timedelta(days=5),
        "paid_at": now - timedelta(days=5, minutes=-30),
        "updated_at": now - timedelta(days=5),
    },
]

DEMO_PAYMENTS = [
    {
        "_id": f"demo_payment_{p['worker_id']}",
        "worker_id": p["worker_id"],
        "policy_id": p["_id"],
        "amount": p["weekly_premium"],
        "status": "SUCCESS",
        "razorpay_order_id": f"order_DEMO_{p['_id'][-5:].upper()}",
        "razorpay_payment_id": p["payment_id"],
        "created_at": week_start,
        "updated_at": week_start,
    }
    for p in DEMO_POLICIES
]


async def seed():
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_default_database()

    print("Seeding demo workers...")
    for worker in DEMO_WORKERS:
        await db.workers.replace_one({"_id": worker["_id"]}, worker, upsert=True)
        tier = "Gold" if worker["avg_daily_orders"] >= 15 else "Silver" if worker["avg_daily_orders"] >= 8 else "Bronze"
        print(f"  Worker: {worker['name']} ({tier} — {worker['avg_daily_orders']} orders/day)")

    print("Seeding demo policies...")
    for policy in DEMO_POLICIES:
        await db.policies.replace_one({"_id": policy["_id"]}, policy, upsert=True)
        print(f"  Policy: {policy['plan_name']} for {policy['worker_id']}")

    print("Seeding demo trigger event...")
    await db.trigger_events.replace_one({"_id": DEMO_TRIGGER["_id"]}, DEMO_TRIGGER, upsert=True)

    print("Seeding demo claims...")
    for claim in DEMO_CLAIMS:
        await db.claims.replace_one({"_id": claim["_id"]}, claim, upsert=True)
        print(f"  Claim: ₹{claim['amount']} ({claim['payout_tier']} tier) — {claim['status']}")

    print("Seeding demo payments...")
    for payment in DEMO_PAYMENTS:
        await db.payments.replace_one({"_id": payment["_id"]}, payment, upsert=True)

    print("\n✅ Demo seed complete!")
    print("\nDemo logins:")
    print("  Gold tier (9999900000) — Arjun Reddy — ₹900 payout")
    print("  Silver tier (9111100002) — Priya Sharma — ₹600 payout")
    print("  Bronze tier (9111100001) — Raju Kumar — ₹400 payout")
    print("\nUse OTP: 123456 for all demo accounts")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
