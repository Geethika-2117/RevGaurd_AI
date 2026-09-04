import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Organization, AuditLog
from ..schemas import (
    LoginRequest, RegisterRequest, TokenResponse, UserProfileResponse, DemoAccountInfo
)
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user, get_current_org

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_company(request: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Validation & Normalization
    company_name = request.company_name.strip()
    admin_name = (request.admin_name or request.name or "Admin").strip()
    raw_email = (request.email or request.admin_email or request.company_email or request.business_email or "").strip()
    admin_email = raw_email.lower()
    password = request.password

    if len(company_name) < 2:
        raise HTTPException(status_code=400, detail="Company name must be at least 2 characters.")
    if len(admin_name) < 2:
        raise HTTPException(status_code=400, detail="Admin name must be at least 2 characters.")
    if "@" not in admin_email or "." not in admin_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if request.confirm_password is not None and request.confirm_password != password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Determine or auto-generate merchant ID
    if request.merchant_id and request.merchant_id.strip():
        merchant_id = request.merchant_id.strip()
    else:
        slug = "".join(c for c in company_name if c.isalnum()).upper()[:8] or "CORP"
        merchant_id = f"MID-{slug}-{secrets.token_hex(2).upper()}"

    # 2. Uniqueness checks
    existing_user = db.query(User).filter(User.email == admin_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    existing_merchant = db.query(Organization).filter(Organization.merchant_id == merchant_id).first()
    if existing_merchant:
        merchant_id = f"{merchant_id}-{secrets.token_hex(2).upper()}"

    # 3. Generate unique Organization Code (e.g. ORG-A8F31)
    org_code = f"ORG-{secrets.token_hex(3).upper()}"

    # 4. Create Organization
    org = Organization(
        name=company_name,
        merchant_id=merchant_id,
        org_code=org_code,
        created_at=datetime.datetime.utcnow()
    )
    db.add(org)
    db.flush()

    # 5. Create Admin User
    user = User(
        organization_id=org.id,
        name=admin_name,
        email=admin_email,
        password_hash=get_password_hash(password),
        role="ADMIN",
        created_at=datetime.datetime.utcnow()
    )
    db.add(user)
    db.flush()

    # 6. Audit Log
    audit = AuditLog(
        organization_id=org.id,
        user_id=user.id,
        event_type="COMPANY_REGISTERED",
        entity_type="Organization",
        entity_id=str(org.id),
        description=f"Company '{company_name}' registered with merchant ID '{merchant_id}'. Admin '{admin_name}' assigned role ADMIN.",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    db.refresh(org)

    # 7. Generate Token
    token = create_access_token(data={
        "user_id": user.id,
        "organization_id": org.id,
        "role": user.role
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        organization_id=org.id,
        organization_name=org.name,
        merchant_id=org.merchant_id,
        org_code=org.org_code or f"ORG-{org.id:04d}"
    )

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    # Audit log on login
    db.add(AuditLog(
        organization_id=org.id,
        user_id=user.id,
        event_type="LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        description=f"User '{user.name}' ({user.email}) logged in to workspace {org.name}.",
        timestamp=datetime.datetime.utcnow()
    ))
    db.commit()

    token = create_access_token(data={
        "user_id": user.id,
        "organization_id": user.organization_id,
        "role": user.role
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        organization_id=org.id,
        organization_name=org.name,
        merchant_id=org.merchant_id,
        org_code=org.org_code or f"ORG-{org.id:04d}"
    )

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    db.add(AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="LOGOUT",
        entity_type="User",
        entity_id=str(current_user.id),
        description=f"User '{current_user.name}' ({current_user.email}) logged out of workspace {org.name}.",
        timestamp=datetime.datetime.utcnow()
    ))
    db.commit()
    return {"status": "SUCCESS", "message": "Successfully logged out."}

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        organization_id=current_user.organization_id,
        organization_name=org.name if org else "Unknown",
        merchant_id=org.merchant_id if org else "N/A",
        org_code=(org.org_code if org else None) or f"ORG-{current_user.organization_id:04d}"
    )

@router.get("/demo-accounts")
def get_demo_accounts():
    return []
