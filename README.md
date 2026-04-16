<div align="center">

<img src="https://res.cloudinary.com/dqwm8wgg8/image/upload/v1775229340/u4qsxq76ijd9vw6yjhwj.gif" height="220" width="310" alt="GuidePay"/>

# GuidePay

**Parametric Income Insurance for India's Gig Delivery Workers**

Guidewire DEVTrails 2026 · Phase 3 · Team SentinelX · KL University

[![Live Demo](https://img.shields.io/badge/Live_Demo-guidepayklu.vercel.app-FF6900?style=for-the-badge&logo=vercel&logoColor=white)](https://guidepayklu.vercel.app)
[![API](https://img.shields.io/badge/API_Docs-guidepay.onrender.com-430098?style=for-the-badge&logo=render&logoColor=white)](https://guidepay.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/karthikeyavelivela/GuidePay)
[![Phase 2](https://img.shields.io/badge/Phase_2-4_Stars_+42,000_DC-FFD700?style=for-the-badge)](https://guidepayklu.vercel.app)

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

He is one of 12 million gig delivery workers in India. Zero insurance products existed for him. GuidePay fixes that.

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

## What Changed in Phase 3

Phase 2 judges awarded 4 stars with specific feedback. We addressed every point:

| Phase 2 Feedback | Phase 3 Solution |
|---|---|
| Flat ₹600 payout regardless of income | Income-tiered payouts — Bronze ₹400 / Silver ₹600 / Gold ₹900 |
| No actuarial domain depth | Hybrid actuarial-ML pricing with volatility loading |
| Affordability concern | Daily Shield plan at ₹12/day |
| 5 hardcoded cities | 30 Indian cities with H3 hex zone pricing |
| Flat ML training data | 10,000 statistically grounded training records |
| No feature transparency | Feature importance API with ranked weights |
| No insurer metrics | Full actuarial dashboard — combined ratio, loss ratio, stress test |
| Models lost on restart | MongoDB GridFS persistence — survives Render restarts |

---

## 5 Automated Triggers

Every trigger connects to a live public API. APScheduler polls every 15 minutes, 24/7.

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

---

## 4 Coverage Plans

| Plan | Price | Best For |
|---|---|---|
| 🛡️ Daily Shield | ₹12/day | Flexible workers, first-timers |
| Basic Shield | ₹49/week | Budget-conscious workers |
| Standard Shield | ₹62/week | Most workers — best value |
| Premium Shield | ₹89/week | High earners, full coverage |

---

## ML Pricing Engine

### Hybrid Actuarial-ML Model

$$P_{final} = 0.60 \cdot P_{ML} + 0.40 \cdot P_{actuarial}$$

$$P_{actuarial} = \left(\lambda S + 0.25\sqrt{\lambda} \cdot S\right) \times 1.30 \times M_{seasonal}$$

Where **S** = worker's actual payout tier (400/600/900) — not flat 600.

### Premium Model Stats

```
Model:     RandomForestRegressor
R²:        ≈ 0.89
Records:   10,000 training records
Inference: < 50ms
Features:  Zone flood risk (28%), Historical claim rate (22%),
           City rainfall (18%), Worker risk score (14%),
           Account age (8%), Avg daily orders (6%), Seasonal (4%)
```

---

## 9-Signal Fraud Detection

$$S_{fraud} = \sum_{i=1}^{9} w_i \cdot f_i$$

$$\text{Decision} = \begin{cases} \text{AUTO APPROVE} & S < 0.70 \\ \text{MANUAL REVIEW} & S \geq 0.70 \end{cases}$$

**Standard Signals (1–5):** Duplicate detection · Zone eligibility · Activity recency · Claim frequency · Zone correlation

**Advanced Signals (6–9):** GPS spoofing (4 sub-signals: impossible speed, static ping, cluster spoof, boundary abuse) · Historical weather validation · Worker risk profile · New account gate

**Model:** GradientBoostingClassifier · **Accuracy:** ~91% · **Inference:** <50ms

> Zone Correlation Innovation: When 80%+ of workers in a flood zone claim simultaneously, we actively **lower** fraud scores — the crowd validates the event is real.

---

## Guidewire Platform Integration

**Phase 4 Roadmap:**
- **PolicyCenter API** — GuidePay parametric policies as a product type within PolicyCenter
- **ClaimCenter Integration** — Auto-approved claims as completed transactions; manual review routes to adjuster queue  
- **Guidewire Cloud** — Trigger engine deployable as a Guidewire Cloud microservice

GuidePay extends Guidewire's platform into India's 12 million gig worker segment.

---

## IRDAI Compliance — 10/10

| # | Criterion | Status |
|---|---|---|
| 1 | Trigger objective & verifiable | ✅ IMD + CPCB + OWM |
| 2 | Health/life/vehicle excluded | ✅ Income loss only |
| 3 | Payout automatic | ✅ Trigger → GPS → UPI <2 hours |
| 4 | Pool financially sustainable | ✅ BCR 0.65, 14-day stress test ADEQUATE |
| 5 | Fraud on data not behaviour | ✅ GPS + weather + activity logs |
| 6 | Premium collection frictionless | ✅ Razorpay UPI auto-pay |
| 7 | Pricing dynamic not flat | ✅ Hybrid ML + actuarial |
| 8 | Adverse selection blocked | ✅ Purchase locked 48hrs before alerts |
| 9 | Operational cost near zero | ✅ $124/month, 0.83% of revenue |
| 10 | Basis risk minimized | ✅ H3 hex resolution 7, 5km² zones |

**Also compliant:** DPDP Act 2023 · SS Code 2020 · Data residency Mumbai ap-south-1 (RBI)

---

## Business Model

$$\text{Monthly GWP} = 50{,}000 \times ₹62 \times 4 = ₹1.24 \text{ crore}$$

| Year | Workers | Monthly GWP |
|---|---|---|
| Year 1 | 50,000 | ₹1.24 crore |
| Year 2 | 250,000 | ₹6.2 crore |
| Year 3 | 1,000,000 | ₹24.8 crore |

**TAM:** ₹890 crore · **Loss Ratio:** 24.5% (target 65%) · **Combined Ratio:** 54.5%

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Zustand |
| Backend | FastAPI (Python 3.11), Motor, APScheduler, JWT |
| ML | scikit-learn 1.8 — GradientBoosting, RandomForest, IsolationForest |
| Database | MongoDB Atlas (Mumbai · ap-south-1) + GridFS |
| Auth | Firebase Phone OTP + Google OAuth + JWT |
| Payments | Razorpay UPI (collection + payout) |
| Voice | ElevenLabs eleven_multilingual_v2 |
| Spatial | Uber H3 hex grid (resolution 7) |
| Deploy | Vercel (frontend) + Render (backend) |
| Data Sources | IMD SACHET RSS · CPCB API · OpenWeatherMap · Downdetector |

---

## Getting Started

### Demo

| Access | Credentials |
|---|---|
| Worker | Login with phone number → OTP |
| Admin | `/admin/login` → `admin` / `admin` |

### Run Locally

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install
cp .env.example .env
npm run dev
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

Open the app. Login with your phone number. Go to admin. Fire a flood trigger for Hyderabad. Watch ₹600 appear in the worker's claim timeline — with the full hash-chained ML audit trail — in under 2 minutes.

**No slides. No mockups. No promises. Press the button. Watch it work.**

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

*Built in 8 weeks. Deployed in production. Ready for 12 million workers.*

**GuidePay · Team SentinelX · KL University**

</div>