# Payout percentages by trigger type
PAYOUT_PERCENTAGES = {
    "FLOOD": 1.0,
    "OUTAGE": 0.75,
    "CURFEW": 1.0,
}

# Coverage cap (weekly max payout per worker)
COVERAGE_CAP = 600.0

# Fraud score threshold for auto-approval
FRAUD_AUTO_APPROVE_THRESHOLD = 0.70

# Zone radius for GPS check (km)
GPS_ZONE_RADIUS_KM = 5.0
GPS_WARN_RADIUS_KM = 10.0

# Claim frequency thresholds
CLAIM_FREQ_MULTIPLIER = 2.5  # x zone average before flagging

# Activity check thresholds (minutes)
ACTIVITY_WARN_MINUTES = 240   # 4 hours
ACTIVITY_FAIL_MINUTES = 360   # 6 hours

# Account age threshold for new account flag (days)
NEW_ACCOUNT_DAYS = 7

# Trigger event expiry
TRIGGER_EXPIRY_HOURS = 24

# Supported cities
SUPPORTED_CITIES = [
    "Hyderabad",
    "Mumbai",
    "Chennai",
    "Bengaluru",
    "Delhi",
]

# Plan pricing
PLAN_PRICING = {
    "basic": 49.0,
    "standard": 58.0,
    "premium": 69.0,
}
