# 🛡️ RevGaurd AI

### AI-Powered Revenue Leakage Detection & Recovery Agent

> **Find revenue that's slipping away. Understand why. Recover it safely.**

RevGaurd AI is an intelligent revenue recovery platform that detects revenue leakage, verifies payment evidence against authoritative transaction records, analyzes the root cause using AI, determines the safest recovery strategy, and executes bounded recovery workflows with human approval and complete auditability.

Instead of simply showing finance teams *where money was lost*, RevGaurd AI closes the loop:

**Detect → Verify → Analyze → Decide → Act → Recover → Audit**

---

## 🚨 The Problem

Revenue leakage is rarely caused by a single obvious failure.

Businesses lose revenue through:

- Failed payments
- Abandoned checkouts
- Failed subscriptions
- Overdue invoices
- Payment verification issues
- Duplicate transactions
- Incorrect payment recipients
- Amount mismatches
- Payment status inconsistencies

Traditional dashboards can identify these events, but they often stop at:

> "Something went wrong."

The real question is:

> **"What should we do about it, and can we safely recover the money?"**

RevGaurd AI is designed to answer that question.

---

# 💡 The Solution

RevGaurd AI combines data verification, AI reasoning, deterministic financial calculations, policy enforcement, and bounded automation into one revenue recovery loop.

### Core Agent Loop

