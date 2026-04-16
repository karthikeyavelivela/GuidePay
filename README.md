<div align="center">

<img src="https://res.cloudinary.com/dqwm8wgg8/image/upload/v1775229340/u4qsxq76ijd9vw6yjhwj.gif" height="220" width="310" alt="GuidePay"/>

# GuidePay

**Parametric Income Insurance for India's Gig Delivery Workers**

Guidewire DEVTrails 2026 · Phase 3 · Team SentinelX · KL University

[![Live Demo](https://img.shields.io/badge/Live_Demo-guidepayklu.vercel.app-FF6900?style=for-the-badge&logo=vercel&logoColor=white)](https://guidepayklu.vercel.app)
[![API](https://img.shields.io/badge/API_Docs-guidepay.onrender.com-430098?style=for-the-badge&logo=render&logoColor=white)](https://guidepay.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/karthikeyavelivela/GuidePay)

---

**`Flood detected → Worker verified → Fraud scored → ₹600 in UPI`**

**`0 sec · 30 sec · 60 sec · < 2 hours`**

The worker never opens the app. The worker never files a claim. Everything is automatic.

</div>

---

## The Story

Ravi Kumar. 28. Swiggy delivery partner. Kondapur, Hyderabad. ₹18,000/month.

Tuesday 2:15 PM. IMD Red Alert — Hyderabad. Rainfall 71mm in 6 hours. 3 days he cannot ride.

₹2,400 gone. Rent due Friday. No platform compensation. No insurance product existed for him.

GuidePay detects the flood at 2:16 PM. 9 signals checked. Score 0.18 — auto-approved. ₹600 transferred to his UPI by 4:10 PM. He didn't ask. He didn't file. He didn't even know.

He sees the SMS. He keeps riding next week. His family is okay.

**That is what insurance is actually for.**

---

## What Is GuidePay

GuidePay is **parametric income insurance** — triggered by an objective external event, not a claim form. When a flood, platform outage, or curfew stops a delivery worker from earning, money lands in their UPI automatically. No document upload. No phone call. No human decision.

```
TRIGGER DETECTED      0 sec    IMD SACHET RSS confirms flood in worker's district
ACTIVITY VERIFIED    30 sec    Last delivery confirmed within 6 hours
FRAUD SCORED         60 sec    9-signal ML engine scores the claim
TIER CALCULATED      90 sec    Bronze/Silver/Gold → payout amount set
UPI PAYOUT          <2 hours   ₹400/₹600/₹900 sent to registered UPI
AUDIT TRAIL         instant    Every ML decision hash-chained for IRDAI
```

---

## What We Automated

**This is the core of GuidePay — end-to-end automation with zero human intervention:**

### 1. Trigger Detection — Automated Every 15 Minutes
APScheduler runs a background job every 15 minutes polling:
- **IMD SACHET RSS** — official government flood alerts
- **CPCB AQI API** — India's official air quality data
- **OpenWeatherMap** — rainfall intensity and duration
- **Downdetector** — platform availability monitoring
- **Calendar Engine** — festival disruption detection

No human monitors these. The system fires automatically when any threshold is crossed.

### 2. Worker Eligibility — Automated
When a trigger fires, the system automatically:
- Finds all workers in the affected zone with active policies
- Verifies each worker's last delivery was within 6 hours
- Checks policy expiry and adverse selection lock
- Runs in parallel for all affected workers simultaneously

### 3. Fraud Detection — Automated ML Pipeline
Every claim runs through 9 signals in under 50ms:
- GPS location verification
- Activity recency check
- Claim frequency analysis
- Zone correlation scoring
- GPS spoofing detection (4 sub-signals)
- Historical weather cross-validation
- Worker risk profile scoring
- New account gate
- Duplicate detection

No human reviews claims with fraud score < 0.70 — they are auto-approved instantly.

### 4. Payout — Automated via Razorpay UPI
Auto-approved claims trigger an immediate Razorpay UPI payout:
- Worker receives money directly to their registered UPI ID
- No bank transfer delays — instant UPI settlement
- Payout amount varies by income tier (Bronze ₹400 / Silver ₹600 / Gold ₹900)
- Receipt generated automatically

### 5. Audit Trail — Automated Hash Chain
Every decision in the pipeline is recorded in a tamper-evident hash chain:
- Each event hashes the previous event
- SHA256 chain proves no decision was altered after the fact
- IRDAI regulators can verify the complete chain

### 6. Notifications — Automated Contextual Alerts
Workers receive automated notifications based on real state:
- Flood alert active in zone
- Policy expiring in 48 hours
- Claim processed and paid
- High flood risk forecast next week

### 7. ML Model Training — Automated on Startup
All 4 ML models retrain automatically:
- Checks MongoDB GridFS for existing models
- Only retrains if models are older than 7 days or missing
- No manual intervention needed for model updates

**Result: A worker can buy a policy on Monday, have a flood hit on Wednesday, and receive ₹600 on Wednesday — without ever knowing GuidePay ran.**

---

## 5 Automated Triggers

| Trigger | Data Source | Threshold | Payout |
|---|---|---|---|
| 🌊 Flood | IMD SACHET RSS + OpenWeatherMap | Rainfall ≥ 64.4mm/24h or IMD Severe Alert | 100% of tier |
| 📡 Platform Outage | Downdetector + internal monitor | API down 30+ min + zero worker orders | 75% of tier |
| 🚫 Curfew / Section 144 | State Government RSS | Active curfew in worker's district | 100% of tier |
| 🎊 Festival Disruption | Calendar API + zone earnings | Orders drop ≥70% vs baseline | 40% of tier |
| 💨 Air Quality | CPCB Official API + OpenWeatherMap | AQI ≥ 301 WHO Hazardous | 50% of tier |

---

## Income-Based Payout Tiers

| Tier | Daily Orders | Payout per Trigger | Who |
|---|---|---|---|
| 🥉 Bronze | < 8 orders/day | ₹400 | Part-time workers, new joiners |
| 🥈 Silver | 8–14 orders/day | ₹600 | Full-time standard workers |
| 🥇 Gold | 15+ orders/day | ₹900 | High-volume professional riders |

Tier calculated automatically from verified delivery activity.

---

## 4 Coverage Plans

| Plan | Price | Payout Range | Best For |
|---|---|---|---|
| 🛡️ Daily Shield | ₹12/day | ₹400–₹900 | Flexible workers |
| Basic Shield | ₹49/week | ₹400–₹900 | Budget-conscious |
| Standard Shield | ₹62/week | ₹400–₹900 | Most workers |
| Premium Shield | ₹89/week | ₹400–₹900 | High earners |

---

## ML Pricing Engine

### Hybrid Actuarial-ML Model

$$P_{final} = 0.60 \cdot P_{ML} + 0.40 \cdot P_{actuarial}$$

$$P_{actuarial} = \left(\lambda S + 0.25\sqrt{\lambda} \cdot S\right) \times 1.30 \times M_{seasonal}$$

Where **S** = worker's actual payout tier (400/600/900).

```
Model:     RandomForestRegressor
R²:        ≈ 0.89
Records:   10,000 training records
Inference: < 50ms
```

| Feature | Weight |
|---|---|
| Zone flood risk score | 28% |
| Historical claim rate | 22% |
| City rainfall intensity | 18% |
| Worker risk score | 14% |
| Account age | 8% |
| Avg daily orders | 6% |
| Seasonal multiplier | 4% |

---

## 9-Signal Fraud Detection

$$S_{fraud} = \sum_{i=1}^{9} w_i \cdot f_i \qquad \text{Auto-approve if } S < 0.70$$

**Standard (1–5):** Duplicate detection · Zone eligibility · Activity recency · Claim frequency · Zone correlation

**Advanced (6–9):** GPS spoofing (impossible speed · static ping · cluster spoof · boundary abuse) · Weather validation · Risk profile · New account gate

**Model:** GradientBoostingClassifier · **Accuracy:** ~91% · **Speed:** <50ms

> **Zone Correlation:** When 80%+ of workers in a zone claim simultaneously, fraud scores are actively **lowered** — the crowd validates the event is real.

---

## IRDAI Compliance — 10/10

| # | Criterion | Status |
|---|---|---|
| 1 | Trigger objective & verifiable | ✅ IMD + CPCB + OWM |
| 2 | Health/life/vehicle excluded | ✅ Income loss only |
| 3 | Payout automatic | ✅ Trigger → GPS → UPI <2 hours |
| 4 | Pool financially sustainable | ✅ BCR 0.65, 14-day stress ADEQUATE |
| 5 | Fraud on data not behaviour | ✅ GPS + weather + activity |
| 6 | Premium collection frictionless | ✅ Razorpay UPI auto-pay |
| 7 | Pricing dynamic not flat | ✅ Hybrid ML + actuarial |
| 8 | Adverse selection blocked | ✅ Locked 48hrs before alerts |
| 9 | Operational cost near zero | ✅ $124/month, 0.83% revenue |
| 10 | Basis risk minimized | ✅ H3 hex grid, 5km² zones |

**Also compliant:** DPDP Act 2023 · SS Code 2020 · Data stored Mumbai ap-south-1 (RBI)

---

## Guidewire Platform Integration

**Phase 4 Roadmap:**
- **PolicyCenter API** — GuidePay parametric policies as a product type
- **ClaimCenter Integration** — Auto-approved claims as completed transactions
- **Guidewire Cloud** — Trigger engine as a Guidewire Cloud microservice

---

## Business Model

$$\text{Monthly GWP} = 50{,}000 \times ₹62 \times 4 = ₹1.24 \text{ crore}$$

| Metric | Value |
|---|---|
| Loss Ratio | 24.5% (target 65%) |
| Combined Ratio | 54.5% |
| TAM | ₹890 crore |
| Infra Cost | $124/month = 0.83% of revenue |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Zustand |
| Backend | FastAPI (Python 3.11), Motor, APScheduler, JWT |
| ML | scikit-learn 1.8 — GradientBoosting, RandomForest, IsolationForest |
| Database | MongoDB Atlas (Mumbai · ap-south-1) + GridFS |
| Auth | Firebase Google OAuth + JWT |
| Payments | Razorpay UPI (collection + payout) |
| Voice | ElevenLabs eleven_multilingual_v2 |
| Spatial | Uber H3 hex grid (resolution 7) |
| Deploy | Vercel (frontend) + Render (backend) |
| Data Sources | IMD SACHET RSS · CPCB API · OpenWeatherMap · Downdetector |

---

## Getting Started

### Demo

Sign in with Google at [guidepayklu.vercel.app](https://guidepayklu.vercel.app)

Admin panel: `/admin/login` → `admin` / `admin`

### Run Locally

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
# Docs: http://localhost:8000/docs

# Frontend
cd frontend && npm install
cp .env.example .env  # Set VITE_API_URL=http://localhost:8000
npm run dev           # http://localhost:5173
```

### Environment Variables

```env
# Backend
MONGODB_URL=mongodb+srv://...
SECRET_KEY=your-secret-key
FIREBASE_PROJECT_ID=guide-pay
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
OPENWEATHER_API_KEY=...
ELEVENLABS_API_KEY=...
CPCB_API_KEY=...
FRONTEND_URL=https://guidepayklu.vercel.app

# Frontend
VITE_API_URL=https://guidepay.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=guide-pay.firebaseapp.com
VITE_FIREBASE_APP_ID=...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## Live Links

| Resource | URL |
|---|---|
| Worker Portal | https://guidepayklu.vercel.app |
| Admin Panel | https://guidepayklu.vercel.app/admin/login |
| API Docs | https://guidepay.onrender.com/docs |
| Source Code | https://github.com/karthikeyavelivela/GuidePay |

---

## Try It Right Now

Sign in with Google at guidepayklu.vercel.app

Go to admin. Fire a flood trigger for Hyderabad. Watch money move automatically — fraud scored, tier calculated, UPI payout initiated — in under 2 minutes. With a full hash-chained audit trail.

**No slides. No mockups. Press the button. Watch it work.**

---

## Team SentinelX

| Member | Role | Contribution |
|---|---|---|
| **Karthikeya Velivela** | Lead · Full-Stack · ML · AppSec | Architecture, backend, ML models, fraud engine, deployment |
| **Nithya Sri Induru** | Frontend · UX | Worker portal, multilingual UI |
| **Suhitha YV** | Backend · API | Routes, MongoDB schema, Razorpay |
| **Shaik Yakoob** | ML · Data | Model training, fraud detection, flood predictor |
| **N Fatima** | Research · Docs | Market research, regulatory analysis |

**KL University, Vijayawada · Guidewire DEVTrails 2026 · Phase 3**

---

<div align="center">

*Built in 8 weeks. Fully automated. Ready for 12 million workers.*

**GuidePay · Team SentinelX · KL University**

</div>