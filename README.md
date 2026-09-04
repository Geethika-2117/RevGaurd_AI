# 🛡️ RevGaurd AI — Revenue Leakage Detection & Recovery Agent

## Overview

**RevGaurd AI** is an AI-powered revenue leakage detection and recovery platform designed to help businesses identify revenue at risk, verify payment information, analyze the cause of leakage, and take safe recovery actions.

The platform combines **Artificial Intelligence, payment verification, policy-based decision making, human approval, and auditability** into a single revenue recovery workflow.

> **Find revenue that's slipping away. Understand why. Recover it safely.**

---

## Problem Statement

Businesses lose significant revenue through issues such as:

- Failed payments
- Abandoned checkouts
- Failed subscriptions
- Overdue invoices
- Duplicate transactions
- Payment status mismatches
- Amount mismatches
- Wrong payment recipients

Traditional systems often identify these problems but do not determine **what action should be taken next**.

RevGaurd AI addresses this gap by moving from:

**Detection → Decision → Recovery**

---

## Solution

RevGaurd AI analyzes revenue and payment data to:

- Detect potential revenue leakage
- Verify uploaded payment documents
- Compare payment evidence with authoritative transaction records
- Identify probable root causes
- Estimate recovery probability
- Recommend recovery actions
- Apply financial safety policies
- Request human approval when required
- Execute bounded recovery workflows
- Track recovered revenue
- Maintain a complete audit trail

---

## Key Features

### Revenue Leakage Detection

Identifies different types of revenue leakage, including:

- Failed Payments
- Abandoned Checkouts
- Failed Subscriptions
- Overdue Invoices
- Payment Verification Issues

### Payment Verification

Uploaded payment documents are verified against authoritative transaction records using:

- Transaction ID matching
- Amount matching
- Payment status matching
- Recipient verification
- Merchant verification
- Timestamp validation
- Duplicate transaction detection

Possible verification results include:

- **Payment Verified**
- **Needs Review**
- **Verification Failed**
- **Wrong Recipient**
- **Amount Mismatch**
- **Status Mismatch**
- **Duplicate Transaction**
- **Unverified**

> **The uploaded document is evidence. The authoritative transaction record is the source of truth.**

---

## AI-Powered Analysis

For eligible revenue leakage cases, RevGaurd AI analyzes:

- Root Cause
- Root Cause Confidence
- Recovery Probability
- Recommended Recovery Action
- Expected Recovery

### Expected Recovery

RevGaurd AI prioritizes recovery opportunities based on expected recoverable value.

**Expected Recovery = Amount at Risk × Recovery Probability**

For example:

**Amount at Risk:** ₹100,000  
**Recovery Probability:** 75%  
**Expected Recovery:** ₹75,000

This helps prioritize opportunities based on both financial value and likelihood of recovery.

---

## Bounded Recovery

RevGaurd AI does not allow AI recommendations to directly control unrestricted financial actions.

A deterministic policy engine evaluates recovery actions before execution.

### Example Policy

- Recovery amount **≤ ₹5,00,000** → Automatic recovery allowed
- Recovery amount **> ₹5,00,000** → Human approval required

High-value cases can be reviewed by authorized:

- Finance Managers
- Administrators

Recovery workflows can also stop when:

- Revenue has already been recovered
- Maximum retry attempts are reached
- Maximum contact attempts are reached
- Customer opts out
- Policy limits are exceeded
- Verification confidence is insufficient
- Required approval is not granted

> **The AI provides intelligence. The policy engine provides control.**

---

## Agentic Workflow

RevGaur AI follows an agentic approach:

1. **Observe** — Analyze revenue and payment data
2. **Detect** — Identify potential leakage
3. **Verify** — Validate payment evidence
4. **Reason** — Determine probable root cause
5. **Decide** — Recommend a recovery strategy
6. **Act** — Execute a bounded recovery action
7. **Verify Outcome** — Confirm the recovery result
8. **Stop** — Apply stopping rules
9. **Audit** — Record important decisions and actions

This makes RevGaur AI more than a dashboard or prediction model — it is a **closed-loop revenue recovery agent**.

---

## Multi-Tenant Architecture

RevGaur AI is designed for multiple companies while maintaining organization-level data isolation.

Each organization has its own:

- Customers
- Payments
- Revenue leakage cases
- Recovery actions
- Payment documents
- Audit records

Organization context is derived from the authenticated user rather than being trusted from client-provided organization identifiers.

---

## Role-Based Access

RevGaur AI supports role-based access control.

| Role | Responsibility |
|---|---|
| **ADMIN** | Organization management and full platform control |
| **ANALYST** | Investigate leakage and analyze recovery opportunities |
| **FINANCE_MANAGER** | Review high-value cases and approve recovery |

---

## Audit Trail

Important platform activities are recorded for traceability.

Examples include:

- User Login
- Document Uploaded
- Document Verified
- Payment Verification Failed
- Leakage Detected
- AI Analysis Completed
- Recovery Recommended
- Policy Check Completed
- Approval Requested
- Recovery Approved
- Recovery Executed
- Revenue Recovered
- Workflow Stopped

This provides visibility into **what happened, why it happened, and what action was taken**.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript / JSX

### Backend

- Python
- FastAPI
- SQLAlchemy
- JWT Authentication

### Database

- PostgreSQL
- SQLite fallback for local development

### AI

- AI-powered root-cause analysis
- Recovery recommendations
- Recovery probability estimation
- Deterministic fallback logic

### Document Processing

- PDF Processing
- Image Processing
- OCR
- Structured Field Extraction

### Security & Governance

- Password Hashing
- JWT Authentication
- Role-Based Access Control
- Multi-Tenant Isolation
- Policy Enforcement
- Audit Logging

---

## Project Structure

```text
RevGaurd_AI/
│
├── backend/
│   ├── ai_engine.py
│   ├── auth.py
│   ├── database.py
│   ├── document_processor.py
│   ├── main.py
│   ├── models.py
│   ├── policy_engine.py
│   ├── schemas.py
│   ├── verifier.py
│   │
│   └── routes/
│       ├── activity.py
│       ├── audit.py
│       ├── auth.py
│       ├── dashboard.py
│       ├── data_sources.py
│       ├── documents.py
│       ├── leakage.py
│       ├── recovery.py
│       ├── security.py
│       └── settings.py
│
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   └── pages/
│
├── ACME_PAYMENT_VERIFICATION_DEMO_002.pdf
├── package.json
├── package-lock.json
├── tailwind.config.js
├── vite.config.js
├── .gitignore
└── README.md
