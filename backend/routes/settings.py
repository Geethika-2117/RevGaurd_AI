from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Organization
from ..schemas import CompanySettingsResponse, OrgUserResponse
from ..auth import get_current_user, get_current_org, require_role

router = APIRouter(prefix="/api/settings", tags=["Organization Settings"])

@router.get("/company", response_model=CompanySettingsResponse)
def get_company_settings(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    admin = db.query(User).filter(
        User.organization_id == org.id,
        User.role == "ADMIN"
    ).first()

    return CompanySettingsResponse(
        name=org.name,
        merchant_id=org.merchant_id,
        org_code=org.org_code or f"ORG-{org.id:04d}",
        admin_email=admin.email if admin else current_user.email,
        created_at=org.created_at
    )

@router.get("/users", response_model=List[OrgUserResponse])
def get_company_users(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    # Only return users strictly belonging to the authenticated tenant
    users = db.query(User).filter(User.organization_id == org.id).order_by(User.id.asc()).all()
    return [
        OrgUserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            status="Active",
            created_at=u.created_at
        )
        for u in users
    ]
