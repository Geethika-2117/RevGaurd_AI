import requests
import json
from .seed import seed_database

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== STARTING REVGUARD AI POLICY WORKFLOW & HUMAN APPROVAL TESTS ===")
    seed_database(force=True)

    # 1. Login as Acme Admin (Alice Vance)
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "alice@acme.com", "password": "acme123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Alice Vance (ADMIN) logged in successfully.")

    # 2. Login as Acme Finance Manager (Carol Danvers)
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "carol@acme.com", "password": "acme123"})
    assert res.status_code == 200, f"Finance Manager login failed: {res.text}"
    fin_token = res.json()["access_token"]
    fin_headers = {"Authorization": f"Bearer {fin_token}"}
    print("[PASS] Carol Danvers (FINANCE_MANAGER) logged in successfully.")

    # 3. Login as Acme Analyst (Bob Miller)
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "bob@acme.com", "password": "acme123"})
    assert res.status_code == 200, f"Analyst login failed: {res.text}"
    analyst_token = res.json()["access_token"]
    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    print("[PASS] Bob Miller (ANALYST) logged in successfully.")

    # Fetch Acme cases
    cases_res = requests.get(f"{BASE_URL}/api/leakage", headers=admin_headers)
    assert cases_res.status_code == 200
    cases = cases_res.json()
    
    # Locate Zion SaaS Enterprise case (₹580,000, 74%, SEND_PAYMENT_LINK)
    zion_case = next((c for c in cases if c["customer_name"] == "Zion SaaS Enterprise" and c["amount_at_risk"] == 580000.0), None)
    assert zion_case is not None, "Zion SaaS Enterprise case (₹580,000) not found in Acme cases!"
    zion_id = zion_case["id"]
    print(f"[PASS] Located Zion SaaS Enterprise Case #{zion_id} (INR {zion_case['amount_at_risk']:,.2f}, {round(zion_case['recovery_probability']*100)}%, {zion_case['recommended_action']})")

    # Locate Apex case (INR 500,000)
    apex_case = next((c for c in cases if c["amount_at_risk"] == 500000.0), None)
    assert apex_case is not None, "Case with INR 500,000 not found"
    
    # Locate Rahul case (INR 48,000 <= INR 500,000)
    rahul_case = next((c for c in cases if c["amount_at_risk"] < 500000.0), None)
    assert rahul_case is not None

    # -------------------------------------------------------------
    # TEST 1: Amount = INR 48,000 (<= INR 500,000) -> AUTOMATIC RECOVERY ALLOWED
    # -------------------------------------------------------------
    p1 = requests.post(f"{BASE_URL}/api/leakage/{rahul_case['id']}/policy-check", headers=admin_headers, json={})
    assert p1.status_code == 200
    d1 = p1.json()
    assert d1["is_automatic_allowed"] == True, f"Expected automatic allowed for INR {rahul_case['amount_at_risk']}"
    assert d1["requires_human_approval"] == False
    assert d1["status_headline"] == "AUTOMATIC RECOVERY ALLOWED"
    print(f"[PASS] TEST 1: Case #{rahul_case['id']} (INR {rahul_case['amount_at_risk']:,.2f}) -> AUTOMATIC RECOVERY ALLOWED")

    # -------------------------------------------------------------
    # TEST 2: Amount = INR 500,000 (Threshold = INR 500,000) -> AUTOMATIC RECOVERY ALLOWED
    # -------------------------------------------------------------
    p2 = requests.post(f"{BASE_URL}/api/leakage/{apex_case['id']}/policy-check", headers=admin_headers, json={})
    assert p2.status_code == 200
    d2 = p2.json()
    assert d2["is_automatic_allowed"] == True, f"Expected automatic allowed for exact INR 500,000 threshold"
    assert d2["requires_human_approval"] == False
    assert d2["status_headline"] == "AUTOMATIC RECOVERY ALLOWED"
    print(f"[PASS] TEST 2: Case #{apex_case['id']} (INR 500,000.00) -> AUTOMATIC RECOVERY ALLOWED (Ceiling exact match)")

    # -------------------------------------------------------------
    # TEST 3: Amount = INR 580,000 (Zion SaaS Enterprise) -> HUMAN APPROVAL REQUIRED
    # -------------------------------------------------------------
    p3 = requests.post(f"{BASE_URL}/api/leakage/{zion_id}/policy-check", headers=admin_headers, json={})
    assert p3.status_code == 200
    d3 = p3.json()
    assert d3["is_automatic_allowed"] == False
    assert d3["requires_human_approval"] == True
    assert d3["status_headline"] == "HUMAN APPROVAL REQUIRED"
    assert "580,000" in d3["explanation"]
    print(f"[PASS] TEST 3: Case #{zion_id} (INR 580,000.00) -> HUMAN APPROVAL REQUIRED (Expected policy state, not error)")

    # -------------------------------------------------------------
    # TEST 4: High-Value Case > INR 500,000 (e.g. INR 850,000 or INR 692,000) -> HUMAN APPROVAL REQUIRED
    # -------------------------------------------------------------
    high_case = next((c for c in cases if c["amount_at_risk"] >= 800000.0), None)
    if high_case:
        p4 = requests.post(f"{BASE_URL}/api/leakage/{high_case['id']}/policy-check", headers=admin_headers, json={})
        assert p4.status_code == 200
        d4 = p4.json()
        assert d4["is_automatic_allowed"] == False
        assert d4["requires_human_approval"] == True
        assert d4["status_headline"] == "HUMAN APPROVAL REQUIRED"
        print(f"[PASS] TEST 4: Case #{high_case['id']} (INR {high_case['amount_at_risk']:,.2f}) -> HUMAN APPROVAL REQUIRED")

    # -------------------------------------------------------------
    # TEST 5: High-value recovery requested by ANALYST -> Analyst cannot approve own request (HTTP 403)
    # -------------------------------------------------------------
    # Bob (Analyst) requests approval for Zion Case (INR 580,000)
    req_res = requests.post(f"{BASE_URL}/api/leakage/{zion_id}/request-approval", headers=analyst_headers, json={})
    assert req_res.status_code == 200, f"Request approval failed: {req_res.text}"
    req_data = req_res.json()
    action_id = req_data["action_id"]
    assert req_data["status"] == "PENDING_APPROVAL"
    print(f"[PASS] Analyst (Bob) requested finance approval for Case #{zion_id}. Action #{action_id} status: PENDING_APPROVAL.")

    # Bob (Analyst) attempts to approve the request -> MUST BE BLOCKED (HTTP 403)
    analyst_approve_res = requests.post(f"{BASE_URL}/api/recovery/approvals/{action_id}/approve", headers=analyst_headers, json={})
    assert analyst_approve_res.status_code == 403, f"Expected 403 Forbidden for analyst approval, got {analyst_approve_res.status_code}"
    print(f"[PASS] TEST 5: Analyst approval blocked with HTTP 403: {analyst_approve_res.json()['detail']}")

    # -------------------------------------------------------------
    # TEST 6: Complete End-to-End Flow for Zion SaaS Enterprise (INR 580,000)
    # -------------------------------------------------------------
    # 6a. Check Approvals Queue for Acme
    apps_res = requests.get(f"{BASE_URL}/api/recovery/approvals", headers=fin_headers)
    assert apps_res.status_code == 200
    apps_list = apps_res.json()
    pending_item = next((a for a in apps_list if a["action_id"] == action_id), None)
    assert pending_item is not None, "Pending approval item not found in queue!"
    assert pending_item["amount_at_risk"] == 580000.0
    assert pending_item["customer_name"] == "Zion SaaS Enterprise"
    assert pending_item["requested_by_name"] == "Bob Miller"
    print(f"[PASS] Approvals queue contains pending request #{action_id} for Zion SaaS Enterprise.")

    # 6b. Cross-Tenant Isolation: TechNova admin cannot view or approve Acme's request
    nova_login = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@technova.com", "password": "nova123"})
    assert nova_login.status_code == 200
    nova_headers = {"Authorization": f"Bearer {nova_login.json()['access_token']}"}
    
    nova_apps = requests.get(f"{BASE_URL}/api/recovery/approvals", headers=nova_headers).json()
    assert not any(a["action_id"] == action_id for a in nova_apps), "TechNova leaked Acme's pending approval!"
    nova_approve = requests.post(f"{BASE_URL}/api/recovery/approvals/{action_id}/approve", headers=nova_headers, json={})
    assert nova_approve.status_code == 403, "TechNova unauthorized approval was not blocked!"
    print(f"[PASS] Strict Tenant Isolation Confirmed: TechNova blocked from Acme approval #{action_id} (HTTP 403).")

    # 6c. Finance Manager (Carol Danvers) approves the request
    fin_approve = requests.post(f"{BASE_URL}/api/recovery/approvals/{action_id}/approve", headers=fin_headers, json={"notes": "Approved for executive outbound payment link."})
    assert fin_approve.status_code == 200, f"Finance approval failed: {fin_approve.text}"
    print(f"[PASS] Finance Manager (Carol) approved Case #{zion_id}. Case status now APPROVED.")

    # 6d. Execute Recovery Action (allowed now that it is APPROVED)
    exec_res = requests.post(f"{BASE_URL}/api/leakage/{zion_id}/recover", headers=admin_headers, json={})
    assert exec_res.status_code == 200, f"Recovery execution failed: {exec_res.text}"
    exec_case = exec_res.json()
    assert exec_case["action_status"] == "RECOVERING"
    print(f"[PASS] Bounded recovery action executed for Case #{zion_id}. Status: RECOVERING.")

    # 6e. Simulate Payment Settlement
    dash_before = requests.get(f"{BASE_URL}/api/dashboard", headers=admin_headers).json()
    recovered_before = dash_before["revenue_recovered"]
    
    settle_res = requests.post(f"{BASE_URL}/api/leakage/{zion_id}/simulate-payment", headers=admin_headers, json={})
    assert settle_res.status_code == 200
    settled_case = settle_res.json()
    assert settled_case["action_status"] == "RECOVERED"
    assert settled_case["amount_at_risk"] == 0.0
    assert settled_case["revenue_recovered"] == 580000.0
    print(f"[PASS] Simulated payment received: Case #{zion_id} marked as RECOVERED (INR 580,000.00 settled).")

    # 6f. Verify Dashboard reflects the recovered amount
    dash_after = requests.get(f"{BASE_URL}/api/dashboard", headers=admin_headers).json()
    assert dash_after["revenue_recovered"] == recovered_before + 580000.0
    print(f"[PASS] Dashboard updated from database: Revenue Recovered increased by INR 580,000.00 to INR {dash_after['revenue_recovered']:,.2f}.")

    # 6g. Audit Trail Verification
    audit_res = requests.get(f"{BASE_URL}/api/audit", headers=admin_headers)
    assert audit_res.status_code == 200
    audits = audit_res.json()
    event_types = [a["event_type"] for a in audits]
    assert "RECOVERY_APPROVAL_REQUESTED" in event_types
    assert "RECOVERY_APPROVED" in event_types
    assert "RECOVERY_ACTION_STARTED" in event_types
    assert "PAYMENT_RECOVERED" in event_types
    print(f"[PASS] Audit Trail contains complete lifecycle events: RECOVERY_APPROVAL_REQUESTED, RECOVERY_APPROVED, RECOVERY_ACTION_STARTED, PAYMENT_RECOVERED.")

    print("\n=== ALL POLICY WORKFLOW & HUMAN APPROVAL TESTS PASSED (6/6) ===")

if __name__ == "__main__":
    run_tests()
