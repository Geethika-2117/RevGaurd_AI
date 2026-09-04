import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Settings() {
  const { user } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('company');
  const [companySettings, setCompanySettings] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Isolation test state
  const [testingIsolation, setTestingIsolation] = useState(false);
  const [isolationResult, setIsolationResult] = useState(null);

  // Handle URL query parameter e.g. /settings?tab=users
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['company', 'users', 'security', 'policies'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    async function loadSettingsData() {
      setLoading(true);
      try {
        const [comp, users] = await Promise.all([
          api.get('/api/settings/company'),
          api.get('/api/settings/users')
        ]);
        setCompanySettings(comp);
        setUsersList(users);
      } catch (err) {
        console.error("Failed to load settings data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettingsData();
  }, [user]);

  const policies = [
    {
      name: "Maximum Payment Retries",
      description: "AI will never retry a failed payment more than 2 times in a 24-hour window.",
      value: "2 RETRIES / 24H"
    },
    {
      name: "Maximum Payment Reminders",
      description: "Never send more than 2 polite reminders per invoice to prevent customer fatigue.",
      value: "MAX 2 REMINDERS"
    },
    {
      name: "Maximum Automated Contacts",
      description: "Halt all automated communication after 3 outreach touchpoints without response.",
      value: "3 CONTACTS"
    },
    {
      name: "High-Value Human Review",
      description: "Any exposure or invoice above ₹5,00,000 mandates explicit human manager authorization.",
      value: "ABOVE ₹5,00,000"
    },
    {
      name: "Instant Workflow Cancellation",
      description: "Immediately halts all automated contact if customer pays, opts out, or initiates dispute.",
      value: "IMMEDIATE STOP"
    }
  ];

  const handleTestIsolation = async () => {
    setTestingIsolation(true);
    setIsolationResult(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await api.post('/api/security/test-isolation', {});
      setIsolationResult(res);
    } catch (err) {
      setIsolationResult({
        error: true,
        message: err.message
      });
    } finally {
      setTestingIsolation(false);
    }
  };

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto space-y-8 animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="border-b border-border-low pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
            WORKSPACE SETTINGS &bull; {user?.organization_name}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Settings &amp; Governance
          </h1>
          <p className="text-muted-slate text-sm mt-1">
            Manage organization identity, user access, security controls, and recovery guardrails.
          </p>
        </div>

        <div className="font-mono text-xs text-muted-slate bg-surface border border-border-low px-3 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>ROLE: {user?.role || "ADMIN"}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border-low pb-2 font-mono text-xs">
        {[
          { id: 'company', label: 'Company Profile', icon: 'business' },
          { id: 'users', label: 'User Management', icon: 'group' },
          { id: 'security', label: 'Security Controls', icon: 'security' },
          { id: 'policies', label: 'Recovery Policies', icon: 'policy' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-background border-primary font-bold'
                : 'bg-surface text-muted-slate border-border-low hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: COMPANY SETTINGS */}
      {activeTab === 'company' && (
        <div className="border border-border-low bg-surface p-6 md:p-8 space-y-6">
          <div className="border-b border-border-low pb-4">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Company Information
            </h2>
            <p className="font-mono text-xs text-muted-slate mt-1">
              Authoritative organization identity registered with RevGuard AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="space-y-1.5">
              <span className="text-muted-slate uppercase font-bold">Company Name</span>
              <div className="p-3 bg-surface-container-lowest border border-border-low text-on-surface font-bold text-sm">
                {companySettings?.name || user?.organization_name}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-muted-slate uppercase font-bold">Merchant / Business ID</span>
              <div className="p-3 bg-surface-container-lowest border border-border-low text-on-surface font-bold text-sm">
                {companySettings?.merchant_id || user?.merchant_id}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-primary uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Organization ID (Read-Only)</span>
              </span>
              <div className="p-3 bg-surface-container-lowest border border-border-low text-primary font-bold text-sm flex items-center justify-between">
                <span>{companySettings?.org_code || user?.org_code || `ORG-${user?.organization_id}`}</span>
                <span className="text-[10px] text-muted-slate uppercase">IMMUTABLE TENANT ID</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-muted-slate uppercase font-bold">Admin Email</span>
              <div className="p-3 bg-surface-container-lowest border border-border-low text-on-surface font-bold text-sm">
                {companySettings?.admin_email || user?.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="border border-border-low bg-surface p-6 md:p-8 space-y-6">
          <div className="border-b border-border-low pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface">
                User Management
              </h2>
              <p className="font-mono text-xs text-muted-slate mt-1">
                Authorized team members for {user?.organization_name}.
              </p>
            </div>
            <span className="font-mono text-xs text-secondary bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 font-bold">
              {usersList.length} Active Users
            </span>
          </div>

          <div className="border border-border-low bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-low text-muted-slate uppercase text-[11px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-low">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-surface transition-colors">
                    <td className="py-3 px-4 text-on-surface font-bold">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-muted-slate">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 border border-primary/40 text-primary text-[10px] font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-mono text-muted-slate">
            * Cross-tenant access protection active: Users outside {user?.organization_name} are strictly hidden.
          </p>
        </div>
      )}

      {/* TAB 3: SECURITY CONTROLS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="border border-border-low bg-surface p-6 md:p-8 space-y-6">
            <div className="border-b border-border-low pb-4">
              <h2 className="font-display text-xl font-bold text-on-surface">
                Workspace Security Controls
              </h2>
              <p className="font-mono text-xs text-muted-slate mt-1">
                Security controls enabled for this workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {[
                { name: "Authentication", desc: "JWT-based session authentication with salted cryptographic hashing." },
                { name: "Tenant Data Isolation", desc: "Cryptographic organization scoping on all relational tables & files." },
                { name: "Audit Logging", desc: "Immutable event recording with actor roles and timestamps." },
                { name: "Session Security", desc: "Automatic 24-hour expiration with immediate client-side token wipe." },
                { name: "Payment Data Protection", desc: "Isolated document vault with SHA-256 integrity verification." }
              ].map((ctrl, i) => (
                <div key={i} className="p-4 border border-border-low bg-surface-container-lowest flex items-start gap-3">
                  <span className="text-secondary text-base font-bold">✓</span>
                  <div>
                    <div className="font-bold text-on-surface flex items-center gap-2">
                      <span>{ctrl.name}</span>
                      <span className="text-[10px] text-secondary font-semibold">Enabled</span>
                    </div>
                    <p className="text-muted-slate text-[11px] mt-1 leading-relaxed">
                      {ctrl.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Cross-Tenant Isolation Security Test Tool */}
          <div className="border border-border-low bg-surface p-6 md:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-low pb-4">
              <div>
                <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
                  SECURITY AUDIT TOOL
                </div>
                <h2 className="font-display text-lg font-bold text-on-surface uppercase">
                  Cross-Tenant Data Isolation Test
                </h2>
                <p className="text-xs text-muted-slate font-mono mt-0.5">
                  Probe cross-tenant boundary to prove that {user?.organization_name} cannot access foreign company records.
                </p>
              </div>

              <button
                onClick={handleTestIsolation}
                disabled={testingIsolation}
                className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-4 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">security</span>
                <span>{testingIsolation ? "PROBING..." : "PROBE DATA ISOLATION"}</span>
              </button>
            </div>

            {isolationResult && (
              <div className="p-4 bg-surface-container-lowest border border-emerald-500/40 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-secondary font-bold text-sm border-b border-border-low pb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <span>{isolationResult.security_verdict}</span>
                  </span>
                  <span>HTTP {isolationResult.http_status_code}</span>
                </div>
                <div className="text-on-surface leading-relaxed pt-1">
                  {isolationResult.explanation}
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-slate text-[11px] pt-2 border-t border-border-low/40">
                  <div>Authenticated: <span className="text-on-surface">{isolationResult.authenticated_organization}</span></div>
                  <div>Targeted Foreign Org: <span className="text-primary">{isolationResult.target_foreign_organization}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RECOVERY POLICIES */}
      {activeTab === 'policies' && (
        <div className="border border-border-low bg-surface p-6 md:p-8 divide-y divide-border-low/40">
          <div className="pb-4">
            <h2 className="font-display text-xl font-bold text-on-surface uppercase">
              Deterministic Safety Policies
            </h2>
            <p className="font-mono text-xs text-muted-slate mt-1">
              RevGuard AI operates boundedly under these strict rules.
            </p>
          </div>

          {policies.map((rule, idx) => (
            <div key={idx} className="py-5 first:pt-4 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-sans font-bold text-base text-on-surface mb-0.5">
                  {rule.name}
                </h3>
                <p className="text-xs text-muted-slate max-w-lg">
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs font-bold text-primary border border-border-low bg-surface-container-lowest px-3 py-1.5">
                  {rule.value}
                </span>
                <span className="text-secondary font-mono text-xs font-bold">
                  ENFORCED ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
