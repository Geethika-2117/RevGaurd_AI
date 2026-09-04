import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { runRecoveryBatch, isBatchSimulating } = useRecovery();

  const navItems = [
    { name: 'Command Center', path: '/' },
    { name: 'Recovery Loop & Engine', path: '/recovery-loop' },
    { name: 'Leakage Cases & Actions', path: '/recovery-gallery' },
    { name: 'Audit Trail & Escalations', path: '/ledger' }
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center h-[120px] px-margin-mobile md:px-margin-desktop bg-surface-dim border-b border-border-low">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex flex-col select-none cursor-pointer">
            <div className="font-display text-2xl md:text-[28px] font-bold tracking-tighter text-on-surface flex items-center gap-1.5">
              <span>REVGUARD</span>
              <span className="text-primary">AI</span>
            </div>
            <div className="font-mono text-[9px] text-muted-slate font-medium tracking-[0.2em] uppercase mt-1 leading-none">
              AI-Powered Revenue Leakage Detection &amp; Recovery
            </div>
          </NavLink>
        </div>

        {/* Center Live Agent Telemetry Indicator (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 border border-border-low bg-surface px-4 py-2 select-none">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
          </span>
          <div className="flex flex-col">
            <div className="font-mono text-[10px] text-secondary font-bold tracking-wider uppercase">
              AI RECOVERY AGENT — ACTIVE
            </div>
            <div className="font-mono text-[9px] text-muted-slate">
              Monitoring payments, checkout, subscriptions &amp; receivables
            </div>
          </div>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={runRecoveryBatch}
            disabled={isBatchSimulating}
            className="hidden sm:flex btn-primary border border-primary text-primary px-6 py-3 font-label-caps text-xs uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-none items-center gap-2 bg-primary/5 hover:bg-primary hover:text-background font-bold"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            {isBatchSimulating ? "Running Batch Analysis..." : "RUN RECOVERY BATCH"}
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden text-on-surface hover:text-primary transition-colors focus:outline-none p-2 border border-border-low"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl select-none">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-surface-dim/98 backdrop-blur-md md:hidden pt-[130px] px-margin-mobile flex flex-col justify-between pb-12 animate-fadeInUp">
          <div className="flex flex-col gap-6">
            <div className="border border-border-low bg-surface p-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono text-[10px] text-secondary font-bold">AI RECOVERY AGENT: ACTIVE</span>
            </div>

            <nav className="flex flex-col gap-4">
              {navItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-display font-semibold tracking-wide text-on-surface hover:text-primary transition-colors flex items-center justify-between border-b border-border-low/40 pb-3"
                >
                  <span>{item.name}</span>
                  <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                runRecoveryBatch();
              }}
              disabled={isBatchSimulating}
              className="btn-primary border border-primary text-primary py-4 font-label-caps text-xs uppercase transition-all duration-300 w-full rounded-none flex items-center justify-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              {isBatchSimulating ? "Running Batch Analysis..." : "RUN RECOVERY BATCH"}
            </button>
            <div className="text-center font-mono text-[9px] text-muted-slate tracking-widest uppercase">
              REVGUARD AI — ZERO REVENUE LEAKAGE
            </div>
          </div>
        </div>
      )}
    </>
  );
}
