import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Organization, LeakageCase, Customer, Payment, RecoveryAction, AuditLog
from ..schemas import LeakageCaseItem, LeakageActionRequest, PolicyCheckResponse, ApprovalRequestResponse
from ..auth import get_current_user, get_current_org
from ..policy_engine import evaluate_recovery_policy, build_policy_check_response, HIGH_VALUE_THRESHOLD

router = APIRouter(prefix="/api/leakage", tags=["Revenue Leakage"])

def format_case(case: LeakageCase, db: Session) -> LeakageCaseItem:
    cust = db.query(Customer).filter(Customer.id == case.customer_id).first() if case.customer_id else None
    payment = db.query(Payment).filter(Payment.id == case.payment_id).first() if case.payment_id else None
    
    return LeakageCaseItem(
        id=case.id,
        customer_name=cust.name if cust else "Direct Checkout",
        customer_email=cust.email if cust else None,
        transaction_id=payment.transaction_id if payment else None,
        leakage_type=case.leakage_type,
        amount_at_risk=case.amount_at_risk,
        risk_score=case.risk_score,
        recovery_probability=case.recovery_probability,
        expected_recovery=case.expected_recovery,
        root_cause=case.root_cause or "Automated diagnosis in progress.",
        root_cause_confidence=case.root_cause_confidence,
        recommended_action=case.recommended_action or "PAYMENT_RETRY",
        policy_status=case.policy_status,
        action_status=case.action_status,
        revenue_recovered=case.revenue_recovered,
        created_at=case.created_at,
        updated_at=case.updated_at
    )

