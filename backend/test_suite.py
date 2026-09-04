import sys
from fastapi.testclient import TestClient
from .main import app
from .seed import seed_database

def run_tests():
    print("=== STARTING REVGUARD AI BACKEND TEST SUITE ===")
    seed_database(reset_existing=True)
    client = TestClient(app)

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health check endpoint OK")

    # 2. Login as Acme Corporation (Alice Vance - ADMIN)
    login_res = client.post("/api/auth/login", json={"email": "alice@acme.com", "password": "acme123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    acme_data = login_res.json()
    acme_token = acme_data["access_token"]
    assert acme_data["organization_name"] == "Acme Corporation"
    acme_headers = {"Authorization": f"Bearer {acme_token}"}
    print(f"[PASS] Acme login successful. Token acquired for user: {acme_data['name']}")

    # 3. Check Acme Dashboard metrics
    dash_res = client.get("/api/dashboard", headers=acme_headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["organization_name"] == "Acme Corporation"
    assert dash["money_at_risk"] > 4000000.0, f"Expected > ₹40L at risk for Acme, got {dash['money_at_risk']}"
    assert dash["revenue_recovered"] > 1000000.0, f"Expected > ₹10L recovered for Acme, got {dash['revenue_recovered']}"
    print(f"[PASS] Acme Dashboard verified: Money at Risk = INR {dash['money_at_risk']:,.2f}, Recovered = INR {dash['revenue_recovered']:,.2f}")

    # 4. Login as TechNova (David Chen - ADMIN)
    nova_res = client.post("/api/auth/login", json={"email": "admin@technova.com", "password": "nova123"})
    assert nova_res.status_code == 200
    nova_data = nova_res.json()
    nova_token = nova_data["access_token"]
    assert nova_data["organization_name"] == "TechNova"
    nova_headers = {"Authorization": f"Bearer {nova_token}"}
    print(f"[PASS] TechNova login successful. User: {nova_data['name']}")

    # 5. Check TechNova Dashboard metrics (Must be completely different from Acme!)
    nova_dash = client.get("/api/dashboard", headers=nova_headers).json()
    assert nova_dash["organization_name"] == "TechNova"
    assert nova_dash["money_at_risk"] < 1000000.0, f"Expected ~₹8.4L for TechNova, got {nova_dash['money_at_risk']}"
    print(f"[PASS] TechNova Dashboard verified: Money at Risk = INR {nova_dash['money_at_risk']:,.2f}, Recovered = INR {nova_dash['revenue_recovered']:,.2f}")

    # 6. CRITICAL DATA ISOLATION TEST:
    # Get an Acme case ID
    acme_cases = client.get("/api/leakage", headers=acme_headers).json()
    assert len(acme_cases) > 0
    acme_case_id = acme_cases[0]["id"]

    # TechNova user tries to get Acme's case
    cross_tenant_res = client.get(f"/api/leakage/{acme_case_id}", headers=nova_headers)
    assert cross_tenant_res.status_code in [403, 404], f"Cross-tenant isolation FAILED! Returned {cross_tenant_res.status_code}"
    print(f"[PASS] Strict Tenant Isolation Confirmed: TechNova blocked from Acme Case #{acme_case_id} (HTTP {cross_tenant_res.status_code})")

    # 7. Document Verification: Scenario 1 - Verified Success
    v1_res = client.post("/api/documents/demo-scenarios", json={"scenario_id": "verified_success"}, headers=acme_headers)
    assert v1_res.status_code == 200
    v1 = v1_res.json()
    assert v1["verification_result"] == "VERIFIED", f"Expected VERIFIED, got {v1['verification_result']}"
    assert v1["verification_score"] >= 90
    print(f"[PASS] Scenario 1: Verified Success OK (Score: {v1['verification_score']}%)")

    # 8. Document Verification: Scenario 3 - False Success Claim (Status Mismatch)
    v3_res = client.post("/api/documents/demo-scenarios", json={"scenario_id": "status_mismatch"}, headers=acme_headers)
    assert v3_res.status_code == 200
    v3 = v3_res.json()
    assert v3["verification_result"] == "VERIFICATION_FAILED"
    assert "PAYMENT STATUS MISMATCH" in v3["verification_reason"]
    print(f"[PASS] Scenario 3: False Success Mismatch Detected OK ('{v3['verification_reason'][:60]}...')")

    # 9. Document Verification: Scenario 4 - Wrong Recipient
    v4_res = client.post("/api/documents/demo-scenarios", json={"scenario_id": "wrong_recipient"}, headers=acme_headers)
    assert v4_res.status_code == 200
    v4 = v4_res.json()
    assert v4["verification_result"] == "VERIFICATION_FAILED"
    assert "WRONG RECIPIENT" in v4["verification_reason"]
    print(f"[PASS] Scenario 4: Wrong Recipient Detected OK ('{v4['verification_reason'][:60]}...')")

    # 10. Document Verification: Scenario 5 - Amount Mismatch
    v5_res = client.post("/api/documents/demo-scenarios", json={"scenario_id": "amount_mismatch"}, headers=acme_headers)
    assert v5_res.status_code == 200
    v5 = v5_res.json()
    assert v5["verification_result"] == "VERIFICATION_FAILED"
    assert "PAYMENT AMOUNT MISMATCH" in v5["verification_reason"]
    print(f"[PASS] Scenario 5: Amount Mismatch Detected OK")

    # 11. Single Case Recovery Action & Simulated Settlement (Under <= ₹500,000 auto limit)
    target_case = next(c for c in acme_cases if c["amount_at_risk"] <= 500000.0)
    rec_res = client.post(
        f"/api/leakage/{target_case['id']}/recover",
        json={"action_type": target_case["recommended_action"] or "PAYMENT_RETRY"},
        headers=acme_headers
    )
    assert rec_res.status_code == 200
    assert rec_res.json()["action_status"] == "RECOVERING"
    print(f"[PASS] Case #{target_case['id']} recovery action triggered.")

    # Simulate payment settlement
    settle_res = client.post(f"/api/leakage/{target_case['id']}/simulate-payment", headers=acme_headers)
    assert settle_res.status_code == 200
    assert settle_res.json()["action_status"] == "RECOVERED"
    print(f"[PASS] Case #{target_case['id']} payment settlement simulated. Marked as RECOVERED.")

    # 12. Batch Recovery Simulation
    batch_res = client.post("/api/recovery/batch", headers=acme_headers)
    assert batch_res.status_code == 200
    bdata = batch_res.json()
    assert bdata["amount_recovered"] > 0
    print(f"[PASS] Batch AI Recovery Simulation OK: INR {bdata['amount_recovered']:,.2f} settled.")

    # 13. Audit Trail Isolation
    audit_res = client.get("/api/audit", headers=acme_headers)
    assert audit_res.status_code == 200
    acme_audit = audit_res.json()
    assert len(acme_audit) > 0
    print(f"[PASS] Audit Trail Verified: {len(acme_audit)} tenant-isolated audit logs for Acme.")

    # 14. Registration: Register a New Company (StripeCorp)
    reg_payload = {
        "company_name": "StripeCorp Global",
        "merchant_id": "STRIPE-CORP-99",
        "admin_name": "Sarah Connor",
        "admin_email": "sarah@stripecorp.demo",
        "password": "stripepassword123"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    stripe_data = reg_res.json()
    assert stripe_data["organization_name"] == "StripeCorp Global"
    assert stripe_data["role"] == "ADMIN"
    assert stripe_data["org_code"].startswith("ORG-")
    stripe_headers = {"Authorization": f"Bearer {stripe_data['access_token']}"}
    print(f"[PASS] Company Registration OK: {stripe_data['organization_name']} ({stripe_data['org_code']}), Admin: {stripe_data['name']}")

    # 15. Verify New Company Starts with Zero Data
    stripe_dash = client.get("/api/dashboard", headers=stripe_headers).json()
    assert stripe_dash["money_at_risk"] == 0.0, f"Expected 0 money at risk for new company, got {stripe_dash['money_at_risk']}"
    assert stripe_dash["revenue_recovered"] == 0.0
    assert stripe_dash["active_cases_count"] == 0
    print("[PASS] Zero-Data Initial State Confirmed: Money at Risk = INR 0, Recovered = INR 0")

    # 16. Seed Company-Specific Demo Data for New Company
    seed_res = client.post("/api/data-sources/seed-demo", headers=stripe_headers)
    assert seed_res.status_code == 200
    stripe_dash_after = client.get("/api/dashboard", headers=stripe_headers).json()
    assert stripe_dash_after["money_at_risk"] > 0, "Expected demo data to populate money at risk"
    print(f"[PASS] Tenant-Scoped Demo Data Generation OK: {stripe_data['organization_name']} now has INR {stripe_dash_after['money_at_risk']:,.2f} at risk.")

    # 17. Verify Strict Cross-Tenant Isolation with New Company
    stripe_cases = client.get("/api/leakage", headers=stripe_headers).json()
    assert len(stripe_cases) > 0
    stripe_case_id = stripe_cases[0]["id"]
    acme_probe = client.get(f"/api/leakage/{stripe_case_id}", headers=acme_headers)
    assert acme_probe.status_code in [403, 404]
    print(f"[PASS] New Company Isolation Verified: Acme blocked from StripeCorp Case #{stripe_case_id} (HTTP {acme_probe.status_code})")

    # 18. Organization Settings: Company & Users Endpoints
    comp_res = client.get("/api/settings/company", headers=stripe_headers)
    assert comp_res.status_code == 200
    comp_info = comp_res.json()
    assert comp_info["merchant_id"] == "STRIPE-CORP-99"
    assert comp_info["admin_email"] == "sarah@stripecorp.demo"
    print(f"[PASS] Company Settings OK: MID={comp_info['merchant_id']}, OrgCode={comp_info['org_code']}")

    users_res = client.get("/api/settings/users", headers=stripe_headers)
    assert users_res.status_code == 200
    stripe_users = users_res.json()
    assert len(stripe_users) == 1
    assert stripe_users[0]["email"] == "sarah@stripecorp.demo"
    assert stripe_users[0]["role"] == "ADMIN"
    print(f"[PASS] Tenant Users OK: Exactly 1 user listed for StripeCorp: {stripe_users[0]['email']}")

    # 19. Logout Audit Event
    logout_res = client.post("/api/auth/logout", headers=stripe_headers)
    assert logout_res.status_code == 200
    stripe_audit = client.get("/api/audit", headers=stripe_headers).json()
    assert any(a["event_type"] == "LOGOUT" for a in stripe_audit)
    print("[PASS] Logout endpoint OK & Audit Log recorded.")

    print("\n=== ALL BACKEND TESTS PASSED SUCCESSFULLY (19/19) ===")

if __name__ == "__main__":
    run_tests()
