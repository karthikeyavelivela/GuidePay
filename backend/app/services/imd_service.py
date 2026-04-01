import feedparser
import httpx
import asyncio
import re
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from app.config import settings
from app.database import get_db
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


def _escape_regex(value: str) -> str:
    return re.escape((value or "").strip())

# Known flood-prone cities with coordinates
MONITORED_ZONES = [
    {
        "city": "Hyderabad",
        "zone": "kondapur-hyderabad",
        "lat": 17.4401,
        "lng": 78.3489,
        "imd_district": "Hyderabad",
        "state": "Telangana"
    },
    {
        "city": "Mumbai",
        "zone": "kurla-mumbai",
        "lat": 19.0728,
        "lng": 72.8826,
        "imd_district": "Mumbai",
        "state": "Maharashtra"
    },
    {
        "city": "Chennai",
        "zone": "tnagar-chennai",
        "lat": 13.0418,
        "lng": 80.2341,
        "imd_district": "Chennai",
        "state": "Tamil Nadu"
    },
    {
        "city": "Bengaluru",
        "zone": "koramangala-bengaluru",
        "lat": 12.9352,
        "lng": 77.6245,
        "imd_district": "Bangalore",
        "state": "Karnataka"
    },
    {
        "city": "Delhi",
        "zone": "dwarka-delhi",
        "lat": 28.5921,
        "lng": 77.0460,
        "imd_district": "Delhi",
        "state": "Delhi"
    },
]


async def fetch_imd_alerts() -> list:
    """
    Fetch flood and weather alerts from IMD SACHET RSS.
    Returns list of active alerts from real feed only.
    """
    alerts = []
    try:
        rss_urls = [
            "https://sachet.ndma.gov.in/cap_public_website/FeedPage",
            "https://mausam.imd.gov.in/imd_latest/contents/warning.php",
        ]

        async with httpx.AsyncClient(timeout=10.0) as client:
            for url in rss_urls:
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        feed = feedparser.parse(response.text)
                        for entry in feed.entries:
                            alert = parse_imd_entry(entry)
                            if alert:
                                alerts.append(alert)
                except Exception as e:
                    logger.warning(f"IMD feed {url} failed: {e}")

    except Exception as e:
        logger.error(f"IMD fetch error: {e}")

    return alerts


def parse_imd_entry(entry) -> dict:
    """Parse an IMD RSS entry into structured alert"""
    try:
        title = entry.get("title", "").lower()
        summary = entry.get("summary", "").lower()

        flood_keywords = [
            "flood", "heavy rain", "red alert",
            "orange alert", "cyclone", "storm"
        ]

        is_flood_alert = any(
            kw in title or kw in summary
            for kw in flood_keywords
        )

        if not is_flood_alert:
            return None

        if "red alert" in title or "red alert" in summary:
            severity = "RED"
        elif "orange alert" in title or "orange" in summary:
            severity = "ORANGE"
        else:
            severity = "YELLOW"

        for zone in MONITORED_ZONES:
            if (zone["city"].lower() in title or
                    zone["city"].lower() in summary or
                    zone["state"].lower() in title):
                return {
                    "city": zone["city"],
                    "zone": zone["zone"],
                    "lat": zone["lat"],
                    "lng": zone["lng"],
                    "severity": severity,
                    "type": "FLOOD",
                    "source": "IMD_SACHET",
                    "title": entry.get("title", ""),
                    "description": entry.get("summary", ""),
                    "published": entry.get("published", ""),
                }
        return None
    except Exception:
        return None


async def check_platform_outages() -> list:
    """
    Check platform outage status via Downdetector scraping.
    Returns confirmed outages only — no simulated data.
    """
    from app.services.downdetector_service import get_all_platform_statuses

    outages = []
    try:
        statuses = await get_all_platform_statuses()
        for status in statuses:
            if status.get("status") == "outage":
                # Map platform to city/zone
                platform_zone_map = {
                    "zepto": {"city": "Mumbai", "zone": "kurla-mumbai",
                               "lat": 19.0728, "lng": 72.8826},
                    "swiggy": {"city": "Bengaluru", "zone": "koramangala-bengaluru",
                                "lat": 12.9352, "lng": 77.6245},
                    "blinkit": {"city": "Delhi", "zone": "dwarka-delhi",
                                 "lat": 28.5921, "lng": 77.0460},
                    "zomato": {"city": "Hyderabad", "zone": "kondapur-hyderabad",
                                "lat": 17.4401, "lng": 78.3489},
                }
                zone_info = platform_zone_map.get(status["platform"])
                if zone_info:
                    outages.append({
                        "platform": status["platform"],
                        "city": zone_info["city"],
                        "zone": zone_info["zone"],
                        "lat": zone_info["lat"],
                        "lng": zone_info["lng"],
                        "severity": "OUTAGE",
                        "type": "OUTAGE",
                        "source": "DOWNDETECTOR",
                        "report_count": status.get("report_count", 0),
                    })
    except Exception as e:
        logger.warning(f"Platform outage check failed: {e}")

    return outages


