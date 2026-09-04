import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Organization, LeakageCase, Customer, RecoveryAction, AuditLog
from ..schemas import RecoveryHistoryItem, BatchRecoveryResult, PendingApprovalItem, ApprovalActionRequest
from ..auth import get_current_user, get_current_org
from ..policy_engine import evaluate_recovery_policy

router = APIRouter(prefix="/api/recovery", tags=["Recovery Operations"])

@router.get("/approvals", response_model=List[PendingApprovalItem])
def get_pending_approvals(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Returns pending human approval requests strictly isolated to the authenticated organization.
    """
    pending_actions = db.query(RecoveryAction).filter(
        RecoveryAction.organization_id == org.id,
        RecoveryAction.status == "PENDING_APPROVAL"
    ).order_by(RecoveryAction.requested_at.desc()).all()

    results = []
    for act in pending_actions:
        case = db.query(LeakageCase).filter(LeakageCase.id == act.leakage_case_id).first()
        if not case:
            continue
        cust = db.query(Customer).filter(Customer.id == case.customer_id).first() if case.customer_id else None
        requester = db.query(User).filter(User.id == act.requested_by).first() if act.requested_by else None

        results.append(PendingApprovalItem(
            action_id=act.id,
            case_id=case.id,
            customer_name=cust.name if cust else "Direct Checkout",
            customer_email=cust.email if cust else None,
            leakage_type=case.leakage_type,
            amount_at_risk=case.amount_at_risk,
            recovery_probability=case.recovery_probability,
            recommended_action=act.action_type or case.recommended_action or "SEND_PAYMENT_LINK",
            reason=act.reason or "Exceeds ₹500,000 automatic recovery ceiling",
            requested_by_name=requester.name if requester else "System Operator",
            requested_by_email=requester.email if requester else "operator@company.com",
            requested_by_id=requester.id if requester else 0,
            requested_at=act.requested_at or datetime.datetime.utcnow(),
            status=act.status
        ))
    return results

@router.post("/approvals/{action_id}/approve")
def approve_recovery_action(
    action_id: int,
    req: Optional[ApprovalActionRequest] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Authorizes a high-value recovery request.
    Restricted to ADMIN and FINANCE_MANAGER roles.
    """
    # Strict Role Authorization: Only ADMIN or FINANCE_MANAGER
    if current_user.role not in ["ADMIN", "FINANCE_MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Finance Managers and Administrators are authorized to approve high-value recovery actions. Analysts cannot authorize recovery requests."
        )

    action = db.query(RecoveryAction).filter(RecoveryAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Recovery action request not found.")
    if action.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied. Cross-tenant action blocked.")

    case = db.query(LeakageCase).filter(LeakageCase.id == action.leakage_case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Associated leakage case not found.")

    now = datetime.datetime.utcnow()
    action.status = "APPROVED"
    action.approved_by = current_user.id
    action.approved_at = now

    case.action_status = "APPROVED"
    case.policy_status = "APPROVED"

    cust = db.query(Customer).filter(Customer.id == case.customer_id).first() if case.customer_id else None
    cust_name = cust.name if cust else "Direct Checkout"

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="RECOVERY_APPROVED",
        entity_type="RecoveryAction",
        entity_id=str(action.id),
        description=f"High-value recovery action '{action.action_type}' for Case #{case.id} ({cust_name}, ₹{case.amount_at_risk:,.2f}) approved by {current_user.name} ({current_user.role}). Notes: {req.notes if req else 'None'}",
        timestamp=now,
        metadata_json=json.dumps({
            "case_id": case.id,
            "action_id": action.id,
            "amount": case.amount_at_risk,
            "approved_by": current_user.id,
            "approver_role": current_user.role
        })
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": f"Recovery action for Case #{case.id} approved. Case is ready for execution.",
        "case_id": case.id,
        "action_id": action.id,
        "action_status": case.action_status
    }

@router.post("/approvals/{action_id}/reject")
def reject_recovery_action(
    action_id: int,
    req: Optional[ApprovalActionRequest] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Rejects a high-value recovery request.
    Restricted to ADMIN and FINANCE_MANAGER roles.
    """
    if current_user.role not in ["ADMIN", "FINANCE_MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Finance Managers and Administrators are authorized to reject recovery actions."
        )

    action = db.query(RecoveryAction).filter(RecoveryAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Recovery action request not found.")
    if action.organization_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied. Cross-tenant action blocked.")

    case = db.query(LeakageCase).filter(LeakageCase.id == action.leakage_case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Associated leakage case not found.")

    now = datetime.datetime.utcnow()
    action.status = "REJECTED"
    case.action_status = "REJECTED"
    case.policy_status = "BLOCKED"

    cust = db.query(Customer).filter(Customer.id == case.customer_id).first() if case.customer_id else None
    cust_name = cust.name if cust else "Direct Checkout"

    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="RECOVERY_REJECTED",
        entity_type="RecoveryAction",
        entity_id=str(action.id),
        description=f"High-value recovery action for Case #{case.id} ({cust_name}, ₹{case.amount_at_risk:,.2f}) rejected by {current_user.name} ({current_user.role}). Notes: {req.notes if req else 'None'}",
        timestamp=now,
        metadata_json=json.dumps({
            "case_id": case.id,
            "action_id": action.id,
            "amount": case.amount_at_risk,
            "rejected_by": current_user.id,
            "rejecter_role": current_user.role
        })
    )
    db.add(audit)
    db.commit()

    return {
        "status": "REJECTED",
        "message": f"Recovery action for Case #{case.id} rejected.",
        "case_id": case.id,
        "action_id": action.id,
        "action_status": case.action_status
    }

@router.get("", response_model=List[RecoveryHistoryItem])
def get_recent_recoveries(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    # Retrieve cases with revenue_recovered > 0
    recovered_cases = db.query(LeakageCase).filter(
        LeakageCase.organization_id == org.id,
        LeakageCase.revenue_recovered > 0
    ).order_by(LeakageCase.updated_at.desc()).all()

    items = []
    for c in recovered_cases:
        cust = db.query(Customer).filter(Customer.id == c.customer_id).first() if c.customer_id else None
        items.append(RecoveryHistoryItem(
            id=c.id,
            customer_name=cust.name if cust else "Direct Commercial Settlement",
            amount=c.revenue_recovered,
            action_type=c.recommended_action or "SMART_RETRY",
            date=c.updated_at.strftime("%Y-%m-%d %H:%M") if c.updated_at else "Recently",
            status="RECOVERED"
        ))
    return items

@router.post("/batch", response_model=BatchRecoveryResult)
def run_batch_recovery_simulation(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Executes automated 5-stage batch recovery simulation:
    1. Scan open leakage cases
    2. Validate policy constraints
    3. Route >₹5L cases to Human Escalation
    4. Settle eligible cases with high recovery probability
    5. Update platform totals & log audit trail
    """
    # 1. Fetch active cases
    active_cases = db.query(LeakageCase).filter(
        LeakageCase.organization_id == org.id,
        LeakageCase.action_status.notin_(["RECOVERED", "STOPPED"])
    ).all()

    risk_before = sum(c.amount_at_risk for c in active_cases)
    prior_recovered = sum(c.revenue_recovered for c in db.query(LeakageCase).filter(LeakageCase.organization_id == org.id).all())

    auto_actions_count = 0
    escalations_count = 0
    total_batch_recovered = 0.0

    for case in active_cases:
        # Check Policy: if amount > 500,000, escalate to human
        if case.amount_at_risk > 500000.0:
            case.action_status = "ESCALATED"
            case.policy_status = "REQUIRES_HUMAN_REVIEW"
            escalations_count += 1
            db.add(RecoveryAction(
                organization_id=org.id,
                leakage_case_id=case.id,
                action_type="HUMAN_ESCALATION",
                reason="Policy threshold > ₹5,00,000 exceeded. Routed to executive finance review.",
                status="EXECUTED",
                executed_by=current_user.id,
                executed_at=datetime.datetime.utcnow(),
                result="ESCALATED"
            ))
        else:
            # Eligible for automated recovery action if probability >= 0.70
            if case.recovery_probability >= 0.70 and case.amount_at_risk > 0:
                recovered_amt = case.amount_at_risk
                case.revenue_recovered += recovered_amt
                case.amount_at_risk = 0.0
                case.action_status = "RECOVERED"
                total_batch_recovered += recovered_amt
                auto_actions_count += 1

                db.add(RecoveryAction(
                    organization_id=org.id,
                    leakage_case_id=case.id,
                    action_type=case.recommended_action or "PAYMENT_RETRY",
                    reason="Batch AI recovery pipeline executed and simulated successful gateway settlement.",
                    status="EXECUTED",
                    executed_by=current_user.id,
                    executed_at=datetime.datetime.utcnow(),
                    result="SUCCESS",
                    amount_recovered=recovered_amt
                ))
            else:
                case.action_status = "RECOVERING"
                auto_actions_count += 1

    # Create batch audit log
    audit = AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="BATCH_RECOVERY_COMPLETED",
        entity_type="BatchExecution",
        entity_id="BATCH-" + datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        description=f"Batch AI Recovery run completed: {auto_actions_count} automated actions, {escalations_count} human escalations, ₹{total_batch_recovered:,.2f} recovered.",
        timestamp=datetime.datetime.utcnow(),
        metadata_json=json.dumps({
            "recovered": total_batch_recovered,
            "auto_actions": auto_actions_count,
            "escalations": escalations_count
        })
    )
    db.add(audit)

    db.commit()

    # Recalculate totals
    updated_cases = db.query(LeakageCase).filter(
        LeakageCase.organization_id == org.id,
        LeakageCase.action_status.notin_(["RECOVERED", "STOPPED"])
    ).all()
    updated_risk = sum(c.amount_at_risk for c in updated_cases)
    updated_recovered = prior_recovered + total_batch_recovered
    denom = updated_risk + updated_recovered
    updated_rate = round((updated_recovered / denom * 100.0), 1) if denom > 0 else 0.0

    return BatchRecoveryResult(
        events_analyzed=len(active_cases) * 5 if len(active_cases) > 0 else 0,
        leakage_cases_processed=len(active_cases),
        recovery_opportunities_found=auto_actions_count + escalations_count,
        automated_actions_executed=auto_actions_count,
        human_escalations_routed=escalations_count,
        amount_at_risk_before=risk_before,
        amount_recovered=total_batch_recovered,
        updated_revenue_recovered=updated_recovered,
        updated_money_at_risk=updated_risk,
        updated_recovery_rate=updated_rate
    )