```text
                    ┌──────────────────┐
                    │   Revenue Data   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Detect Leakage   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Verify Evidence  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   AI Analysis    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Recovery Decision│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Safety / Policy  │
                    │      Check       │
                    └────────┬─────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
             AUTO RECOVERY      HUMAN APPROVAL
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Execute Recovery │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Revenue Recovered│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Audit Trail    │
                    └──────────────────┘

🤖 Why RevGaurd AI is an Agent

RevGaurd AI is not just a prediction model or analytics dashboard.

It follows a complete agentic workflow:

Agent Stage	RevGaurd AI
👁️ Observe	Monitors payment and revenue data
🔎 Detect	Identifies potential revenue leakage
✅ Verify	Cross-checks payment evidence against authoritative records
🧠 Reason	Determines probable root cause
🎯 Decide	Selects an appropriate recovery strategy
⚡ Act	Executes a bounded recovery action
📊 Verify Outcome	Confirms the recovery result
🛑 Stop	Terminates the workflow when stopping rules are reached
📋 Audit	Records important decisions and actions
Core Design Principle

The AI provides intelligence. The policy engine provides control.

AI recommends and reasons.

Deterministic backend logic controls:

Financial calculations
Authorization
Recovery limits
Policy thresholds
Approval requirements
Stopping rules
🔐 Payment Verification
A payment document alone cannot prove that a payment actually succeeded.

RevGaurd AI therefore verifies uploaded payment evidence against an authoritative transaction record.

Verification Pipeline
Payment Document
       │
       ▼
Secure Upload
       │
       ▼
File Integrity Check
       │
       ▼
OCR / Text Extraction
       │
       ▼
Structured Field Extraction
       │
       ▼
Authoritative Payment Ledger
       │
       ▼
┌───────────────────────────────┐
│ Transaction Exists?           │
│ Amount Matches?               │
│ Status Matches?               │
│ Recipient Matches?            │
│ Merchant Matches?             │
│ Timestamp Plausible?          │
│ Duplicate Transaction?        │
└───────────────┬───────────────┘
                │
                ▼
       Verification Decision
Verification Outcomes
✅ PAYMENT VERIFIED
⚠️ NEEDS REVIEW
❌ VERIFICATION FAILED
❌ WRONG RECIPIENT
❌ AMOUNT MISMATCH
❌ STATUS MISMATCH
❌ DUPLICATE TRANSACTION
⚠️ UNVERIFIED
Important Principle

The uploaded document is evidence. The authoritative transaction record is the source of truth.

The system distinguishes between document integrity and payment authenticity.

💰 Revenue Leakage Detection

RevGaurd AI identifies multiple categories of revenue leakage.

1. Failed Payments

A customer attempted a payment but the transaction failed.

Recovery strategies:

Payment retry
Payment method update
Alternate payment method
2. Abandoned Checkouts

A customer entered the purchasing flow but did not complete payment.

Recovery strategies:

Payment reminder
Payment link
Checkout recovery
3. Failed Subscriptions

Recurring payments fail and create churn risk.

Recovery strategies:

Retry payment
Request payment method update
Recovery reminder
4. Overdue Invoices

Invoices remain unpaid beyond their expected payment period.

Recovery strategies:

Payment reminder
Payment link
Promise-to-pay workflow
Finance escalation
5. Payment Verification Issues

Examples include:

Incorrect payment status
Wrong recipient
Amount mismatch
Duplicate transaction
Missing transaction
Unexpected merchant/account

These cases are verified before they can influence recovery decisions.

🧠 AI Analysis

RevGaurd AI analyzes eligible leakage cases using:

Root cause
Root-cause confidence
Recovery probability
Recommended recovery action
Expected recovery value
Supporting evidence
Expected Recovery

RevGaurd AI prioritizes opportunities based on expected recoverable value rather than simply sorting by the largest amount.

Expected Recovery
=
Amount at Risk × Recovery Probability

Example:

Amount at Risk        = ₹100,000
Recovery Probability  = 75%

Expected Recovery     = ₹75,000

This allows finance teams to prioritize cases that are both valuable and realistically recoverable.

🛡️ Bounded Recovery

AI recommendations do not automatically grant unlimited financial authority.

RevGaurd AI applies deterministic policy controls before executing recovery actions.

Example Recovery Policy
Recovery Amount ≤ ₹5,00,000
             │
             ▼
   Automatic Recovery Allowed
Recovery Amount > ₹5,00,000
             │
             ▼
     Human Approval Required
             │
             ▼
     Finance Manager / Admin
             │
       ┌─────┴─────┐
       ▼           ▼
    Approve       Reject
       │           │
       ▼           ▼
    Execute       Stop
Workflow Stops When:
Revenue has already been recovered
Maximum retry attempts are reached
Maximum contact attempts are reached
Customer opts out
Policy limits are exceeded
Verification confidence is insufficient
Human approval is required but not granted
A safety or policy violation is detected

This creates a controlled human-in-the-loop recovery system rather than unrestricted AI automation.

🏢 Multi-Tenant Architecture

RevGaurd AI is designed as a multi-tenant platform.

Each company operates inside an isolated organization context.

                    RevGaurd AI
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Company A      Company B      Company C
          │              │              │
       Customers      Customers      Customers
       Payments       Payments       Payments
       Leakage        Leakage        Leakage
       Recovery       Recovery       Recovery
       Audit          Audit          Audit

Every organization-owned record is associated with an organization_id.

The backend derives organization context from the authenticated user/session rather than trusting a client-provided organization ID.

This provides isolation between companies.

👥 Role-Based Access

RevGaurd AI supports role-based access control.

Role	Responsibility
ADMIN	Organization management and full platform control
ANALYST	Investigate leakage and analyze recovery opportunities
FINANCE_MANAGER	Review high-value cases and approve recovery

Sensitive or high-value recovery operations can therefore be routed to authorized human decision-makers.

📊 Platform Capabilities
Revenue Intelligence
Money at Risk
Revenue Recovered
Recovery Rate
Expected Recovery
Leakage Categories
Recovery Performance
AI Intelligence
Root-cause analysis
Recovery probability
Recommended action
Expected recovery calculation
AI activity history
Payment Intelligence
Payment document upload
OCR/text extraction
Transaction matching
Amount verification
Status verification
Recipient verification
Merchant verification
Duplicate detection
Recovery Operations
Automatic recovery
Human approval
Finance escalation
Recovery execution
Simulated payment confirmation
Recovery stopping rules
Governance
Policy engine
Role-based authorization
Audit trail
Organization isolation
Recovery action history
🏗️ System Architecture
┌──────────────────────────────────────────────┐
│                 React Frontend               │
│                                              │
│ Dashboard │ Leakage │ Verification │ AI     │
│ Recovery  │ Approvals │ Audit │ Settings     │
└───────────────────────┬──────────────────────┘
                        │
                     REST API
                        │
                        ▼
┌──────────────────────────────────────────────┐
│                 FastAPI Backend              │
├──────────────────────────────────────────────┤
│ Authentication & Authorization               │
│ Organization / Tenant Isolation              │
│ Document Processing                          │
│ Payment Verification                         │
│ Revenue Leakage Detection                    │
│ AI Analysis                                  │
│ Policy Engine                                │
│ Recovery Engine                              │
│ Audit Logging                                │
└───────────────┬──────────────────┬───────────┘
                │                  │
                ▼                  ▼
       ┌────────────────┐  ┌──────────────────┐
       │   PostgreSQL   │  │   AI / LLM Layer │
       │                │  │                  │
       │ Organizations  │  │ Root Cause       │
       │ Customers      │  │ Recovery Advice  │
       │ Payments       │  │ Recommendations  │
       │ Leakage Cases  │  └──────────────────┘
       │ Recovery       │
       │ Audit Logs     │
       └────────────────┘
🧰 Technology Stack
Frontend
React
Vite
Tailwind CSS
JavaScript / JSX
Backend
Python
FastAPI
SQLAlchemy
JWT Authentication
Database
PostgreSQL
SQLite fallback for local development
AI
AI-powered root-cause analysis
Recovery recommendations
Deterministic fallback logic
Document Processing
PDF processing
Image processing
OCR
Structured field extraction
Security & Governance
Password hashing
JWT authentication
Role-based access control
Multi-tenant isolation
Policy enforcement
Audit logging
🔄 End-to-End Example

Consider a payment document containing:

Transaction ID: ACME-TXN-20260904-002
Amount:         ₹52,000
Status:         SUCCESS
Recipient:      Acme Corporation

RevGaurd AI does not blindly trust the document.

It checks the authoritative payment ledger.

Document
   │
   ├── Transaction exists?       ✓
   ├── Amount matches?           ✓
   ├── Status matches?           ✓
   ├── Recipient matches?        ✓
   ├── Merchant matches?         ✓
   └── Duplicate?                ✗
          │
          ▼
     PAYMENT VERIFIED

For failed or inconsistent transactions, the platform can instead create a leakage case:

Payment Failure
      ↓
Leakage Detected
      ↓
AI Root-Cause Analysis
      ↓
Recovery Probability
      ↓
Recommended Action
      ↓
Policy Check
      ↓
Automatic Recovery
      OR
Human Approval
      ↓
Recovery Outcome
      ↓
Audit Trail
📋 Auditability

Every critical operation can be recorded.

Examples:

USER_LOGIN
DOCUMENT_UPLOADED
DOCUMENT_VERIFIED
PAYMENT_VERIFICATION_FAILED
LEAKAGE_DETECTED
AI_ANALYSIS_COMPLETED
RECOVERY_RECOMMENDED
POLICY_CHECK_COMPLETED
APPROVAL_REQUESTED
RECOVERY_APPROVED
RECOVERY_EXECUTED
REVENUE_RECOVERED
WORKFLOW_STOPPED

This creates a traceable record of the recovery lifecycle.

🧪 Safe Demo Environment

RevGaurd AI uses synthetic/demo payment and revenue data for demonstration.

No real payment transactions are executed.

Recovery actions are simulated and recorded within the application.

This allows the complete agent workflow to be demonstrated safely:

Detect → Decide → Recover → Measure

without connecting the demo system to real financial infrastructure.

🚀 Getting Started
Prerequisites
Python 3.10+
Node.js 18+
npm
Git
1. Clone the Repository
git clone https://github.com/Geethika-2117/RevGaurd_AI.git
cd RevGaurd_AI
2. Install Frontend Dependencies
npm install
3. Start the Backend

From the project root:

python -m uvicorn backend.main:app --reload

Backend:

http://127.0.0.1:8000
4. Start the Frontend

Open another terminal in the project root:

npm run dev

Then open the URL provided by Vite, typically:

http://localhost:5173
🔑 Demo Credentials

For the seeded demonstration environment:

Email:     carol@acme.com
Password:  acme123
Role:      FINANCE_MANAGER
Company:   Acme Corporation

These credentials are intended only for the synthetic local/demo environment.

📁 Project Structure
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
🎯 Why RevGaurd AI?

Most revenue systems focus on:

"How much revenue was lost?"

RevGaurd AI focuses on the next question:

"How much of that revenue can we safely recover, and what should happen next?"

It connects:

Revenue Intelligence + AI Reasoning + Payment Verification + Policy + Automation + Human Oversight

into one closed-loop revenue recovery system.

🏆 Key Differentiators
1. Detection → Action

RevGaurd AI goes beyond analytics by connecting leakage detection directly to recovery workflows.

2. Verification Before Action

Payment evidence is cross-checked against authoritative transaction data before influencing recovery decisions.

3. AI + Deterministic Controls

AI handles reasoning and recommendations.

Deterministic backend logic handles:

Financial calculations
Authorization
Policy thresholds
Recovery limits
Stopping rules
4. Human-in-the-Loop

High-value or sensitive cases can require explicit finance approval.

5. Measurable Recovery

The system tracks:

Money at Risk
      ↓
Expected Recovery
      ↓
Recovery Action
      ↓
Revenue Recovered
6. Complete Auditability

Critical decisions and actions are recorded for traceability.

7. Multi-Tenant by Design

Organizations operate in isolated data contexts.

🎥 5-Minute Pitch

The pitch demonstrates the complete revenue recovery lifecycle:

Revenue leakage detection
Payment document verification
AI root-cause analysis
Recovery recommendation
Policy evaluation
Human approval for high-value recovery
Simulated recovery
Revenue recovered
Audit trail

Demo video: Coming soon.

🗺️ Roadmap
Current
 Multi-tenant architecture
 Authentication
 Role-based access
 Revenue leakage detection
 Payment document processing
 Payment verification
 Duplicate detection
 AI analysis workflow
 Recovery recommendations
 Policy engine
 Human approval
 Recovery simulation
 Audit trail
Future
 Production payment gateway integrations
 Real-time payment event ingestion
 Subscription recovery integrations
 Invoice system integrations
 Advanced LLM providers
 Adaptive recovery strategies
 Customer communication channels
 Production-grade PostgreSQL deployment
 Advanced revenue forecasting
🔒 Security Disclaimer

RevGaurd AI is a demonstration system and should not be connected to real financial infrastructure without additional production security controls.

A production deployment should include:

HTTPS/TLS
Secure secret management
Production PostgreSQL
Key rotation
Rate limiting
Strong session management
Comprehensive input validation
Encryption at rest
Encryption in transit
Production monitoring
Security testing
Payment-provider compliance controls

No real payment execution is performed by the demo recovery engine.

👩‍💻 Author

Geethika Vangala

B.Tech — Computer Science & Engineering (AI)

GitHub:
https://github.com/Geethika-2117

⭐ RevGaurd AI

Find revenue that's slipping away. Understand why. Recover it safely.