async def process_trigger_events(alerts: list, db) -> list:
    """
    Process detected alerts into trigger events.
    Find affected workers and create claims.
    """
    created_events = []

    for alert in alerts:
        two_hours_ago = datetime.utcnow() - timedelta(hours=2)
        existing = await db.trigger_events.find_one({
            "city": alert["city"],
            "trigger_type": alert["type"],
            "started_at": {"$gte": two_hours_ago},
            "status": "ACTIVE"
        })

        if existing:
            continue  # Skip duplicate

        city_pattern = _escape_regex(alert.get("city", ""))
        zone_pattern = _escape_regex(alert.get("zone", ""))
        worker_query = {
            "is_active": True,
            "$or": [
                {"zone": alert["zone"]},
                {"city": {"$regex": f"^{city_pattern}$", "$options": "i"}},
                {"city": {"$regex": city_pattern, "$options": "i"}},
                {"zone": {"$regex": zone_pattern, "$options": "i"}},
            ],
        }
        workers_in_zone = await db.workers.find(worker_query).to_list(1000)

        active_worker_ids = []
        for worker in workers_in_zone:
            policy = await db.policies.find_one({
                "worker_id": str(worker["_id"]),
                "status": "ACTIVE"
            })
            if policy:
                active_worker_ids.append(str(worker["_id"]))

        payout_pct = {
            "FLOOD": 1.0,
            "OUTAGE": 0.75,
            "CURFEW": 1.0,
            "AIR_QUALITY": 0.50,
            "HEAT_WAVE": 0.50,
            "FESTIVAL_DISRUPTION": 0.40,
        }.get(alert["type"], 1.0)

        from app.services.premium_service import COVERAGE_CAP
        total_exposure = len(active_worker_ids) * COVERAGE_CAP * payout_pct

        from bson import ObjectId
        event_doc = {
            "_id": str(ObjectId()),
            "trigger_type": alert["type"],
            "city": alert["city"],
            "zone": alert["zone"],
            "lat": alert.get("lat", 0),
            "lng": alert.get("lng", 0),
            "severity": alert.get("severity", "ORANGE"),
            "source": alert.get("source", "IMD_SACHET"),
            "source_data": alert,
            "status": "ACTIVE",
            "payout_percentage": payout_pct,
            "affected_workers": len(active_worker_ids),
            "total_exposure": total_exposure,
            "total_workers_in_zone": len(workers_in_zone),
            "claims_count": 0,
            "confirmation_status": "PENDING",
            "started_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
        }

        await db.trigger_events.insert_one(event_doc)
        logger.info(
            f"Trigger matched {len(workers_in_zone)} workers "
            f"and {len(active_worker_ids)} active policies "
            f"for {alert['type']} in {alert['city']}"
        )

        for worker in workers_in_zone:
            if str(worker["_id"]) in active_worker_ids:
                await create_automatic_claim(
                    worker=worker,
                    trigger_event=event_doc,
                    db=db
                )

        created_events.append(event_doc)
        logger.info(
            f"Trigger event created: {alert['type']} "
            f"in {alert['city']} — "
            f"{len(active_worker_ids)} workers affected"
        )

    return created_events


