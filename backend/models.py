import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    merchant_id = Column(String(100), nullable=False, unique=True, index=True)
    org_code = Column(String(50), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="organization", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("PaymentDocument", back_populates="organization", cascade="all, delete-orphan")
    verifications = relationship("PaymentVerification", back_populates="organization", cascade="all, delete-orphan")
    leakage_cases = relationship("LeakageCase", back_populates="organization", cascade="all, delete-orphan")
    recovery_actions = relationship("RecoveryAction", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")
    data_sources = relationship("DataSource", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="ANALYST")  # ADMIN, ANALYST, FINANCE_MANAGER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="users")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    lifetime_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="customers")
    payments = relationship("Payment", back_populates="customer")
    leakage_cases = relationship("LeakageCase", back_populates="customer")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    transaction_id = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    payment_status = Column(String(50), nullable=False)  # SUCCESS, FAILED, PENDING, REFUNDED
    payment_method = Column(String(50), nullable=True)  # UPI, CREDIT_CARD, NET_BANKING, ACH
    failure_reason = Column(String(255), nullable=True)
    recipient_name = Column(String(255), nullable=False)
    recipient_identifier = Column(String(100), nullable=False)
    transaction_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")


class PaymentDocument(Base):
    __tablename__ = "payment_documents"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)  # RECEIPT, STATEMENT, INVOICE, SLIP
    upload_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    verification_status = Column(String(50), default="PENDING")  # VERIFIED, NEEDS_REVIEW, FAILED, UNVERIFIED
    verification_score = Column(Float, default=0.0)
    storage_path = Column(String(500), nullable=True)
    extracted_data_json = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="documents")
    verifications = relationship("PaymentVerification", back_populates="document", cascade="all, delete-orphan")


class PaymentVerification(Base):
    __tablename__ = "payment_verifications"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    payment_document_id = Column(Integer, ForeignKey("payment_documents.id"), nullable=False, index=True)
    transaction_id = Column(String(100), nullable=True)
    document_status = Column(String(50), nullable=True)
    transaction_found = Column(Boolean, default=False)
    amount_match = Column(Boolean, default=False)
    status_match = Column(Boolean, default=False)
    recipient_match = Column(Boolean, default=False)
    merchant_match = Column(Boolean, default=False)
    timestamp_plausible = Column(Boolean, default=True)
    duplicate_detected = Column(Boolean, default=False)
    verification_result = Column(String(50), nullable=False)  # VERIFIED, NEEDS_REVIEW, VERIFICATION_FAILED, UNVERIFIED
    verification_reason = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="verifications")
    document = relationship("PaymentDocument", back_populates="verifications")


class LeakageCase(Base):
    __tablename__ = "leakage_cases"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True, index=True)
    leakage_type = Column(String(50), nullable=False)  # FAILED_PAYMENT, OVERDUE_INVOICE, ABANDONED_CHECKOUT, FAILED_SUBSCRIPTION, VERIFICATION_ISSUE
    amount_at_risk = Column(Float, nullable=False)
    risk_score = Column(Integer, default=50)  # 0 - 100
    recovery_probability = Column(Float, default=0.5)  # 0.0 - 1.0
    expected_recovery = Column(Float, default=0.0)
    root_cause = Column(Text, nullable=True)
    root_cause_confidence = Column(Float, default=0.9)
    recommended_action = Column(String(100), nullable=True)
    policy_status = Column(String(50), default="APPROVED")  # APPROVED, REQUIRES_HUMAN_REVIEW, BLOCKED
    action_status = Column(String(50), default="FOUND")  # FOUND, ANALYZING, RECOVERING, RECOVERED, ESCALATED, STOPPED
    revenue_recovered = Column(Float, default=0.0)
    ai_engine = Column(String(50), default="RULE-BASED FALLBACK")
    is_fallback = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="leakage_cases")
    customer = relationship("Customer", back_populates="leakage_cases")
    payment = relationship("Payment")
    recovery_actions = relationship("RecoveryAction", back_populates="leakage_case", cascade="all, delete-orphan")


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    leakage_case_id = Column(Integer, ForeignKey("leakage_cases.id"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False)  # PAYMENT_RETRY, PAYMENT_REMINDER, PAYMENT_LINK, METHOD_UPDATE, ALTERNATE_GATEWAY, PROMISE_TO_PAY, HUMAN_ESCALATION, STOP_WORKFLOW
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="EXECUTED")  # PENDING_APPROVAL, APPROVED, EXECUTED, REJECTED, STOPPED, FAILED
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    requested_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    executed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    result = Column(String(100), nullable=True)  # SUCCESS, AWAITING_PAYMENT, ESCALATED, STOPPED
    amount_recovered = Column(Float, default=0.0)

    organization = relationship("Organization", back_populates="recovery_actions")
    leakage_case = relationship("LeakageCase", back_populates="recovery_actions")
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])
    executor = relationship("User", foreign_keys=[executed_by])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event_type = Column(String(100), nullable=False)  # DOCUMENT_UPLOAD, PAYMENT_VERIFIED, LEAKAGE_DETECTED, RECOVERY_EXECUTED, PAYMENT_RECOVERED, ESCALATION_APPROVED, etc.
    entity_type = Column(String(50), nullable=True)  # PaymentDocument, LeakageCase, RecoveryAction, Payment
    entity_id = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    metadata_json = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="audit_logs")


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # PAYMENT_GATEWAY, INVOICE_LEDGER, CHECKOUT_SESSIONS, RECURRING_BILLING
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="NOT_CONNECTED")  # NOT_CONNECTED, CONNECTED
    events_count = Column(Integer, default=0)
    last_refresh = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="data_sources")
