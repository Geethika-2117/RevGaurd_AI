import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import { useAuth } from '../context/AuthContext';
import SimpleCaseModal from './SimpleCaseModal';
import SimpleRecoveryModal from './SimpleRecoveryModal';

export default function AppShell({ children }) {
  const { runAiRecovery, isSimulating, pendingApprovals } = useRecovery();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Dynamic Browser Tab Title
  React.useEffect(() => {
    const titles = {
      '/': 'Revenue Overview',
      '/dashboard': 'Revenue Overview',
      '/verify': 'Payment Verification',
      '/payment-verification': 'Payment Verification',
      '/leakage': 'Find Revenue Leakage',
      '/approvals': 'Finance Approvals',
      '/recovery': 'Recovered Revenue',
      '/activity': 'AI Activity',
      '/audit': 'Audit Trail',
      '/data-sources': 'Data Sources',
      '/settings': 'Settings'
    };
    document.title = `RevGuard AI — ${titles[location.pathname] || 'Revenue Intelligence'}`;
  }, [location]);

  const navLinks = [
    {
      group: "HOME",
      items: [
        { name: "Overview", path: "/", icon: "home" }
      ]
    },
    {
      group: "VERIFICATION",
      items: [
        { name: "Verify Payment", path: "/verify", icon: "verified" }
      ]
    },
    {
      group: "REVENUE",
      items: [
        { name: "Find Leakage", path: "/leakage", icon: "search" },
        { name: "Approvals", path: "/approvals", icon: "gavel", badge: pendingApprovals?.length || 0 },
        { name: "Recovery", path: "/recovery", icon: "payments" }
      ]
    },
    {
      group: "INTELLIGENCE",
      items: [
        { name: "AI Activity", path: "/activity", icon: "history" },
        { name: "Audit Trail", path: "/audit", icon: "policy" },
        { name: "Data Sources", path: "/data-sources", icon: "cloud_sync" }
      ]
    },
    {
      group: "GOVERNANCE",
      items: [
        { name: "Settings & Safety", path: "/settings", icon: "settings" }
      ]
    }
  ];

  const isLinkActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname === path;
  };

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans relative select-none">
      
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center h-[70px] px-6 md:px-10 bg-surface border-b border-border-low">
        
        {/* Left: Platform Branding */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface p-1 border border-border-low"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <NavLink to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="font-display text-2xl font-bold tracking-tight text-on-surface flex items-center gap-1.5">
              <span>REVGUARD</span>
              <span className="text-primary">AI</span>
            </div>
            <span className="text-muted-slate text-xs font-mono hidden sm:inline ml-2 border-l border-border-low pl-3">
              Revenue Leakage Detection &amp; Recovery
            </span>
          </NavLink>
        </div>

        {/* Right Header Status, Unobtrusive Account Menu, & Action */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Top-Right Company & User Identity Button */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2.5 border border-border-low hover:border-primary px-3.5 py-2 bg-surface-container-lowest font-mono text-xs text-left transition-colors"
              aria-expanded={accountMenuOpen}
              aria-label="User Account Menu"
            >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <div className="text-left">
                <span className="text-on-surface font-bold truncate max-w-[140px] block">
                  {user?.organization_name || "Company"}
                </span>
                <span className="text-[10px] text-muted-slate truncate max-w-[140px] block">
                  {user?.email || "user@company.com"}
                </span>
              </div>
              <span className="material-symbols-outlined text-sm text-muted-slate ml-1">
                arrow_drop_down
              </span>
            </button>

            {/* Spec-Compliant Account & Logout Dropdown */}
            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-surface border border-border-low shadow-2xl p-3 z-50 font-mono text-xs animate-fadeInUp">
                
                {/* User & Company Identity Box */}
                <div className="border-b border-border-low pb-3 mb-2">
                  <div className="font-bold text-sm text-on-surface truncate">
                    {user?.organization_name || "Company"}
                  </div>
                  <div className="text-xs text-muted-slate truncate">
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 border border-primary/40 text-primary text-[10px] font-bold">
                      {user?.role || "ADMIN"}
                    </span>
                    <span className="text-[10px] text-muted-slate">
                      {user?.org_code || `ORG-${user?.organization_id}`}
                    </span>
                  </div>
                </div>

                {/* Account Navigation Shortcuts */}
                <div className="space-y-1 border-b border-border-low pb-2 mb-2">
                  <button
                    onClick={() => { setAccountMenuOpen(false); navigate('/settings?tab=company'); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-surface-container-lowest text-muted-slate hover:text-on-surface transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">business</span>
                    <span>Company Profile</span>
                  </button>
                  <button
                    onClick={() => { setAccountMenuOpen(false); navigate('/settings?tab=users'); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-surface-container-lowest text-muted-slate hover:text-on-surface transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>User Management</span>
                  </button>
                  <button
                    onClick={() => { setAccountMenuOpen(false); navigate('/settings?tab=security'); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-surface-container-lowest text-muted-slate hover:text-on-surface transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">security</span>
                    <span>Security Controls</span>
                  </button>
                </div>

                {/* Unobtrusive Logout Button */}
                <div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2 hover:bg-red-500/10 text-red-400 font-bold transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>LOG OUT</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* AI Agent Status Beacon */}
          <div className="hidden lg:flex items-center gap-2 border border-border-low px-3 py-2 bg-surface-container-lowest font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-secondary font-bold">ACTIVE</span>
            <span className="text-muted-slate">&bull; Monitoring</span>
          </div>

          {/* Primary Action Button */}
          <button 
            onClick={runAiRecovery}
            disabled={isSimulating}
            className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-4 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(242,202,80,0.15)]"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>{isSimulating ? "WORKING..." : "RUN AI RECOVERY"}</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 pt-[70px]">
        
        {/* Minimal Left Sidebar */}
        <aside className={`fixed left-0 top-[70px] bottom-0 w-[240px] bg-surface border-r border-border-low z-40 overflow-y-auto transition-transform md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:flex md:flex-col justify-between p-5`}>
          
          <div className="space-y-6">
            {navLinks.map((grp, i) => (
              <div key={i}>
                <div className="font-mono text-[10px] text-muted-slate font-bold tracking-wider uppercase mb-2 px-3">
                  {grp.group}
                </div>
                <nav className="space-y-1">
                  {grp.items.map(item => {
                    const active = isLinkActive(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all ${
                          active 
                            ? 'text-primary bg-surface-container-lowest border-l-2 border-primary font-bold' 
                            : 'text-muted-slate hover:text-on-surface hover:bg-surface-container-lowest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-background font-mono leading-none">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="border-t border-border-low pt-4 font-mono text-xs text-muted-slate space-y-1.5">
            <div className="text-[11px] text-on-surface font-bold truncate">
              {user?.name || "Admin"}
            </div>
            <div className="text-[10px] text-muted-slate">
              {user?.org_code || `ORG-${user?.organization_id}`} &bull; {user?.role}
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] text-red-400 hover:underline block pt-1 font-bold"
            >
              Sign out &rarr;
            </button>
          </div>
        </aside>

        {/* Main Viewport Content */}
        <main className="flex-1 md:ml-[240px] flex flex-col min-h-[calc(100vh-70px)] w-full overflow-y-auto">
          <div className="flex-grow">
            {children}
          </div>

          {/* Clean Enterprise Footer */}
          <footer className="py-6 px-6 md:px-12 border-t border-border-low text-muted-slate text-xs font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              &copy; 2026 REVGUARD AI &bull; MULTI-TENANT REVENUE INTELLIGENCE
            </div>
            <div>
              Tenant Isolation Verified &bull; Authoritative 7-Point Clearing
            </div>
          </footer>
        </main>
      </div>

      {/* Global Modals */}
      <SimpleCaseModal />
      <SimpleRecoveryModal />

    </div>
  );
}
