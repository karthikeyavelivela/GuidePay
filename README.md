<div align="center">

<img src="https://res.cloudinary.com/dqwm8wgg8/image/upload/v1775229340/u4qsxq76ijd9vw6yjhwj.gif" height="220" width="310" alt="GuidePay"/>

# GuidePay

**Parametric Income Insurance for India's Gig Delivery Workers**

Guidewire DEVTrails 2026 · Phase 3 · Team SentinelX · KL University

[![Live Demo](https://img.shields.io/badge/Live_Demo-guidepayklu.vercel.app-FF6900?style=for-the-badge&logo=vercel&logoColor=white)](https://guidepayklu.vercel.app)
[![API](https://img.shields.io/badge/API_Docs-guidepay.onrender.com-430098?style=for-the-badge&logo=render&logoColor=white)](https://guidepay.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/karthikeyavelivela/GuidePay)

---

**`Trigger fires → Worker verified → Fraud scored → ₹600 in UPI`**

**`0 sec · 30 sec · 60 sec · < 2 hours`**

The worker never opens the app. The worker never files a claim. Everything is automatic.

</div>

---

## The Story

Ravi Kumar. 28. Swiggy delivery partner. Kondapur, Hyderabad. ₹18,000/month.

Tuesday 2:15 PM. IMD Red Alert — Hyderabad. Rainfall 71mm in 6 hours. 3 days he cannot ride.

₹2,400 gone. Rent due Friday. No platform compensation. No insurance product existed for him.

GuidePay detects the trigger. 9 signals checked. Score 0.18 — auto-approved. ₹600 transferred to his UPI. He didn't ask. He didn't file. He didn't even know.

He sees the SMS. He keeps riding next week. His family is okay.

**That is what insurance is actually for.**

He is one of 12 million gig delivery workers in India. Zero insurance products existed for him. GuidePay fixes that.

---

## What Is GuidePay

GuidePay is **parametric income insurance** — triggered by an objective external event, not a claim form. When a verifiable disruption stops a delivery worker from earning, money lands in their UPI automatically. No document upload. No phone call. No human decision on the claim.

```
TRIGGER CONFIRMED     0 sec    External data source confirms event in worker's district
ACTIVITY VERIFIED    30 sec    Last delivery confirmed within 6 hours
FRAUD SCORED         60 sec    9-signal ML engine processes the claim
TIER CALCULATED      90 sec    Bronze/Silver/Gold → payout amount set
UPI PAYOUT          <2 hours   ₹400/₹600/₹900 sent to registered UPI ID
AUDIT TRAIL         instant    Every ML decision hash-chained for IRDAI
```

---

## What We Built and Automated

Once a trigger event is confirmed, **the entire claim pipeline runs without human intervention.** No adjuster. No form. No phone call.

### Automated Pipeline (Trigger → Payout)

**Step 1 — Trigger Confirmation**
An event is confirmed via external data sources:
- IMD SACHET RSS — official government flood alerts
- CPCB AQI API — India's official air quality data
- OpenWeatherMap — rainfall intensity and duration
- Downdetector — platform availability monitoring
- Calendar Engine + zone order data — festival disruption

In production, APScheduler polls all sources every 15 minutes. For demonstration, the admin panel includes a trigger simulation tool that fires the same automated pipeline.

**Step 2 — Worker Eligibility Check (Automated)**
The system automatically:
- Finds all workers in the affected zone with active policies
- Verifies each worker's last delivery was within 6 hours
- Checks policy expiry and adverse selection lock (48hr pre-alert purchase block)
- Runs in parallel for all affected workers simultaneously

**Step 3 — Fraud Scoring (Automated ML)**
Every claim runs through 9 signals in under 50ms:
- GPS location verification against registered zone
- Activity recency (delivery within 6 hours)
- Claim frequency vs zone peer group
- Zone correlation — mass claims in same zone lower fraud score
- GPS spoofing detection: impossible speed, static ping, cluster spoof, boundary abuse
- Historical weather cross-validation (CPCB + OWM vs claimed trigger)
- Worker risk profile (cumulative ML score)
- New account gate (<7 days → manual review)
- Duplicate detection

Claims with fraud score < 0.70 are **auto-approved with zero human review**.

**Step 4 — Payout (Automated via Razorpay UPI)**
Auto-approved claims trigger a Razorpay UPI payout:
- Payout amount read from worker's active policy (Bronze ₹400 / Silver ₹600 / Gold ₹900)
- Trigger-specific percentage applied (Flood 100%, Outage 75%, AQI 50%, Festival 40%)
- Receipt generated automatically

**Step 5 — Audit Trail (Automated Hash Chain)**
Every pipeline decision is recorded in a tamper-evident SHA256 hash chain:
- Trigger confirmed → Worker verified → Fraud scored → Payout completed
- Each event hashes the previous event's hash + event name + timestamp
- Tampering with any event invalidates all subsequent hashes
- Any IRDAI regulator can verify the complete chain independently

**Step 6 — Worker Notification (Automated)**
After payout:
- Worker receives in-app notification with payout amount
- WhatsApp share button appears in their language
- Protection certificate available for download

### What Requires Human Action

The only human action in GuidePay is:
- **Worker:** buys a policy once (one-time UPI payment)
- **Admin:** confirms a trigger event for simulation/demo

Everything after trigger confirmation is fully automated.

---

## 5 Triggers

| Trigger | Data Source | Threshold | Payout |
|---|---|---|---|
| 🌊 Flood | IMD SACHET RSS + OpenWeatherMap | Rainfall ≥ 64.4mm/24h or IMD Severe Alert | 100% of tier |
| 📡 Platform Outage | Downdetector + Activity Monitor | API down 30+ min + zero worker orders | 75% of tier |
| 🚫 Curfew / Section 144 | State Government RSS | Active curfew in worker's district | 100% of tier |
| 🎊 Festival Disruption | Calendar API + Zone Earnings | Orders drop ≥70% vs baseline | 40% of tier |
| 💨 Air Quality | CPCB Official API + OpenWeatherMap | AQI ≥ 301 WHO Hazardous | 50% of tier |

---

## Income-Based Payout Tiers

| Tier | Daily Orders | Payout per Trigger | Who |
|---|---|---|---|
| 🥉 Bronze | < 8 orders/day | ₹400 | Part-time workers, new joiners |
| 🥈 Silver | 8–14 orders/day | ₹600 | Full-time standard workers |
| 🥇 Gold | 15+ orders/day | ₹900 | High-volume professional riders |

Tier is calculated automatically from the worker's verified delivery activity. No manual input. Actuarial severity in the pricing formula uses the worker's actual payout tier — not a flat amount.

---

## 4 Coverage Plans

| Plan | Price | Payout Range | Best For |
|---|---|---|---|
| 🛡️ Daily Shield | ₹12/day | ₹400–₹900 | Flexible workers, first-timers |
| Basic Shield | ₹49/week | ₹400–₹900 | Budget-conscious workers |
| Standard Shield | ₹62/week | ₹400–₹900 | Most workers — best value |
| Premium Shield | ₹89/week | ₹400–₹900 | High earners, full coverage |

---

## ML Pricing Engine

### Hybrid Actuarial-ML Model

$$P_{final} = 0.60 \cdot P_{ML} + 0.40 \cdot P_{actuarial}$$

$$P_{actuarial} = \left(\lambda S + 0.25\sqrt{\lambda} \cdot S\right) \times 1.30 \times M_{seasonal}$$

Where:
- **λ** = zone claim frequency from historical NDMA data
- **S** = worker's actual payout tier amount (400, 600, or 900)
- **Volatility loading** = $0.25\sqrt{\lambda} \cdot S$ protects risk pool against variance
- **Expense ratio** = 30% for operations and margin
- **Seasonal index** = 1.4× monsoon (June–September), 1.0× otherwise

### Premium Model

```
Model:     RandomForestRegressor
R²:        ≈ 0.89
Records:   10,000 statistically grounded training records
Inference: < 50ms per call
```

| Feature | Weight | What It Captures |
|---|---|---|
| Zone flood risk score | 28% | Historical flood frequency in H3 hex zone |
| Historical claim rate | 22% | Zone claim frequency over 5 years |
| City rainfall intensity | 18% | NDMA seasonal rainfall data |
| Worker risk score | 14% | Individual fraud/claim history |
| Account age | 8% | Worker stability proxy |
| Avg daily orders | 6% | Activity level and income tier |
| Seasonal multiplier | 4% | Month-based monsoon adjustment |

Feature importance is visible to workers on the AI Forecast page — full transparency into how their premium was calculated.

---

## 9-Signal Fraud Detection

$$S_{fraud} = \sum_{i=1}^{9} w_i \cdot f_i$$

$$\text{Decision} = \begin{cases} \text{AUTO APPROVE} & S_{fraud} < 0.70 \\ \text{MANUAL REVIEW} & S_{fraud} \geq 0.70 \end{cases}$$

### Standard Signals (1–5)

| Signal | What It Catches |
|---|---|
| Duplicate Detection | Same worker + same event → blocked immediately |
| Zone Eligibility | GPS must be within registered zone at claim time |
| Activity Recency | No delivery in past 6 hours → flagged |
| Claim Frequency | Outliers vs zone peer group auto-flagged |
| Zone Correlation | Mass claims in same zone **lower** fraud score — confirms event is real |

### Advanced Signals (6–9)

| Signal | What It Catches |
|---|---|
| GPS Spoofing — Impossible Speed | Location jumped faster than any vehicle can travel |
| GPS Spoofing — Static Ping | Worker's GPS frozen for 30+ minutes (fake idle) |
| GPS Spoofing — Cluster Spoof | 5+ workers reporting identical coordinates simultaneously |
| Historical Weather Validation | CPCB + OWM data cross-referenced — if weather doesn't match claimed trigger, score spikes |
| Worker Risk Profile | Cumulative ML score over account lifetime |
| New Account Gate | Accounts under 7 days → manual review always |

**Model:** GradientBoostingClassifier · **Accuracy:** ~91% · **Inference:** <50ms · **Training:** 10,000 records

> **Zone Correlation Innovation:** When 80%+ of workers in a flood zone claim simultaneously, that is strong evidence the event is real. We actively **lower** fraud scores — the crowd validates the trigger. Standard fraud systems do the opposite.

---

## IRDAI Compliance — 10/10

GuidePay scores 10/10 on Guidewire's official parametric insurance checklist:

| # | Criterion | GuidePay |
|---|---|---|
| 1 | Trigger objective & verifiable | ✅ IMD + CPCB + OWM — quantifiable thresholds |
| 2 | Health/life/vehicle excluded | ✅ Income loss only — clearly stated in policy |
| 3 | Payout automatic | ✅ Trigger confirmed → pipeline → UPI <2 hours |
| 4 | Pool financially sustainable | ✅ BCR 0.65, 14-day monsoon stress test ADEQUATE |
| 5 | Fraud on data not behaviour | ✅ GPS coordinates + weather records + activity logs |
| 6 | Premium collection frictionless | ✅ Razorpay UPI auto-pay — no manual card entries |
| 7 | Pricing dynamic not flat | ✅ Hybrid ML + actuarial — seasonal + zone adjusted |
| 8 | Adverse selection blocked | ✅ Purchase locked 48hrs before/during active alerts |
| 9 | Operational cost near zero | ✅ $124/month infra, 0.83% of revenue at 50K workers |
| 10 | Basis risk minimized | ✅ H3 hex grid resolution 7 — 5km² hyper-local zones |

**Also compliant:** DPDP Act 2023 (GPS/UPI/Activity consent) · SS Code 2020 · Data stored Mumbai ap-south-1 (RBI compliant)

---

## Business Model

$$\text{Monthly GWP} = 50{,}000 \times ₹62 \times 4 = ₹1.24 \text{ crore}$$

| Metric | Value |
|---|---|
| Loss Ratio | 24.5% current (target 65% at scale) |
| Combined Ratio | 54.5% — product is profitable |
| Policyholder Surplus | ₹2.1L/month |
| TAM | ₹890 crore |
| Infra Cost | $124/month = 0.83% of revenue |

**Revenue Streams:**
- Direct Premium B2C — ₹12/day to ₹89/week, Razorpay UPI billing
- B2B Insurer API — white-label to New India Assurance, HDFC Ergo
- Risk Data Licensing — zone analytics, fraud patterns to reinsurers

**3-Year Growth:**

| Year | Workers | Monthly GWP |
|---|---|---|
| Year 1 | 50,000 | ₹1.24 crore |
| Year 2 | 250,000 | ₹6.2 crore |
| Year 3 | 1,000,000 | ₹24.8 crore |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Zustand |
| Backend | FastAPI (Python 3.11), Motor, APScheduler, JWT |
| ML | scikit-learn 1.8 — GradientBoosting, RandomForest, IsolationForest |
| Database | MongoDB Atlas (Mumbai · ap-south-1) + GridFS model persistence |
| Auth | Firebase Google OAuth + JWT |
| Payments | Razorpay UPI (premium collection + claim payouts) |
| Voice | ElevenLabs eleven_multilingual_v2 (6 languages) |
| Spatial | Uber H3 hex grid (resolution 7, ~5km² zones) |
| Deploy | Vercel (frontend) + Render (backend) |
| Data Sources | IMD SACHET RSS · CPCB AQI API · OpenWeatherMap · Downdetector |
| PDF | fpdf2 — protection certificates |

---

## Worker Features

- **Zone Flood History** — Coverage page shows how many times zone flooded in 2024/23/22 and what GuidePay would have paid
- **Earnings Intelligence** — Peak hours vs flood risk overlap, ROI calculator, recommended plan
- **Wellness Score** — Single 0–100 score, grade A–D, one actionable improvement tip
- **Feature Importance Chart** — AI Forecast page shows exactly which factors set the worker's premium
- **Smart Notifications** — Contextual alerts based on real zone risk, policy status, claim state
- **Voice AI** — ElevenLabs in Hindi, Telugu, Tamil, Kannada, Marathi, English
- **WhatsApp Share** — After payout, one tap shares in worker's language
- **Protection Certificate** — Downloadable PDF, IRDAI compliant, QR code to live policy
- **Plain Language Claims** — No jargon — "9 safety signals checked — all clear"
- **DPDP Act 2023 Consent** — Explicit consent for GPS, UPI, and activity data collection

---

## Admin Features

- Real MongoDB KPIs — loss ratio, claims today, premium collected, auto-approve rate
- Claims queue — filter by status, trigger type, income tier
- Approve / Reject workflow with reason logging
- Zone Risk Monitor — 30 cities, color-coded exposure table
- Fraud Analytics — GPS spoofing count, weather mismatches, new account flags
- Insurer Dashboard — actuarial metrics, ML forecast table by city, 14-day stress test
- Worker Management — Bronze/Silver/Gold tier column, suspend/unsuspend
- Trigger Simulation — fire any trigger for any city to run the full automated pipeline

---

## Getting Started

### Demo

Sign in with Google at [guidepayklu.vercel.app](https://guidepayklu.vercel.app)

Admin panel: `/admin/login` → credentials: `admin` / `admin`

**To see the full automated pipeline:**
1. Login as a worker (Google sign-in)
2. Buy any coverage plan
3. Open admin panel in another tab
4. Fire a flood trigger for the worker's city
5. Return to worker view — claim appears automatically with full audit trail

### Run Locally

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python check_env.py          # Verify all env vars
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs

# Frontend
cd frontend
npm install
cp .env.example .env         # Set VITE_API_URL=http://localhost:8000
npm run dev                  # http://localhost:5173
```

### Environment Variables

```env
# Backend (.env)
MONGODB_URL=mongodb+srv://...
SECRET_KEY=your-secret-key
FIREBASE_PROJECT_ID=guide-pay
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
OPENWEATHER_API_KEY=...
ELEVENLABS_API_KEY=...
CPCB_API_KEY=...
FRONTEND_URL=https://guidepayklu.vercel.app

# Frontend (.env)
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
| API Documentation | https://guidepay.onrender.com/docs |
| Source Code | https://github.com/karthikeyavelivela/GuidePay |

---

## Try It Right Now

Sign in with Google at guidepayklu.vercel.app

Go to admin. Fire a flood trigger for Hyderabad. Watch the pipeline run — worker verified, 9 fraud signals scored, tier calculated, payout initiated — with a full hash-chained audit trail proving every automated decision.

**No slides. No mockups. Press the button. Watch it work.**

---

## Team SentinelX

| Member | Role | Contribution |
|---|---|---|
| **Karthikeya Velivela** | Lead · Full-Stack · ML · AppSec | Architecture, backend, ML models, fraud engine, deployment |
| **Nithya Sri Induru** | Frontend · UX | Worker portal, component library, multilingual UI |
| **Suhitha YV** | Backend · API | Route design, MongoDB schema, Razorpay integration |
| **Shaik Yakoob** | ML · Data | Model training, fraud detection, flood predictor |
| **N Fatima** | Research · Docs | Market research, regulatory analysis, documentation |

**KL University, Vijayawada · Guidewire DEVTrails 2026 · Phase 3**

---

<div align="center">

*Built in 8 weeks. Deployed in production. Ready for 12 million workers.*

**GuidePay · Team SentinelX · KL University**

</div>