async def create_automatic_claim(worker: dict, trigger_event: dict, db):
    """Create and process a claim automatically"""
    from app.services.fraud_service import calculate_fraud_score
    from bson import ObjectId

    worker_id = str(worker["_id"])

    policy = await db.policies.find_one({
        "worker_id": worker_id,
        "status": "ACTIVE"
    })

    if not policy:
        return

    from app.services.premium_service import COVERAGE_CAP
    payout_amount = round(COVERAGE_CAP * trigger_event["payout_percentage"], 2)

    fraud_result = await calculate_fraud_score(
        worker=worker,
        trigger_event=trigger_event,
        db=db
    )

    is_admin_simulation = (
        trigger_event.get("source") == "ADMIN_SIMULATION" or
        trigger_event.get("source_data", {}).get("source") == "ADMIN_SIMULATION"
    )

    if is_admin_simulation:
        status = "AUTO_APPROVED"
        fraud_result = {
            "score": 0.0,
            "flags": [],
            "checks": {"simulation": {"result": "BYPASS", "score": 0.0}},
            "decision": "AUTO_APPROVED",
        }
    elif fraud_result["decision"] == "REJECTED":
        status = "REJECTED"
    elif fraud_result["decision"] == "AUTO_APPROVED":
        status = "AUTO_APPROVED"
    else:
        status = "MANUAL_REVIEW"

    claim_doc = {
        "_id": str(ObjectId()),
        "worker_id": worker_id,
        "policy_id": str(policy["_id"]),
        "trigger_event_id": str(trigger_event["_id"]),
        "trigger_type": trigger_event["trigger_type"],
        "amount": payout_amount,
        "status": status,
        "fraud_score": fraud_result["score"],
        "fraud_flags": fraud_result["flags"],
        "fraud_checks": fraud_result["checks"],
        "activity_verified": fraud_result["checks"].get(
            "activity", {}
        ).get("result") == "PASS",
        "zone_correlation_ratio": trigger_event.get(
            "claims_count", 0
        ) / max(trigger_event.get("total_workers_in_zone", 1), 1),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.claims.insert_one(claim_doc)
    logger.info(
        f"Claim created for worker {worker_id} "
        f"with status {status} and amount {payout_amount}"
    )

    await db.trigger_events.update_one(
        {"_id": str(trigger_event["_id"])},
        {"$inc": {"claims_count": 1}}
    )

    if status == "AUTO_APPROVED":
        await initiate_payout(claim=claim_doc, worker=worker, db=db)


async def initiate_payout(claim: dict, worker: dict, db):
    """Mock payout for competition demo — no real bank transfer"""
    import os
    try:
        mock_mode = os.getenv("RAZORPAY_MOCK_MODE", "true") == "true"

        if mock_mode:
            payout_id = f"MOCK_GP_{str(claim['_id'])[:8].upper()}"
            logger.info(
                f"[MOCK PAYOUT] ₹{claim['amount']} "
                f"to {worker.get('upi_id', 'worker@upi')} "
                f"— ID: {payout_id}"
            )
            await db.claims.update_one(
                {"_id": str(claim["_id"])},
                {"$set": {
                    "status": "PAID",
                    "paid_at": datetime.utcnow(),
                    "razorpay_payout_id": payout_id,
                }}
            )
            await db.workers.update_one(
                {"_id": str(worker["_id"])},
                {"$inc": {
                    "total_claims": 1,
                    "total_payouts": claim["amount"]
                }}
            )
            logger.info(
                f"Payout credited for worker {worker.get('_id')} "
                f"claim {claim.get('_id')} amount {claim['amount']}"
            )
            return payout_id

    except Exception as e:
        logger.error(f"Payout failed for claim {claim['_id']}: {e}")


async def check_aqi_heatwave() -> list:
    """
    Check for extreme AQI or heat wave conditions.
    Uses OpenWeatherMap Air Pollution API (free tier).
    Triggers when AQI index >= 4 (Very Poor) or temperature >= 43 degrees C.
    """
    import os
    alerts = []
    AQI_THRESHOLD = 4   # Very Poor on 0-5 scale
    HEAT_THRESHOLD = 43  # Celsius

    api_key = os.getenv("OPENWEATHER_API_KEY")

    for zone in MONITORED_ZONES:
        try:
            if api_key:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    # Air pollution check
                    aqi_res = await client.get(
                        "http://api.openweathermap.org/data/2.5/air_pollution",
                        params={
                            "lat": zone["lat"],
                            "lon": zone["lng"],
                            "appid": api_key,
                        }
                    )
                    if aqi_res.status_code == 200:
                        aqi_data = aqi_res.json()
                        aqi = aqi_data["list"][0]["main"]["aqi"]
                        if aqi >= AQI_THRESHOLD:
                            alerts.append({
                                "city": zone["city"],
                                "zone": zone["zone"],
                                "lat": zone["lat"],
                                "lng": zone["lng"],
                                "severity": "ORANGE",
                                "type": "AIR_QUALITY",
                                "source": "OPENWEATHER_AQI",
                                "aqi_index": aqi,
                                "title": f"Very Poor Air Quality — {zone['city']}",
                                "description": f"AQI index {aqi}/5 — delivery workers at health risk",
                                "published": datetime.utcnow().isoformat(),
                            })

                    # Heat wave check
                    weather_res = await client.get(
                        "https://api.openweathermap.org/data/2.5/weather",
                        params={
                            "lat": zone["lat"],
                            "lon": zone["lng"],
                            "appid": api_key,
                            "units": "metric",
                        }
                    )
                    if weather_res.status_code == 200:
                        w = weather_res.json()
                        temp = w["main"]["temp"]
                        if temp >= HEAT_THRESHOLD:
                            alerts.append({
                                "city": zone["city"],
                                "zone": zone["zone"],
                                "lat": zone["lat"],
                                "lng": zone["lng"],
                                "severity": "RED",
                                "type": "HEAT_WAVE",
                                "source": "OPENWEATHER_HEAT",
                                "temperature_c": temp,
                                "title": f"Heat Wave Alert — {zone['city']} {temp:.0f}C",
                                "description": f"Extreme heat {temp:.0f}C — platforms may pause operations",
                                "published": datetime.utcnow().isoformat(),
                            })
        except Exception as e:
            logger.warning(f"AQI check failed for {zone['city']}: {e}")

    return alerts


async def check_festival_disruption() -> list:
    """
    Check if today is a major Indian festival that causes significant delivery disruption.
    Uses a hardcoded calendar of high-impact events.
    """
    from app.utils.constants import DISRUPTION_CALENDAR

    today = datetime.utcnow()
    month = today.month
    day = today.day
    key = f"{str(month).zfill(2)}-{str(day).zfill(2)}"

    event = DISRUPTION_CALENDAR.get(key)
    if not event:
        return []

    if event["disruption_level"] < 0.40:
        return []

    alerts = []
    for zone in MONITORED_ZONES:
        # Only trigger for affected cities (None = all cities)
        if event.get("cities") and zone["city"] not in event["cities"]:
            continue

        alerts.append({
            "city": zone["city"],
            "zone": zone["zone"],
            "lat": zone["lat"],
            "lng": zone["lng"],
            "severity": "ORANGE",
            "type": "FESTIVAL_DISRUPTION",
            "source": "CALENDAR_ENGINE",
            "event_name": event["name"],
            "disruption_level": event["disruption_level"],
            "title": f"{event['name']} Disruption — {zone['city']}",
            "description": f"{event['name']}: {event['description']}",
            "published": datetime.utcnow().isoformat(),
        })

    return alerts


async def check_curfew_alerts() -> list:
    """
    Check for government-issued curfew orders.
    Mock implementation — in production: scrape state government feeds.
    """
    return []


async def run_trigger_check():
    """Main scheduled function — runs every 15 minutes. Checks all 5 trigger types."""
    logger.info("Running trigger check (5 trigger types)...")

    db = get_db()
    if db is None:
        return

    # All 5 trigger types
    flood_alerts = await fetch_imd_alerts()
    outage_alerts = await check_platform_outages()
    aqi_alerts = await check_aqi_heatwave()
    festival_alerts = await check_festival_disruption()
    curfew_alerts = await check_curfew_alerts()

    all_alerts = (
        flood_alerts + outage_alerts +
        aqi_alerts + festival_alerts + curfew_alerts
    )

    if all_alerts:
        events = await process_trigger_events(all_alerts, db)
        logger.info(
            f"Processed {len(events)} new trigger events "
            f"from {len(all_alerts)} alerts across 5 sources"
        )

    return all_alerts


async def start_trigger_scheduler():
    """Start the background scheduler"""
    scheduler.add_job(
        run_trigger_check,
        "interval",
        minutes=settings.trigger_poll_interval_minutes,
        id="trigger_check",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        f"Trigger scheduler started — "
        f"polling every {settings.trigger_poll_interval_minutes} minutes"
    )
