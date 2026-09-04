import sys
import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, engine, Base
from backend.models import Organization, User, LeakageCase

client = TestClient(app)

class TestUserDrivenMultiTenantLifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Fresh clean tables
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    def test_01_verify_clean_database_start(self):
        db = SessionLocal()
        org_count = db.query(Organization).count()
        user_count = db.query(User).count()
        case_count = db.query(LeakageCase).count()
        db.close()
        
        self.assertEqual(org_count, 0, 'Database must start with 0 organizations')
        self.assertEqual(user_count, 0, 'Database must start with 0 users')
        self.assertEqual(case_count, 0, 'Database must start with 0 leakage cases')
        print('PASS: Clean database start verified.')

    def test_02_demo_accounts_endpoint_is_empty(self):
        resp = client.get('/api/auth/demo-accounts')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [], 'Demo accounts endpoint must be empty list')
        print('PASS: Demo accounts endpoint returns empty list.')

    def test_03_user_driven_registration_company_1(self):
        payload = {
            'company_name': 'Apex Technologies',
            'company_email': 'contact@apex.com',
            'admin_name': 'Geethika',
            'admin_email': 'admin@apex.com',
            'password': 'apexPass123'
        }
        resp = client.post('/api/auth/register', json=payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        
        self.assertIn('access_token', data)
        self.assertEqual(data['role'], 'ADMIN')
        self.assertEqual(data['organization_name'], 'Apex Technologies')
        self.assertEqual(data['email'], 'admin@apex.com')
        self.assertEqual(data['name'], 'Geethika')
        self.assertTrue(data['merchant_id'].startswith('MID-'), 'Auto-generated merchant_id must start with MID-')
        self.assertTrue(data['org_code'].startswith('ORG-'), 'Org code must start with ORG-')
        
        TestUserDrivenMultiTenantLifecycle.apex_token = data['access_token']
        TestUserDrivenMultiTenantLifecycle.apex_org_id = data['organization_id']
        print('PASS: Company 1 (Apex Technologies) registration succeeded with auto-generated MID.')

    def test_04_apex_initial_dashboard_is_clean_zero(self):
        headers = {'Authorization': f'Bearer {self.apex_token}'}
        resp = client.get('/api/dashboard', headers=headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        dash = resp.json()
        
        self.assertEqual(dash['money_at_risk'], 0.0, 'Money at risk must be 0 for fresh company')
        self.assertEqual(dash['revenue_recovered'], 0.0, 'Revenue recovered must be 0 for fresh company')
        self.assertEqual(dash['recovery_rate'], 0.0, 'Recovery rate must be 0 for fresh company')
        self.assertEqual(dash['active_cases_count'], 0, 'Active cases count must be 0 for fresh company')
        self.assertEqual(dash['ai_insights'], [], 'AI insights must be empty for fresh company')
        print('PASS: Clean initial dashboard state (Rs 0 risk, Rs 0 recovered, 0% rate) verified for Apex Technologies.')

    def test_05_user_driven_registration_company_2(self):
        payload = {
            'company_name': 'Vertex Logistics',
            'company_email': 'ops@vertex.com',
            'admin_name': 'Vikram Rao',
            'admin_email': 'admin@vertex.com',
            'password': 'vertexPass123'
        }
        resp = client.post('/api/auth/register', json=payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        
        self.assertNotEqual(data['organization_id'], self.apex_org_id, 'Vertex must have a distinct organization_id')
        self.assertEqual(data['organization_name'], 'Vertex Logistics')
        self.assertEqual(data['role'], 'ADMIN')
        
        TestUserDrivenMultiTenantLifecycle.vertex_token = data['access_token']
        TestUserDrivenMultiTenantLifecycle.vertex_org_id = data['organization_id']
        print('PASS: Company 2 (Vertex Logistics) registration succeeded with distinct tenant ID.')

    def test_06_vertex_initial_dashboard_is_clean_zero(self):
        headers = {'Authorization': f'Bearer {self.vertex_token}'}
        resp = client.get('/api/dashboard', headers=headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        dash = resp.json()
        
        self.assertEqual(dash['money_at_risk'], 0.0)
        self.assertEqual(dash['revenue_recovered'], 0.0)
        self.assertEqual(dash['active_cases_count'], 0)
        print('PASS: Vertex initial dashboard is completely zeroed and isolated.')

    def test_07_tenant_scoped_data_and_cross_tenant_isolation(self):
        db = SessionLocal()
        case = LeakageCase(
            organization_id=self.apex_org_id,
            leakage_type='FAILED_PAYMENT',
            amount_at_risk=75000.0,
            risk_score=85,
            recovery_probability=0.88,
            expected_recovery=66000.0,
            root_cause='Bank switch timeout during payment gateway capture',
            root_cause_confidence=0.92,
            recommended_action='SMART_RETRY',
            action_status='OPEN',
            policy_status='ALLOWED'
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        case_id = case.id
        db.close()

        # Apex dashboard now shows the case
        headers_apex = {'Authorization': f'Bearer {self.apex_token}'}
        resp_apex = client.get('/api/dashboard', headers=headers_apex)
        self.assertEqual(resp_apex.json()['money_at_risk'], 75000.0)
        self.assertEqual(resp_apex.json()['active_cases_count'], 1)

        # Vertex dashboard MUST STILL show 0
        headers_vertex = {'Authorization': f'Bearer {self.vertex_token}'}
        resp_vertex = client.get('/api/dashboard', headers=headers_vertex)
        self.assertEqual(resp_vertex.json()['money_at_risk'], 0.0)
        self.assertEqual(resp_vertex.json()['active_cases_count'], 0)

        # Vertex attempting to inspect Apex case must receive 403 Forbidden
        resp_leak_case = client.get(f'/api/leakage/{case_id}', headers=headers_vertex)
        self.assertEqual(resp_leak_case.status_code, 403, 'Cross-tenant access must return 403 Forbidden')
        print('PASS: Strict cross-tenant isolation verified (Vertex cannot view Apex cases).')

    def test_08_batch_recovery_on_empty_tenant_does_not_use_fallback(self):
        # Run batch recovery for Vertex (0 cases)
        headers_vertex = {'Authorization': f'Bearer {self.vertex_token}'}
        resp = client.post('/api/recovery/batch', headers=headers_vertex)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        
        self.assertEqual(data['amount_recovered'], 0.0, 'Batch recovery on empty tenant must recover 0.0')
        self.assertEqual(data['leakage_cases_processed'], 0, 'Must process 0 cases')
        self.assertEqual(data['automated_actions_executed'], 0, 'Must execute 0 actions')
        self.assertEqual(data['human_escalations_routed'], 0, 'Must route 0 escalations')
        print('PASS: Batch recovery executes dynamically without hardcoded fallback.')

    def test_09_user_login_and_logout(self):
        # 1. Login with correct credentials
        login_resp = client.post('/api/auth/login', json={'email': 'admin@apex.com', 'password': 'apexPass123'})
        self.assertEqual(login_resp.status_code, 200)
        token = login_resp.json()['access_token']

        # 2. Login with bad password
        bad_resp = client.post('/api/auth/login', json={'email': 'admin@apex.com', 'password': 'wrongPassword'})
        self.assertEqual(bad_resp.status_code, 401)

        # 3. Call /me
        me_resp = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()['organization_name'], 'Apex Technologies')

        # 4. Logout
        logout_resp = client.post('/api/auth/logout', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(logout_resp.status_code, 200)
        self.assertEqual(logout_resp.json()['status'], 'SUCCESS')
        print('PASS: Login, bad credential rejection, me profile, and logout verified.')

if __name__ == '__main__':
    unittest.main()
