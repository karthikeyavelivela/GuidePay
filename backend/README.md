# Guide-Pay Backend API

FastAPI backend for parametric income insurance for gig delivery workers.

## Setup

1. Install Python 3.11+
2. Create virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   venv\Scripts\activate     # Windows
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
5. Run development server:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

## API Docs
Visit http://localhost:8000/docs after starting the server.

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `guidepay`) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase service account key ID |
| `FIREBASE_PRIVATE_KEY` | Firebase RSA private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_CLIENT_ID` | Firebase client ID |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `SECRET_KEY` | JWT signing secret (64+ chars) |
| `FRONTEND_URL` | Deployed frontend URL (CORS) |

## Deploy to Railway

1. Connect GitHub repo at railway.app
2. Add all environment variables from `.env.example`
3. Railway auto-detects Dockerfile and deploys

## Architecture

- **FastAPI** + **Motor** (async MongoDB driver)
- **Firebase Admin** for phone auth token verification
- **APScheduler** for 15-minute IMD trigger polling
- **Razorpay** for payments and payouts
- **Rule-based ML** for flood prediction + fraud detection

## API Endpoints

### Auth
- `POST /api/v1/auth/login` — Firebase token → JWT
- `POST /api/v1/auth/logout`

### Workers
- `GET /api/v1/workers/me` — Profile + active policy + stats
- `PUT /api/v1/workers/me` — Update profile
- `GET /api/v1/workers/me/risk-score` — Recalculate risk score

### Policies
- `GET /api/v1/policies/my/active` — Active policy
- `GET /api/v1/policies/my` — All policies

### Payments
- `POST /api/v1/payments/create-order` — Create Razorpay order
- `POST /api/v1/payments/verify` — Verify + activate policy

### Claims
- `GET /api/v1/claims/my` — My claims
- `GET /api/v1/claims/{id}` — Claim detail

### Triggers
- `GET /api/v1/triggers/active` — Active trigger events
- `GET /api/v1/triggers/my-zone` — Triggers in my zone

### Forecast
- `GET /api/v1/forecast/zones` — AI forecast for all zones
- `GET /api/v1/forecast/my-zone` — My zone forecast

### Admin
- `GET /api/v1/admin/stats` — Dashboard stats
- `GET /api/v1/admin/claims/queue` — Claims review queue
- `PATCH /api/v1/admin/claims/{id}/approve`
- `PATCH /api/v1/admin/claims/{id}/reject`
- `GET /api/v1/admin/analytics`
