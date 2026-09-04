import datetime
import json
from .database import engine, SessionLocal, Base
from .models import (
    Organization, User, Customer, Payment, PaymentDocument,
    PaymentVerification, LeakageCase, RecoveryAction, AuditLog, DataSource
)
from .auth import get_password_hash

def seed_database(force: bool = False, reset_existing: bool = False):
    db = SessionLocal()
    try:
        if force or reset_existing:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        # -------------------------------------------------------------
        # 1. ACME CORPORATION
        # -------------------------------------------------------------
        acme = db.query(Organization).filter(Organization.name == "Acme Corporation").first()
        if not acme:
            print("Seeding Acme Corporation test data...")
            acme = Organization(
                name="Acme Corporation",
                merchant_id="ACME-MERCHANT-001",
                org_code="ORG-A8F31",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=90)
            )
            db.add(acme)
            db.flush()

        # Acme Users
        u_alice = User(
            organization_id=acme.id,
            name="Alice Vance",
            email="alice@acme.com",
            password_hash=get_password_hash("acme123"),
            role="ADMIN"
        )
        u_bob = User(
            organization_id=acme.id,
            name="Bob Miller",
            email="bob@acme.com",
            password_hash=get_password_hash("acme123"),
            role="ANALYST"
        )
        u_carol = User(
            organization_id=acme.id,
            name="Carol Danvers",
            email="carol@acme.com",
            password_hash=get_password_hash("acme123"),
            role="FINANCE_MANAGER"
        )
        db.add_all([u_alice, u_bob, u_carol])
        db.flush()

        # Acme Customers
        c_apex = Customer(organization_id=acme.id, name="Apex MegaRetail", email="finance@apexretail.com", phone="+91 98200 11223", lifetime_value=3450000.0)
        c_rahul = Customer(organization_id=acme.id, name="Rahul Enterprises", email="accounts@rahulent.in", phone="+91 98111 22334", lifetime_value=850000.0)
        c_tata = Customer(organization_id=acme.id, name="Tata B2B Distribution", email="billing@tatab2b.com", phone="+91 98222 33445", lifetime_value=5120000.0)
        c_zion = Customer(organization_id=acme.id, name="Zion SaaS Enterprise", email="pay@zionsaas.io", phone="+91 98333 44556", lifetime_value=1240000.0)
        c_quick = Customer(organization_id=acme.id, name="QuickCommerce Hub", email="ops@quickcom.com", phone="+91 98444 55667", lifetime_value=640000.0)
        c_mahindra = Customer(organization_id=acme.id, name="Mahindra Heavy Ind", email="treasury@mahindraheavy.in", phone="+91 98555 66778", lifetime_value=9200000.0)
        c_zeta = Customer(organization_id=acme.id, name="Zeta Retailers", email="accounts@zetaretail.com", phone="+91 98666 77889", lifetime_value=1450000.0)
        c_kaveri = Customer(organization_id=acme.id, name="Kaveri Global Tech", email="fin@kaveriglobal.com", phone="+91 98777 88990", lifetime_value=2100000.0)
        c_omni = Customer(organization_id=acme.id, name="Omni Logistics Pvt", email="pay@omnilog.in", phone="+91 98888 99001", lifetime_value=1950000.0)
        db.add_all([c_apex, c_rahul, c_tata, c_zion, c_quick, c_mahindra, c_zeta, c_kaveri, c_omni])
        db.flush()

        # Acme Payments
        now = datetime.datetime.utcnow()
        # Seeded authoritative ledger records for Acme
        p_rahul = Payment(
            organization_id=acme.id, customer_id=c_rahul.id, transaction_id="TXN-78421",
            amount=48000.0, currency="INR", payment_status="FAILED", payment_method="CREDIT_CARD",
            failure_reason="Customer card expired / network decline",
            recipient_name="Acme Corporation", recipient_identifier="ACME-MERCHANT-001",
            transaction_timestamp=now - datetime.timedelta(hours=4)
        )
        p_apex = Payment(
            organization_id=acme.id, customer_id=c_apex.id, transaction_id="TXN-90214",
            amount=500000.0, currency="INR", payment_status="FAILED", payment_method="NET_BANKING",
            failure_reason="Bank gateway timeout during settlement cycle",
            recipient_name="Acme Corporation", recipient_identifier="ACME-MERCHANT-001",
            transaction_timestamp=now - datetime.timedelta(days=1)
        )
        p_verified_ok = Payment(
            organization_id=acme.id, customer_id=c_tata.id, transaction_id="TXN-11002",
            amount=125000.0, currency="INR", payment_status="SUCCESS", payment_method="UPI",
            failure_reason=None, recipient_name="Acme Corporation", recipient_identifier="ACME-MERCHANT-001",
            transaction_timestamp=now - datetime.timedelta(days=2)
        )
        p_mismatch = Payment(
            organization_id=acme.id, customer_id=c_mahindra.id, transaction_id="TXN-44910",
            amount=10000.0, currency="INR", payment_status="SUCCESS", payment_method="NEFT",
            failure_reason=None, recipient_name="Acme Corporation", recipient_identifier="ACME-MERCHANT-001",
            transaction_timestamp=now - datetime.timedelta(days=3)
        )
        p_false_claim = Payment(
            organization_id=acme.id, customer_id=c_zeta.id, transaction_id="TXN-33019",
            amount=250000.0, currency="INR", payment_status="FAILED", payment_method="ACH",
            failure_reason="Insufficient merchant clearance / bank dishonor",
            recipient_name="Acme Corporation", recipient_identifier="ACME-MERCHANT-001",
            transaction_timestamp=now - datetime.timedelta(days=2)
        )
        p_acme_demo = Payment(
            organization_id=acme.id, customer_id=c_zion.id, transaction_id="ACME-TXN-20260904-001",
            amount=48000.0, currency="INR", payment_status="SUCCESS", payment_method="Bank Transfer",
            failure_reason=None, recipient_name="Acme Corporation", recipient_identifier="ACME-MERCHANT-001",
            transaction_timestamp=datetime.datetime(2026, 9, 4, 10, 30, 0)
        )
        db.add_all([p_rahul, p_apex, p_verified_ok, p_mismatch, p_false_claim, p_acme_demo])
        db.flush()

        # Acme Leakage Cases — Designed to match Acme's target ~₹42.8L at risk, ~₹13.7L recovered
        # Failed Payments: ₹12,40,000
        # Overdue Invoices: ₹15,40,000
        # Abandoned Checkouts: ₹8,70,000
        # Failed Subscriptions: ₹6,30,000
        # Sum = ₹42,80,000
        cases_acme = [
            # Failed Payments category
            LeakageCase(
                organization_id=acme.id, customer_id=c_apex.id, payment_id=p_apex.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=500000.0, risk_score=85,
                recovery_probability=0.90, expected_recovery=450000.0,
                root_cause="HDFC corporate banking timeout during daily settlement sweep.",
                recommended_action="PAYMENT_RETRY", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_rahul.id, payment_id=p_rahul.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=48000.0, risk_score=35,
                recovery_probability=0.82, expected_recovery=39360.0,
                root_cause="Customer corporate card expired at end of previous month.",
                recommended_action="REQUEST_PAYMENT_METHOD_UPDATE", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_quick.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=692000.0, risk_score=78,
                recovery_probability=0.76, expected_recovery=525920.0,
                root_cause="Multi-merchant UPI debit mandate expired after 12 months.",
                recommended_action="SEND_PAYMENT_LINK", policy_status="APPROVED",
                action_status="ANALYZING", revenue_recovered=0.0
            ),
            # Overdue Invoices category
            LeakageCase(
                organization_id=acme.id, customer_id=c_mahindra.id,
                leakage_type="OVERDUE_INVOICE", amount_at_risk=850000.0, risk_score=92,
                recovery_probability=0.61, expected_recovery=518500.0,
                root_cause="High-value receivable overdue by 45 days. Vendor portal invoice misfiled.",
                recommended_action="ESCALATE_TO_FINANCE", policy_status="REQUIRES_HUMAN_REVIEW",
                action_status="ESCALATED", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_zeta.id, payment_id=p_false_claim.id,
                leakage_type="OVERDUE_INVOICE", amount_at_risk=690000.0, risk_score=80,
                recovery_probability=0.64, expected_recovery=441600.0,
                root_cause="Accounts payable approval queue delayed pending receipt acknowledgment.",
                recommended_action="SEND_PAYMENT_REMINDER", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            # Abandoned Checkouts category
            LeakageCase(
                organization_id=acme.id, customer_id=c_zion.id,
                leakage_type="ABANDONED_CHECKOUT", amount_at_risk=580000.0, risk_score=65,
                recovery_probability=0.74, expected_recovery=429200.0,
                root_cause="Annual tier upgrade cart dropped during OTP authentication step.",
                recommended_action="SEND_PAYMENT_LINK", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_quick.id,
                leakage_type="ABANDONED_CHECKOUT", amount_at_risk=290000.0, risk_score=55,
                recovery_probability=0.68, expected_recovery=197200.0,
                root_cause="Cart abandoned after gateway declined international credit card.",
                recommended_action="ALTERNATE_PAYMENT_METHOD", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            # Failed Subscriptions category
            LeakageCase(
                organization_id=acme.id, customer_id=c_tata.id,
                leakage_type="FAILED_SUBSCRIPTION", amount_at_risk=380000.0, risk_score=72,
                recovery_probability=0.84, expected_recovery=319200.0,
                root_cause="Recurring ACH billing mandate soft-declined by customer bank.",
                recommended_action="PAYMENT_RETRY", policy_status="APPROVED",
                action_status="RECOVERING", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_kaveri.id,
                leakage_type="FAILED_SUBSCRIPTION", amount_at_risk=250000.0, risk_score=60,
                recovery_probability=0.79, expected_recovery=197500.0,
                root_cause="Subscription renewal attempt failed due to daily card volume limit.",
                recommended_action="PAYMENT_RETRY", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            # Previously Recovered Cases for Acme (~₹13.7L total)
            LeakageCase(
                organization_id=acme.id, customer_id=c_tata.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=0.0, risk_score=20,
                recovery_probability=1.0, expected_recovery=720000.0,
                root_cause="Gateway failover resolved payment on secondary route.",
                recommended_action="ALTERNATE_PAYMENT_METHOD", policy_status="APPROVED",
                action_status="RECOVERED", revenue_recovered=720000.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_omni.id,
                leakage_type="OVERDUE_INVOICE", amount_at_risk=0.0, risk_score=15,
                recovery_probability=1.0, expected_recovery=450000.0,
                root_cause="Automated reminder with one-click payment link settled within 2 hours.",
                recommended_action="SEND_PAYMENT_LINK", policy_status="APPROVED",
                action_status="RECOVERED", revenue_recovered=450000.0
            ),
            LeakageCase(
                organization_id=acme.id, customer_id=c_zion.id,
                leakage_type="FAILED_SUBSCRIPTION", amount_at_risk=0.0, risk_score=10,
                recovery_probability=1.0, expected_recovery=200000.0,
                root_cause="Customer updated credit card upon prompt notification.",
                recommended_action="REQUEST_PAYMENT_METHOD_UPDATE", policy_status="APPROVED",
                action_status="RECOVERED", revenue_recovered=200000.0
            ),
        ]
        db.add_all(cases_acme)
        db.flush()

        # Acme Audit Logs
        audit_acme = [
            AuditLog(
                organization_id=acme.id, user_id=u_alice.id,
                event_type="ORGANIZATION_INITIALIZED", entity_type="Organization", entity_id=str(acme.id),
                description="Acme Corporation workspace initialized with merchant ID ACME-MERCHANT-001.",
                timestamp=now - datetime.timedelta(days=7),
                metadata_json=json.dumps({"merchant_id": "ACME-MERCHANT-001"})
            ),
            AuditLog(
                organization_id=acme.id, user_id=u_bob.id,
                event_type="PAYMENT_VERIFIED", entity_type="Payment", entity_id=str(p_verified_ok.id),
                description="Payment TXN-11002 (₹1,25,000) verified against banking ledger with 100% match.",
                timestamp=now - datetime.timedelta(days=2),
                metadata_json=json.dumps({"txn": "TXN-11002", "amount": 125000.0, "status": "VERIFIED"})
            ),
            AuditLog(
                organization_id=acme.id, user_id=None,
                event_type="LEAKAGE_DETECTED", entity_type="LeakageCase", entity_id=str(cases_acme[0].id),
                description="AI detected ₹5,00,000 revenue at risk from bank gateway timeout at Apex MegaRetail.",
                timestamp=now - datetime.timedelta(days=1),
                metadata_json=json.dumps({"amount": 500000.0, "customer": "Apex MegaRetail"})
            ),
            AuditLog(
                organization_id=acme.id, user_id=u_carol.id,
                event_type="POLICY_ESCALATION", entity_type="LeakageCase", entity_id=str(cases_acme[3].id),
                description="High-value case (₹8,50,000) routed to human finance review under safety policy threshold.",
                timestamp=now - datetime.timedelta(hours=18),
                metadata_json=json.dumps({"policy": "MAX_AUTOMATION_THRESHOLD", "threshold": 500000.0})
            ),
            AuditLog(
                organization_id=acme.id, user_id=None,
                event_type="PAYMENT_RECOVERED", entity_type="LeakageCase", entity_id=str(cases_acme[9].id),
                description="Successfully recovered ₹7,20,000 via alternate payment rail for Tata B2B Distribution.",
                timestamp=now - datetime.timedelta(hours=6),
                metadata_json=json.dumps({"amount_recovered": 720000.0, "customer": "Tata B2B Distribution"})
            )
        ]
        db.add_all(audit_acme)
        db.flush()

        ds_acme = [
            DataSource(organization_id=acme.id, source_type="PAYMENT_GATEWAY", name="Payment Gateway Stream", status="CONNECTED", events_count=92421, last_refresh=now - datetime.timedelta(minutes=2)),
            DataSource(organization_id=acme.id, source_type="INVOICE_LEDGER", name="Billing & ERP Invoices", status="CONNECTED", events_count=18342, last_refresh=now - datetime.timedelta(minutes=14)),
            DataSource(organization_id=acme.id, source_type="CHECKOUT_SESSIONS", name="E-Commerce Checkout Sessions", status="CONNECTED", events_count=61320, last_refresh=now - datetime.timedelta(minutes=5)),
            DataSource(organization_id=acme.id, source_type="RECURRING_BILLING", name="Subscription Mandates", status="CONNECTED", events_count=12210, last_refresh=now - datetime.timedelta(hours=1))
        ]
        db.add_all(ds_acme)
        db.flush()

        # -------------------------------------------------------------
        # 2. TECHNOVA
        # -------------------------------------------------------------
        technova = Organization(
            name="TechNova",
            merchant_id="TECHNOVA-MERCHANT-002",
            org_code="ORG-T29C4",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=60)
        )
        db.add(technova)
        db.flush()

        u_david = User(
            organization_id=technova.id,
            name="David Chen",
            email="admin@technova.com",
            password_hash=get_password_hash("nova123"),
            role="ADMIN"
        )
        u_elena = User(
            organization_id=technova.id,
            name="Elena Rostova",
            email="analyst@technova.com",
            password_hash=get_password_hash("nova123"),
            role="ANALYST"
        )
        db.add_all([u_david, u_elena])
        db.flush()

        c_novacloud = Customer(organization_id=technova.id, name="NovaCloud Services", email="billing@novacloud.io", phone="+91 99111 33445", lifetime_value=1200000.0)
        c_quantum = Customer(organization_id=technova.id, name="Quantum Labs", email="accounts@quantumlabs.ai", phone="+91 99222 44556", lifetime_value=950000.0)
        c_vertex = Customer(organization_id=technova.id, name="Vertex BioTech", email="fin@vertexbio.com", phone="+91 99333 55667", lifetime_value=680000.0)
        db.add_all([c_novacloud, c_quantum, c_vertex])
        db.flush()

        # TechNova Target: ~₹8.4L at risk, ~₹3.1L recovered
        cases_tech = [
            LeakageCase(
                organization_id=technova.id, customer_id=c_novacloud.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=320000.0, risk_score=68,
                recovery_probability=0.85, expected_recovery=272000.0,
                root_cause="Cloud compute subscription charge declined by issuing card bank.",
                recommended_action="PAYMENT_RETRY", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=technova.id, customer_id=c_quantum.id,
                leakage_type="OVERDUE_INVOICE", amount_at_risk=290000.0, risk_score=75,
                recovery_probability=0.72, expected_recovery=208800.0,
                root_cause="Milestone 2 API integration invoice overdue by 18 days.",
                recommended_action="SEND_PAYMENT_REMINDER", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=technova.id, customer_id=c_vertex.id,
                leakage_type="ABANDONED_CHECKOUT", amount_at_risk=150000.0, risk_score=50,
                recovery_probability=0.78, expected_recovery=117000.0,
                root_cause="Developer license tier abandoned at 3D Secure verification.",
                recommended_action="SEND_PAYMENT_LINK", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=technova.id, customer_id=c_novacloud.id,
                leakage_type="FAILED_SUBSCRIPTION", amount_at_risk=80000.0, risk_score=45,
                recovery_probability=0.88, expected_recovery=70400.0,
                root_cause="Card limit exceeded during automatic monthly renewal.",
                recommended_action="REQUEST_PAYMENT_METHOD_UPDATE", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            # TechNova Recovered Case (₹3,10,000)
            LeakageCase(
                organization_id=technova.id, customer_id=c_quantum.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=0.0, risk_score=15,
                recovery_probability=1.0, expected_recovery=310000.0,
                root_cause="Automated retry triggered at 06:00 UTC processed successfully.",
                recommended_action="PAYMENT_RETRY", policy_status="APPROVED",
                action_status="RECOVERED", revenue_recovered=310000.0
            ),
        ]
        db.add_all(cases_tech)
        db.flush()

        audit_tech = [
            AuditLog(
                organization_id=technova.id, user_id=u_david.id,
                event_type="ORGANIZATION_INITIALIZED", entity_type="Organization", entity_id=str(technova.id),
                description="TechNova tenant created with merchant ID TECHNOVA-MERCHANT-002.",
                timestamp=now - datetime.timedelta(days=14),
                metadata_json=json.dumps({"merchant_id": "TECHNOVA-MERCHANT-002"})
            ),
            AuditLog(
                organization_id=technova.id, user_id=None,
                event_type="PAYMENT_RECOVERED", entity_type="LeakageCase", entity_id=str(cases_tech[4].id),
                description="Recovered ₹3,10,000 via smart retry logic for Quantum Labs.",
                timestamp=now - datetime.timedelta(days=1),
                metadata_json=json.dumps({"amount_recovered": 310000.0, "customer": "Quantum Labs"})
            )
        ]
        db.add_all(audit_tech)
        db.flush()

        # -------------------------------------------------------------
        # 3. GLOBAL COMMERCE
        # -------------------------------------------------------------
        global_corp = Organization(
            name="Global Commerce",
            merchant_id="GLOBAL-MERCHANT-003",
            org_code="ORG-G51B8",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=120)
        )
        db.add(global_corp)
        db.flush()

        u_marcus = User(
            organization_id=global_corp.id,
            name="Marcus Thorne",
            email="admin@globalcommerce.com",
            password_hash=get_password_hash("global123"),
            role="ADMIN"
        )
        u_sonia = User(
            organization_id=global_corp.id,
            name="Sonia Gandhi",
            email="finance@globalcommerce.com",
            password_hash=get_password_hash("global123"),
            role="FINANCE_MANAGER"
        )
        db.add_all([u_marcus, u_sonia])
        db.flush()

        c_pacific = Customer(organization_id=global_corp.id, name="Pacific Freight Lines", email="billing@pacificfreight.com", phone="+91 97111 22334", lifetime_value=14200000.0)
        c_euro = Customer(organization_id=global_corp.id, name="EuroTrade Corp", email="pay@eurotrade.eu", phone="+91 97222 33445", lifetime_value=8900000.0)
        db.add_all([c_pacific, c_euro])
        db.flush()

        # Global Commerce Target: ~₹65.2L at risk, ~₹22.8L recovered
        cases_global = [
            LeakageCase(
                organization_id=global_corp.id, customer_id=c_pacific.id,
                leakage_type="OVERDUE_INVOICE", amount_at_risk=3500000.0, risk_score=88,
                recovery_probability=0.70, expected_recovery=2450000.0,
                root_cause="Cross-border ocean freight bill awaiting customs documentation sign-off.",
                recommended_action="ESCALATE_TO_FINANCE", policy_status="REQUIRES_HUMAN_REVIEW",
                action_status="ESCALATED", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=global_corp.id, customer_id=c_euro.id,
                leakage_type="FAILED_PAYMENT", amount_at_risk=1820000.0, risk_score=80,
                recovery_probability=0.82, expected_recovery=1492400.0,
                root_cause="International SWIFT wire transfer rejected due to routing code format.",
                recommended_action="ALTERNATE_PAYMENT_METHOD", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            LeakageCase(
                organization_id=global_corp.id, customer_id=c_pacific.id,
                leakage_type="ABANDONED_CHECKOUT", amount_at_risk=1200000.0, risk_score=62,
                recovery_probability=0.75, expected_recovery=900000.0,
                root_cause="Bulk freight booking container deposit abandoned during 3D-secure.",
                recommended_action="SEND_PAYMENT_LINK", policy_status="APPROVED",
                action_status="FOUND", revenue_recovered=0.0
            ),
            # Global Commerce Recovered (₹22,80,000)
            LeakageCase(
                organization_id=global_corp.id, customer_id=c_euro.id,
                leakage_type="OVERDUE_INVOICE", amount_at_risk=0.0, risk_score=20,
                recovery_probability=1.0, expected_recovery=2280000.0,
                root_cause="Executive finance conference resolved and settled outstanding wire.",
                recommended_action="ESCALATE_TO_FINANCE", policy_status="APPROVED",
                action_status="RECOVERED", revenue_recovered=2280000.0
            )
        ]
        db.add_all(cases_global)
        db.flush()

        audit_global = [
            AuditLog(
                organization_id=global_corp.id, user_id=u_marcus.id,
                event_type="ORGANIZATION_INITIALIZED", entity_type="Organization", entity_id=str(global_corp.id),
                description="Global Commerce organization setup complete with merchant ID GLOBAL-MERCHANT-003.",
                timestamp=now - datetime.timedelta(days=30),
                metadata_json=json.dumps({"merchant_id": "GLOBAL-MERCHANT-003"})
            ),
            AuditLog(
                organization_id=global_corp.id, user_id=u_sonia.id,
                event_type="PAYMENT_RECOVERED", entity_type="LeakageCase", entity_id=str(cases_global[3].id),
                description="Recovered ₹22,80,000 cross-border invoice from EuroTrade Corp.",
                timestamp=now - datetime.timedelta(days=3),
                metadata_json=json.dumps({"amount_recovered": 2280000.0, "customer": "EuroTrade Corp"})
            )
        ]
        db.add_all(audit_global)

        db.commit()
        print("Database successfully seeded for Acme Corporation, TechNova, and Global Commerce!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database(reset_existing=True)
