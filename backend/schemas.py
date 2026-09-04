from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    company_name: str
    company_email: Optional[str] = None
    business_email: Optional[str] = None
    merchant_id: Optional[str] = None
    admin_name: Optional[str] = None
    name: Optional[str] = None
    admin_email: Optional[str] = None
    email: Optional[str] = None
    password: str
    confirm_password: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str
    role: str
    organization_id: int
    organization_name: str
    merchant_id: str
    org_code: str

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    organization_id: int
    organization_name: str
    merchant_id: str
    org_code: str

class DemoAccountInfo(BaseModel):
    name: str
    email: str
    password: str
    role: str
    organization_name: str
    description: str

class OrgUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str = "Active"
    created_at: datetime

    class Config:
        from_attributes = True

class CompanySettingsResponse(BaseModel):
    name: str
    merchant_id: str
    org_code: str
    admin_email: str
    created_at: datetime

# --- Customer & Payment Schemas ---
class CustomerSchema(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    lifetime_value: float

    class Config:
        from_attributes = True

class PaymentSchema(BaseModel):
    id: int
    customer_id: Optional[int] = None
    transaction_id: str
    amount: float
    currency: str
    payment_status: str
    payment_method: Optional[str] = None
    failure_reason: Optional[str] = None
    recipient_name: str
    recipient_identifier: str
    transaction_timestamp: datetime

    class Config:
        from_attributes = True

# --- Verification Schemas ---
class VerificationCheckItem(BaseModel):
    name: str
    passed: bool
    details: str

class ExtractedDocumentData(BaseModel):
    transaction_id: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = "INR"
    payment_status: Optional[str] = None
    date: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_identifier: Optional[str] = None
    merchant_id: Optional[str] = None
    payment_method: Optional[str] = None
    file_hash: str
    raw_text_preview: Optional[str] = None

class VerificationResponse(BaseModel):
    document_id: int
    file_name: str
    file_hash: str
    document_status: str
    verification_result: str  # VERIFIED, NEEDS_REVIEW, VERIFICATION_FAILED, UNVERIFIED
    verification_score: int
    verification_reason: str
    checks: List[VerificationCheckItem]
    extracted_data: ExtractedDocumentData
    authoritative_record: Optional[Dict[str, Any]] = None
    leakage_case_id: Optional[int] = None
    verified_at: datetime

# --- Leakage Schemas ---
class LeakageCaseItem(BaseModel):
    id: int
    customer_name: str
    customer_email: Optional[str] = None
    transaction_id: Optional[str] = None
    leakage_type: str
    amount_at_risk: float
    risk_score: int
    recovery_probability: float
    expected_recovery: float
    root_cause: str
    root_cause_confidence: float
    recommended_action: str
    policy_status: str
    action_status: str
    revenue_recovered: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LeakageCategorySummary(BaseModel):
    key: str
    title: str
    amount_at_risk: float
    case_count: int
    average_recovery_probability: float
    expected_recovery: float
    trend: str

class LeakageActionRequest(BaseModel):
    action_type: Optional[str] = None
    reason: Optional[str] = None
    reviewer_notes: Optional[str] = None

# --- Recovery Schemas ---
class RecoveryHistoryItem(BaseModel):
    id: int
    customer_name: str
    amount: float
    action_type: str
    date: str
    status: str

class BatchRecoveryResult(BaseModel):
    events_analyzed: int
    leakage_cases_processed: int
    recovery_opportunities_found: int
    automated_actions_executed: int
    human_escalations_routed: int
    amount_at_risk_before: float
    amount_recovered: float
    updated_revenue_recovered: float
    updated_money_at_risk: float
    updated_recovery_rate: float

# --- Policy Check & Approval Schemas ---
class SafetyCheckItem(BaseModel):
    label: str
    status: str  # "PASS", "WARN", "FAIL"
    icon: Optional[str] = None
    detail: Optional[str] = None

class PolicyCheckResponse(BaseModel):
    case_id: int
    amount_at_risk: float
    automatic_recovery_threshold: float = 500000.0
    is_automatic_allowed: bool
    requires_human_approval: bool
    recommended_action: str
    policy_status: str  # "APPROVED", "REQUIRES_HUMAN_REVIEW", "BLOCKED"
    status_headline: str  # "AUTOMATIC RECOVERY ALLOWED" or "HUMAN APPROVAL REQUIRED"
    explanation: str
    safety_checks: List[SafetyCheckItem]

class ApprovalActionRequest(BaseModel):
    notes: Optional[str] = None

class ApprovalRequestResponse(BaseModel):
    action_id: int
    case_id: int
    action_type: str
    status: str  # "PENDING_APPROVAL"
    amount_at_risk: float
    reason: str
    requested_by: str
    requested_at: datetime
    message: str

class PendingApprovalItem(BaseModel):
    action_id: int
    case_id: int
    customer_name: str
    customer_email: Optional[str] = None
    leakage_type: str
    amount_at_risk: float
    recovery_probability: float
    recommended_action: str
    reason: str
    requested_by_name: str
    requested_by_email: str
    requested_by_id: int
    requested_at: datetime
    status: str

# --- Dashboard Schemas ---
class AIInsight(BaseModel):
    id: str
    title: str
    description: str
    type: str  # info, alert, success

class DashboardSummary(BaseModel):
    organization_name: str
    merchant_id: str
    money_at_risk: float
    revenue_recovered: float
    recovery_rate: float
    still_at_risk: float
    active_cases_count: int
    total_events_checked: int = 0
    categories: List[LeakageCategorySummary]
    ai_insights: List[AIInsight]

# --- Data Source Schemas ---
class DataSourceItem(BaseModel):
    id: str
    name: str
    type: str
    status: str
    last_synced: str
    events_count: int
    description: str

class DataSourcesResponse(BaseModel):
    organization: str
    total_events_analyzed: int
    has_connected_sources: bool
    sources: List[DataSourceItem]

class DataSourceUploadResponse(BaseModel):
    status: str
    source_type: str
    imported_count: int
    leakage_cases_created: int
    message: str

# --- Audit & Activity Schemas ---
class AuditLogItem(BaseModel):
    id: int
    user_name: Optional[str] = None
    event_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    description: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ActivityItem(BaseModel):
    id: int
    time: str
    text: str
    status: str
    amount: Optional[str] = None
