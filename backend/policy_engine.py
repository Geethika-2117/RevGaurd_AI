from typing import Dict, Any
from .models import LeakageCase

HIGH_VALUE_THRESHOLD = 500000.0  # ₹5,00,000
MAX_PAYMENT_RETRIES = 2
MAX_PAYMENT_REMINDERS = 2
MAX_AUTOMATED_CONTACTS = 3

BOUNDED_ACTIONS = {
    "PAYMENT_RETRY": "Initiate automated payment retry on primary rail",
    "SEND_PAYMENT_REMINDER": "Send polite automated reminder via WhatsApp / Email",
    "SEND_PAYMENT_LINK": "Generate and dispatch dynamic short-link payment portal",
    "REQUEST_PAYMENT_METHOD_UPDATE": "Request updated card or billing mandate from customer",
    "ALTERNATE_PAYMENT_METHOD": "Reroute payment via secondary failover gateway",
    "CREATE_PROMISE_TO_PAY": "Record formal payment commitment and schedule follow-up",
    "ESCALATE_TO_FINANCE": "Route case to human finance manager for executive handling",
    "STOP_WORKFLOW": "Halt all automated outreach and close case monitoring"
}

def evaluate_recovery_policy(
    case: LeakageCase,
    action_type: str,
    action_history_count: int = 0
) -> Dict[str, Any]:
    """
    Evaluates proposed recovery action against deterministic safety policy.
    Returns: { "allowed": bool, "policy_status": str, "reason": str }
    """
    # 1. Terminal state checks
    if case.action_status == "RECOVERED":
        return {
            "allowed": False,
            "policy_status": "BLOCKED",
            "reason": "Payment is already recovered. No further actions permitted."
        }
    if case.action_status == "STOPPED":
        return {
            "allowed": False,
            "policy_status": "BLOCKED",
            "reason": "Workflow was previously stopped for this case."
        }

    # 2. Bounded Action check
    if action_type not in BOUNDED_ACTIONS:
        return {
            "allowed": False,
            "policy_status": "BLOCKED",
            "reason": f"Action '{action_type}' is not an authorized bounded recovery action."
        }

    # 3. High-Value Threshold Check (> ₹5,00,000)
    if case.amount_at_risk > HIGH_VALUE_THRESHOLD and action_type != "ESCALATE_TO_FINANCE":
        return {
            "allowed": False,
            "policy_status": "REQUIRES_HUMAN_REVIEW",
            "reason": f"Case amount (₹{case.amount_at_risk:,.2f}) exceeds policy automation threshold (₹{HIGH_VALUE_THRESHOLD:,.2f}). Human finance authorization required."
        }

    # 4. Frequency Limit Checks
    if action_type == "PAYMENT_RETRY" and action_history_count >= MAX_PAYMENT_RETRIES:
        return {
            "allowed": False,
            "policy_status": "REQUIRES_HUMAN_REVIEW",
            "reason": f"Maximum retry limit ({MAX_PAYMENT_RETRIES}) reached. Escalating to human finance review."
        }

    if action_type == "SEND_PAYMENT_REMINDER" and action_history_count >= MAX_PAYMENT_REMINDERS:
        return {
            "allowed": False,
            "policy_status": "REQUIRES_HUMAN_REVIEW",
            "reason": f"Maximum reminder limit ({MAX_PAYMENT_REMINDERS}) reached. Escalating to prevent customer fatigue."
        }

    if action_history_count >= MAX_AUTOMATED_CONTACTS and action_type not in ["ESCALATE_TO_FINANCE", "STOP_WORKFLOW"]:
        return {
            "allowed": False,
            "policy_status": "REQUIRES_HUMAN_REVIEW",
            "reason": f"Maximum automated contact threshold ({MAX_AUTOMATED_CONTACTS}) reached. Mandating human intervention."
        }

    return {
        "allowed": True,
        "policy_status": "APPROVED",
        "reason": f"Policy approved: {BOUNDED_ACTIONS[action_type]} meets all governance constraints."
    }

def build_policy_check_response(
    case: LeakageCase,
    action_type: str = None,
    action_history_count: int = 0
) -> Dict[str, Any]:
    """
    Evaluates policy constraints and constructs user-facing safety check state.
    """
    action_to_eval = action_type or case.recommended_action or "PAYMENT_RETRY"
    amount = case.amount_at_risk
    thresh = HIGH_VALUE_THRESHOLD

    # Terminal state checks
    if case.action_status == "RECOVERED":
        return {
            "case_id": case.id,
            "amount_at_risk": amount,
            "automatic_recovery_threshold": thresh,
            "is_automatic_allowed": False,
            "requires_human_approval": False,
            "recommended_action": action_to_eval,
            "policy_status": "BLOCKED",
            "status_headline": "CASE ALREADY SETTLED",
            "explanation": "This transaction has already been recovered and settled in the authoritative ledger.",
            "safety_checks": [
                {"label": "Case status verified", "status": "PASS", "icon": "check"},
                {"label": "Revenue already recovered", "status": "WARN", "icon": "info"}
            ]
        }

    if case.action_status == "STOPPED":
        return {
            "case_id": case.id,
            "amount_at_risk": amount,
            "automatic_recovery_threshold": thresh,
            "is_automatic_allowed": False,
            "requires_human_approval": False,
            "recommended_action": action_to_eval,
            "policy_status": "BLOCKED",
            "status_headline": "RECOVERY WORKFLOW STOPPED",
            "explanation": "Automated and manual recovery actions have been halted by operator command.",
            "safety_checks": [
                {"label": "Workflow status: STOPPED", "status": "FAIL", "icon": "block"},
                {"label": "No further automated recovery permitted", "status": "FAIL", "icon": "block"}
            ]
        }

    # High-Value Threshold Check: > 500,000
    if amount > thresh:
        return {
            "case_id": case.id,
            "amount_at_risk": amount,
            "automatic_recovery_threshold": thresh,
            "is_automatic_allowed": False,
            "requires_human_approval": True,
            "recommended_action": action_to_eval,
            "policy_status": "REQUIRES_HUMAN_REVIEW",
            "status_headline": "HUMAN APPROVAL REQUIRED",
            "explanation": f"This recovery action requires finance authorization because the amount at risk (₹{amount:,.0f}) exceeds the automatic recovery limit of ₹{thresh:,.0f}.",
            "safety_checks": [
                {"label": "Leakage case verified", "status": "PASS", "icon": "check"},
                {"label": "AI recommendation available", "status": "PASS", "icon": "check"},
                {"label": f"Amount exceeds automatic recovery limit of ₹{thresh:,.0f}", "status": "WARN", "icon": "warning"},
                {"label": "Finance approval required", "status": "WARN", "icon": "arrow_forward"}
            ]
        }
    else:
        return {
            "case_id": case.id,
            "amount_at_risk": amount,
            "automatic_recovery_threshold": thresh,
            "is_automatic_allowed": True,
            "requires_human_approval": False,
            "recommended_action": action_to_eval,
            "policy_status": "APPROVED",
            "status_headline": "AUTOMATIC RECOVERY ALLOWED",
            "explanation": f"The case amount (₹{amount:,.0f}) is within the automatic recovery ceiling (₹{thresh:,.0f}). Recovery action meets all safety policies.",
            "safety_checks": [
                {"label": "Within automatic recovery limit", "status": "PASS", "icon": "check"},
                {"label": "AI recommendation approved", "status": "PASS", "icon": "check"},
                {"label": "Recovery action allowed", "status": "PASS", "icon": "check"}
            ]
        }

