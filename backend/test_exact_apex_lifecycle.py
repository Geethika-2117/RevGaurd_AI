import sys
import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, engine, Base
from backend.models import Organization, User, LeakageCase
from backend.auth import verify_password, get_password_hash

client = TestClient(app)

class TestExactApexAuthenticationLifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    def test_01_verify_clean_start(self):
        db = SessionLocal()
        org_count = db.query(Organization).count()
        user_count = db.query(User).count()
        db.close()
        self.assertEqual(org_count, 0)
        self.assertEqual(user_count, 0)
        print('PASS: Database starts clean (0 orgs, 0 users).')

    def test_02_register_exact_account(self):
        payload = {
            'company_name': 'Apex Technologies',
            'admin_name': 'Apex Admin',
            'email': 'apex@admin.com',
            'password': 'apex@123'
        }
        resp = client.post('/api/auth/register', json=payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data['email'], 'apex@admin.com')
        self.assertEqual(data['name'], 'Apex Admin')
        self.assertEqual(data['role'], 'ADMIN')
        self.assertEqual(data['organization_name'], 'Apex Technologies')
        self.assertTrue(data['merchant_id'].startswith('MID-'))
        self.assertIn('access_token', data)

        # Verify directly in SQLite database
        db = SessionLocal()
        user = db.query(User).filter(User.email == 'apex@admin.com').first()
        self.assertIsNotNone(user, 'User apex@admin.com MUST exist in database')
        self.assertEqual(user.email, 'apex@admin.com')
        self.assertEqual(user.role, 'ADMIN')
        self.assertNotEqual(user.password_hash, 'apex@123', 'Password MUST NOT be plaintext')
        self.assertTrue(verify_password('apex@123', user.password_hash), 'Password hash must verify with apex@123')
        
        org = db.query(Organization).filter(Organization.id == user.organization_id).first()
        self.assertIsNotNone(org, 'Organization MUST exist in database')
        self.assertEqual(org.name, 'Apex Technologies')
        db.close()
        print('PASS: Registration persisted User (apex@admin.com, ADMIN) and Organization (Apex Technologies) with secure hash.')

    def test_03_login_exact_account(self):
        login_payload = {
            'email': 'apex@admin.com',
            'password': 'apex@123'
        }
        resp = client.post('/api/auth/login', json=login_payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data['email'], 'apex@admin.com')
        self.assertEqual(data['role'], 'ADMIN')
        self.assertEqual(data['organization_name'], 'Apex Technologies')
        token = data['access_token']
        TestExactApexAuthenticationLifecycle.apex_token = token
        print('PASS: Login with apex@admin.com and apex@123 returned HTTP 200 + valid token.')

    def test_04_get_me_profile(self):
        headers = {'Authorization': f'Bearer {self.apex_token}'}
        resp = client.get('/api/auth/me', headers=headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data['email'], 'apex@admin.com')
        self.assertEqual(data['role'], 'ADMIN')
        self.assertEqual(data['organization_name'], 'Apex Technologies')
        print('PASS: GET /api/auth/me returned correct profile for apex@admin.com.')

    def test_05_dashboard_shows_zero_for_apex(self):
        headers = {'Authorization': f'Bearer {self.apex_token}'}
        resp = client.get('/api/dashboard', headers=headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertEqual(data['money_at_risk'], 0.0)
        self.assertEqual(data['revenue_recovered'], 0.0)
        self.assertEqual(data['recovery_rate'], 0.0)
        self.assertEqual(data['active_cases_count'], 0)
        self.assertEqual(data['organization_name'], 'Apex Technologies')
        print('PASS: Dashboard shows Rs 0 money at risk, Rs 0 recovered, 0% rate for Apex Technologies.')

    def test_06_wrong_password_returns_401_not_500(self):
        login_payload = {
            'email': 'apex@admin.com',
            'password': 'wrongpassword'
        }
        resp = client.post('/api/auth/login', json=login_payload)
        self.assertEqual(resp.status_code, 401, 'Wrong password must return 401')
        self.assertEqual(resp.json()['detail'], 'Incorrect email or password.')
        print('PASS: Wrong password returned HTTP 401 (not 500).')

    def test_07_logout(self):
        headers = {'Authorization': f'Bearer {self.apex_token}'}
        resp = client.post('/api/auth/logout', headers=headers)
        self.assertEqual(resp.status_code, 200, resp.text)
        print('PASS: Logout succeeded.')

    def test_08_multi_tenant_isolation_with_beta_solutions(self):
        # Register Beta Solutions
        payload_b = {
            'company_name': 'Beta Solutions',
            'admin_name': 'Beta Admin',
            'email': 'beta@admin.com',
            'password': 'beta@123'
        }
        resp_b = client.post('/api/auth/register', json=payload_b)
        self.assertEqual(resp_b.status_code, 200, resp_b.text)
        token_b = resp_b.json()['access_token']

        # Add leakage case for Apex
        db = SessionLocal()
        user_apex = db.query(User).filter(User.email == 'apex@admin.com').first()
        case = LeakageCase(
            organization_id=user_apex.organization_id,
            leakage_type='FAILED_PAYMENT',
            amount_at_risk=45000.0,
            risk_score=75,
            recovery_probability=0.85,
            expected_recovery=38250.0,
            root_cause='Insufficient funds on recurring charge',
            action_status='OPEN',
            policy_status='ALLOWED'
        )
        db.add(case)
        db.commit()
        case_id = case.id
        db.close()

        # Apex sees 45000
        headers_a = {'Authorization': f'Bearer {self.apex_token}'}
        dash_a = client.get('/api/dashboard', headers=headers_a).json()
        self.assertEqual(dash_a['money_at_risk'], 45000.0)

        # Beta MUST see 0
        headers_b = {'Authorization': f'Bearer {token_b}'}
        dash_b = client.get('/api/dashboard', headers=headers_b).json()
        self.assertEqual(dash_b['money_at_risk'], 0.0)

        # Beta cannot access Apex case
        cross_resp = client.get(f'/api/leakage/{case_id}', headers=headers_b)
        self.assertEqual(cross_resp.status_code, 403)
        print('PASS: Multi-tenant isolation verified between Apex Technologies and Beta Solutions.')

if __name__ == '__main__':
    unittest.main()