@router.get("", response_model=List[LeakageCaseItem])
def list_leakage_cases(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    query = db.query(LeakageCase).filter(LeakageCase.organization_id == org.id)
    if category:
        query = query.filter(LeakageCase.leakage_type == category.upper())
    if status_filter:
        query = query.filter(LeakageCase.action_status == status_filter.upper())
        
    cases = query.order_by(LeakageCase.amount_at_risk.desc()).all()
    return [format_case(c, db) for c in cases]

@router.get("/{case_id}", response_model=LeakageCaseItem)
def get_leakage_case(
    case_id: int,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
        
    # Strict Tenant Isolation Check
    if case.organization_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Case #{case_id} belongs to another organization. Cross-tenant access is strictly prohibited."
        )
        
    return format_case(case, db)

@router.post("/{case_id}/policy-check", response_model=PolicyCheckResponse)
def check_case_policy(
    case_id: int,
    req: Optional[LeakageActionRequest] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
    if case.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied. Cross-tenant action blocked.")

    action_to_take = (req.action_type if req else None) or case.recommended_action or "PAYMENT_RETRY"
    action_count = db.query(RecoveryAction).filter(RecoveryAction.leakage_case_id == case.id).count()
    result = build_policy_check_response(case, action_to_take, action_count)
    return PolicyCheckResponse(**result)

@router.post("/{case_id}/request-approval", response_model=ApprovalRequestResponse)
def request_recovery_approval(
    case_id: int,
    req: Optional[LeakageActionRequest] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
    if case.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied. Cross-tenant action blocked.")

    if case.action_status in ["RECOVERED", "STOPPED"]:
        raise HTTPException(status_code=400, detail=f"Cannot request approval: Case is already in terminal state '{case.action_status}'.")

    action_to_take = (req.action_type if req else None) or case.recommended_action or "SEND_PAYMENT_LINK"
    now = datetime.datetime.utcnow()
    reason_text = f"Policy threshold exceeded: Case amount (₹{case.amount_at_risk:,.2f}) exceeds automatic recovery limit of ₹{HIGH_VALUE_THRESHOLD:,.2f}. Human finance authorization required."

    action = RecoveryAction(
        organization_id=org.id,
        leakage_case_id=case.id,
        action_type=action_to_take,
        reason=reason_text,
        status="PENDING_APPROVAL",
        requested_by=current_user.id,
        requested_at=now,
        amount_recovered=0.0
    )
    db.add(action)
    db.flush()

    case.action_status = "PENDING_APPROVAL"
    case.policy_status = "REQUIRES_HUMAN_REVIEW"

    cust = db.query(Customer).filter(Customer.id == case.customer_id).first() if case.customer_id else None
    cust_name = cust.name if cust else "Direct Checkout"

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="RECOVERY_APPROVAL_REQUESTED",
        entity_type="RecoveryAction",
        entity_id=str(action.id),
        description=f"Finance approval requested for Case #{case.id} ({cust_name}). Amount: ₹{case.amount_at_risk:,.2f} exceeds automatic limit of ₹{HIGH_VALUE_THRESHOLD:,.2f}. Recommended action: '{action_to_take}'. Requested by {current_user.name} ({current_user.email}, role: {current_user.role}).",
        timestamp=now,
        metadata_json=json.dumps({
            "organization_id": org.id,
            "user_id": current_user.id,
            "leakage_case_id": case.id,
            "amount": case.amount_at_risk,
            "recommended_action": action_to_take,
            "policy_threshold": HIGH_VALUE_THRESHOLD,
            "reason": reason_text
        })
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    db.refresh(case)

    return ApprovalRequestResponse(
        action_id=action.id,
        case_id=case.id,
        action_type=action.action_type,
        status=action.status,
        amount_at_risk=case.amount_at_risk,
        reason=action.reason,
        requested_by=current_user.name,
        requested_at=action.requested_at,
        message="Finance approval request successfully submitted. Awaiting manager review."
    )

@router.post("/{case_id}/recover", response_model=LeakageCaseItem)
def execute_recovery_action(
    case_id: int,
    req: LeakageActionRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
    if case.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied. Cross-tenant action blocked.")

    if case.action_status == "STOPPED":
        raise HTTPException(status_code=400, detail="Cannot execute recovery: Case workflow was stopped.")
    if case.action_status == "RECOVERED":
        raise HTTPException(status_code=400, detail="Cannot execute recovery: Case is already recovered.")

    action_to_take = req.action_type or case.recommended_action or "PAYMENT_RETRY"

    # Evaluate Policy Rules
    # If case amount > 500,000, verify explicit human authorization
    if case.amount_at_risk > HIGH_VALUE_THRESHOLD:
        approved_action = db.query(RecoveryAction).filter(
            RecoveryAction.leakage_case_id == case.id,
            RecoveryAction.status == "APPROVED"
        ).first()

        if case.action_status != "APPROVED" and not approved_action:
            raise HTTPException(
                status_code=400,
                detail=f"Policy Blocked: Case amount (₹{case.amount_at_risk:,.2f}) exceeds policy automation threshold (₹{HIGH_VALUE_THRESHOLD:,.2f}). Human finance authorization required."
            )

    now = datetime.datetime.utcnow()

    # Find existing approved action or create new executed action
    existing_action = db.query(RecoveryAction).filter(
        RecoveryAction.leakage_case_id == case.id,
        RecoveryAction.status.in_(["APPROVED", "PENDING_APPROVAL"])
    ).order_by(RecoveryAction.id.desc()).first()

    if existing_action:
        existing_action.status = "EXECUTED"
        existing_action.executed_by = current_user.id
        existing_action.executed_at = now
        existing_action.result = "AWAITING_PAYMENT"
        action = existing_action
    else:
        action = RecoveryAction(
            organization_id=org.id,
            leakage_case_id=case.id,
            action_type=action_to_take,
            reason=req.reason or f"Recovery action '{action_to_take}' executed by {current_user.name}.",
            status="EXECUTED",
            executed_by=current_user.id,
            executed_at=now,
            result="AWAITING_PAYMENT",
            amount_recovered=0.0
        )
        db.add(action)

    case.action_status = "RECOVERING"
    case.policy_status = "APPROVED"

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="RECOVERY_ACTION_STARTED",
        entity_type="LeakageCase",
        entity_id=str(case.id),
        description=f"Initiated bounded recovery action '{action_to_take}' for ₹{case.amount_at_risk:,.2f}. Policy verified.",
        timestamp=now,
        metadata_json=json.dumps({"action": action_to_take, "case_id": case.id, "amount": case.amount_at_risk})
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return format_case(case, db)

@router.post("/{case_id}/simulate-payment", response_model=LeakageCaseItem)
def simulate_payment_settlement(
    case_id: int,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Simulates settlement confirmation: sets status to RECOVERED,
    shifts amount_at_risk to revenue_recovered, and logs audit trail.
    """
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
    if case.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    settled_amount = case.amount_at_risk
    case.revenue_recovered += settled_amount
    case.amount_at_risk = 0.0
    case.action_status = "RECOVERED"
    case.policy_status = "APPROVED"

    cust = db.query(Customer).filter(Customer.id == case.customer_id).first() if case.customer_id else None
    cust_name = cust.name if cust else "Direct Checkout"

    # Record successful recovery action
    action = RecoveryAction(
        organization_id=org.id,
        leakage_case_id=case.id,
        action_type="PAYMENT_RECEIVED",
        reason="Settlement confirmed via simulated banking gateway callback.",
        status="EXECUTED",
        executed_by=current_user.id,
        executed_at=datetime.datetime.utcnow(),
        result="SUCCESS",
        amount_recovered=settled_amount
    )
    db.add(action)

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="PAYMENT_RECOVERED",
        entity_type="LeakageCase",
        entity_id=str(case.id),
        description=f"Confirmed receipt of ₹{settled_amount:,.2f} from {cust_name}. Case marked as RECOVERED.",
        timestamp=datetime.datetime.utcnow(),
        metadata_json=json.dumps({"amount_recovered": settled_amount, "customer": cust_name})
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return format_case(case, db)

@router.post("/{case_id}/escalate", response_model=LeakageCaseItem)
def escalate_case(
    case_id: int,
    req: LeakageActionRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
    if case.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    case.action_status = "ESCALATED"
    case.policy_status = "REQUIRES_HUMAN_REVIEW"

    action = RecoveryAction(
        organization_id=org.id,
        leakage_case_id=case.id,
        action_type="HUMAN_ESCALATION",
        reason=req.reviewer_notes or "Manually routed to human finance review.",
        status="EXECUTED",
        executed_by=current_user.id,
        executed_at=datetime.datetime.utcnow(),
        result="ESCALATED",
        amount_recovered=0.0
    )
    db.add(action)

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="HUMAN_ESCALATION",
        entity_type="LeakageCase",
        entity_id=str(case.id),
        description=f"Case #{case.id} (₹{case.amount_at_risk:,.2f}) escalated to Finance Manager. Notes: {req.reviewer_notes or 'None'}",
        timestamp=datetime.datetime.utcnow(),
        metadata_json=json.dumps({"notes": req.reviewer_notes, "amount": case.amount_at_risk})
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return format_case(case, db)

@router.post("/{case_id}/stop", response_model=LeakageCaseItem)
def stop_case(
    case_id: int,
    req: LeakageActionRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    case = db.query(LeakageCase).filter(LeakageCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Leakage case not found")
    if case.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    case.action_status = "STOPPED"
    case.policy_status = "BLOCKED"

    action = RecoveryAction(
        organization_id=org.id,
        leakage_case_id=case.id,
        action_type="STOP_WORKFLOW",
        reason=req.reason or "Workflow stopped by user command.",
        status="EXECUTED",
        executed_by=current_user.id,
        executed_at=datetime.datetime.utcnow(),
        result="STOPPED",
        amount_recovered=0.0
    )
    db.add(action)

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="WORKFLOW_STOPPED",
        entity_type="LeakageCase",
        entity_id=str(case.id),
        description=f"Automated recovery halted for Case #{case.id}. Reason: {req.reason or 'User requested stop.'}",
        timestamp=datetime.datetime.utcnow(),
        metadata_json=json.dumps({"reason": req.reason})
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return format_case(case, db)
