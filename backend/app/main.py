from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import connect_db, disconnect_db
from app.routes import (
    auth, workers, policies, claims,
    triggers, payments, forecast, admin
)
from app.services.imd_service import start_trigger_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    await start_trigger_scheduler()
    logger.info("Guide-Pay API started")
    yield
    # Shutdown
    await disconnect_db()
    logger.info("Guide-Pay API stopped")


app = FastAPI(
    title="Guide-Pay API",
    description="Parametric income insurance for gig delivery workers",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        settings.frontend_url_local,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(workers.router, prefix="/api/v1/workers", tags=["workers"])
app.include_router(policies.router, prefix="/api/v1/policies", tags=["policies"])
app.include_router(claims.router, prefix="/api/v1/claims", tags=["claims"])
app.include_router(triggers.router, prefix="/api/v1/triggers", tags=["triggers"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(forecast.router, prefix="/api/v1/forecast", tags=["forecast"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/")
async def root():
    return {
        "service": "Guide-Pay API",
        "version": "2.0.0",
        "status": "operational",
        "phase": "Phase 2 — Scale"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
