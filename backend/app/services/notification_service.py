import logging

logger = logging.getLogger(__name__)


async def send_claim_notification(worker: dict, claim: dict, status: str):
    """Send push notification for claim status update"""
    message = {
        "AUTO_APPROVED": f"✅ Your claim of ₹{claim['amount']} has been approved! Payment is being processed.",
        "PAID": f"💰 ₹{claim['amount']} has been credited to your UPI account.",
        "REJECTED": f"❌ Your claim could not be approved. Contact support for details.",
        "MANUAL_REVIEW": f"⏳ Your claim of ₹{claim['amount']} is under review.",
    }.get(status, "Your claim status has been updated.")

    # In production, integrate Firebase Cloud Messaging here
    logger.info(
        f"NOTIFICATION to {worker.get('phone')}: {message}"
    )


async def send_trigger_alert(workers: list, trigger_event: dict):
    """Send push notification when a trigger event is detected"""
    city = trigger_event.get("city", "your city")
    trigger_type = trigger_event.get("trigger_type", "event")
    amount = trigger_event.get("total_exposure", 0) / max(len(workers), 1)

    message = (
        f"⚠️ {trigger_type} alert in {city}! "
        f"Your policy covers you for up to ₹{amount:.0f}. "
        f"Claim will be processed automatically."
    )

    logger.info(
        f"TRIGGER ALERT to {len(workers)} workers in {city}: {message}"
    )
