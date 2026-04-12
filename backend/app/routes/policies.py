from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.routes.auth import get_current_worker
from app.utils.formatters import serialize_doc
from datetime import datetime, timedelta
import logging
from app.core.constants import PLANS

router = APIRouter()
logger = logging.getLogger(__name__)

DAILY_PLAN = {
    "id": "daily",
    "name": PLANS["daily"]["name"],
    "plan_type": "daily",
    "premium": PLANS["daily"]["price_inr"],
    "coverage_hours": PLANS["daily"]["coverage_hours"],
    "description": PLANS["daily"]["display_price"],
    "badge": PLANS["daily"]["badge"],
}

def check_daily_policy_expiry(policy: dict) -> bool:
    """Returns True if a daily policy is still valid."""
    if policy.get("plan_type") != "daily":
        return True
    expires_at = policy.get("expires_at")
    if not expires_at:
        return False
    return datetime.utcnow() < expires_at

@router.get("/my/active")
async def get_active_policy(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get current worker's active policy."""
    worker_id = str(current_worker["_id"])

    policy = await db.policies.find_one({
        "worker_id": worker_id,
        "status": "ACTIVE"
    })

    if not policy:
        return {"policy": None, "message": "No active policy"}

    if policy.get("plan_type") == "daily" and not check_daily_policy_expiry(policy):
        # Allow the background APScheduler job to expire it, but don't return it as active to the user.
        return {"policy": None, "message": "Daily policy expired"}

    return serialize_doc(policy)

@router.get("/my")
async def get_my_policies(
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get all policies for current worker"""
    worker_id = str(current_worker["_id"])

    policies = await db.policies.find(
        {"worker_id": worker_id}
    ).sort("created_at", -1).to_list(50)

    return {
        "policies": [serialize_doc(p) for p in policies],
        "total": len(policies)
    }

@router.get("/{policy_id}")
async def get_policy(
    policy_id: str,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Get a specific policy"""
    worker_id = str(current_worker["_id"])

    policy = await db.policies.find_one({"_id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if policy["worker_id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return serialize_doc(policy)

@router.get("/{policy_id}/certificate")
async def generate_policy_certificate(
    policy_id: str,
    current_worker=Depends(get_current_worker),
    db=Depends(get_db)
):
    """Generate PDF protection certificate for policy"""
    from fastapi.responses import Response
    from fpdf import FPDF
    import io
    
    worker_id = str(current_worker["_id"])
    
    policy = await db.policies.find_one({"_id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    if policy["worker_id"] != worker_id and current_worker.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    class PDF(FPDF):
        def header(self):
            # Watermark
            self.set_font('Helvetica', 'B', 50)
            self.set_text_color(240, 240, 240)
            self.cell(0, 100, 'GUIDEPAY PROTECTED', 0, 0, 'C')
            self.set_y(20)
            self.set_font('Helvetica', 'B', 20)
            self.set_text_color(0, 0, 0)
            self.cell(0, 10, 'Income Protection Certificate', 0, 1, 'C')
            self.ln(10)
            
    pdf = PDF()
    pdf.add_page()
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Policy Holder:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, str(current_worker.get('name', 'N/A')), 0, 1)
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Policy ID:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, str(policy.get('_id')), 0, 1)
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Worker ID:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, worker_id, 0, 1)
    
    pdf.ln(5)
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Zone Protected:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, str(current_worker.get('zone', 'N/A')), 0, 1)
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Plan Type:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, str(policy.get('plan_type', 'N/A')).capitalize(), 0, 1)
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Coverage Cap:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, f"Rs {policy.get('coverage_cap', 'N/A')}", 0, 1)
    
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(50, 10, "Status:", 0, 0)
    pdf.set_font("Helvetica", '', 12)
    pdf.cell(0, 10, str(policy.get('status', 'ACTIVE')), 0, 1)
    
    expires_at = policy.get('week_end') or policy.get('expires_at')
    if expires_at:
        pdf.set_font("Helvetica", 'B', 12)
        pdf.cell(50, 10, "Valid Until:", 0, 0)
        pdf.set_font("Helvetica", '', 12)
        pdf.cell(0, 10, expires_at.strftime('%Y-%m-%d %H:%M UTC'), 0, 1)
        
    pdf.ln(20)
    pdf.set_font("Helvetica", 'I', 10)
    pdf.cell(0, 10, "This is an automatically generated parametric insurance certificate.", 0, 1, 'C')
    pdf.cell(0, 10, "Coverage is subject to GuidePay terms and automated verification.", 0, 1, 'C')
    
    # Render PDF completely to memory
    pdf_bytes = pdf.output()
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=GuidePay_Certificate_{policy_id}.pdf"
    })

