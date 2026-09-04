import uuid
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_full_onboarding_lifecycle():
    print("=== Testing Complete Registration & Onboarding Lifecycle ===")
    
    unique_suffix = uuid.uuid4().hex[:6].upper()
    comp_name = f"Nexus Aero {unique_suffix}"
    mid = f"MID-NEXUS-{unique_suffix}"
    admin_email = f"jennifer_{unique_suffix.lower()}@nexusaero.demo"

    # 1. Register a brand new company
    reg_payload = {
        "company_name": comp_name,
        "merchant_id": mid,
        "business_email": f"finance_{unique_suffix.lower()}@nexusaero.demo",
        "admin_name": "Dr. Jennifer Vance",
        "admin_email": admin_email,
        "password": "nexusStrongPassword123"
    }
    
    res = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()
    token = data["access_token"]
    org_code = data["org_code"]
    print(f"[OK] Registered company '{comp_name}' with code: {org_code}")
    print(f"     Admin User: {data['name']} ({data['email']}), Role: {data['role']}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Check initial Dashboard state (Should be INR 0 at risk and 0 cases)
    dash_res = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    assert dash_res.status_code == 200, f"Dashboard failed: {dash_res.text}"
    dash_data = dash_res.json()
    assert dash_data["money_at_risk"] == 0, f"Expected 0 at risk, got {dash_data['money_at_risk']}"
    assert dash_data["revenue_recovered"] == 0, f"Expected 0 recovered, got {dash_data['revenue_recovered']}"
    assert dash_data["active_cases_count"] == 0, f"Expected 0 cases, got {dash_data['active_cases_count']}"
    print("[OK] Verified INR 0 at risk and 0 cases for fresh organization (Zero-Data state).")
    
    # 3. Check Company Settings
    sett_res = requests.get(f"{BASE_URL}/api/settings/company", headers=headers)
    assert sett_res.status_code == 200, f"Settings failed: {sett_res.text}"
    sett_data = sett_res.json()
    assert sett_data["name"] == comp_name
    assert sett_data["merchant_id"] == mid
    assert sett_data["admin_email"] == admin_email
    print(f"[OK] Company Profile Settings verified: {sett_data['name']}, MID: {sett_data['merchant_id']}")
    
    # 4. Check Tenant Users list (Must only return Dr. Jennifer Vance)
    users_res = requests.get(f"{BASE_URL}/api/settings/users", headers=headers)
    assert users_res.status_code == 200, f"Users failed: {users_res.text}"
    users_data = users_res.json()
    assert len(users_data) == 1, f"Expected 1 user, got {len(users_data)}"
    assert users_data[0]["email"] == admin_email
    assert users_data[0]["role"] == "ADMIN"
    print(f"[OK] User Management verified: 1 user strictly isolated to tenant ({users_data[0]['email']}).")
    
    # 5. Trigger [ USE DEMO DATA ] for this isolated company
    seed_res = requests.post(f"{BASE_URL}/api/data-sources/seed-demo", headers=headers, json={})
    assert seed_res.status_code == 200, f"Seed failed: {seed_res.text}"
    seed_data = seed_res.json()
    assert seed_data["status"] == "SUCCESS"
    print(f"[OK] Demo data generated: INR {seed_data['money_at_risk']:,.2f} at risk.")
    
    # 6. Re-verify Dashboard has populated data
    dash_res2 = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    assert dash_res2.status_code == 200
    dash_data2 = dash_res2.json()
    assert dash_data2["money_at_risk"] == 1700000.0, f"Expected 1700000.0, got {dash_data2['money_at_risk']}"
    assert dash_data2["revenue_recovered"] == 150000.0
    assert dash_data2["active_cases_count"] == 4
    print(f"[OK] Dashboard populated with isolated demo data: INR {dash_data2['money_at_risk']:,.2f} at risk, 4 active cases.")
    
    # 7. Test Security Isolation Probe
    iso_res = requests.post(f"{BASE_URL}/api/security/test-isolation", headers=headers, json={})
    assert iso_res.status_code == 200
    iso_data = iso_res.json()
    assert iso_data["cross_tenant_access_blocked"] == True
    assert iso_data["http_status_code"] == 403
    print(f"[OK] Live Security Isolation Probe passed: {iso_data['security_verdict']} (HTTP 403).")
    
    # 8. Test Logout
    logout_res = requests.post(f"{BASE_URL}/api/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    print("[OK] Logout endpoint executed successfully and audit logged.")
    
    # 9. Verify Audit Trail contains registration, demo seed, and logout events
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": admin_email,
        "password": "nexusStrongPassword123"
    })
    assert login_res.status_code == 200
    new_token = login_res.json()["access_token"]
    audit_res = requests.get(f"{BASE_URL}/api/audit", headers={"Authorization": f"Bearer {new_token}"})
    assert audit_res.status_code == 200
    audits = audit_res.json()
    event_types = [a["event_type"] for a in audits]
    assert "COMPANY_REGISTERED" in event_types, f"COMPANY_REGISTERED not in {event_types}"
    assert "DEMO_DATA_INITIALIZED" in event_types, f"DEMO_DATA_INITIALIZED not in {event_types}"
    assert "LOGOUT" in event_types, f"LOGOUT not in {event_types}"
    assert "LOGIN" in event_types, f"LOGIN not in {event_types}"
    print(f"[OK] Audit Trail verified with all events: {event_types}")

    print("\n=== ALL REGISTRATION & ONBOARDING LIFECYCLE TESTS PASSED! ===")

if __name__ == "__main__":
    test_full_onboarding_lifecycle()
