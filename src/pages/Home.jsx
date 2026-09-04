import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    dashboard,
    runAiRecovery,
    isSimulating,
    refreshData
  } = useRecovery();

  const formatAmountLakhs = (amt) => {
    if (!amt && amt !== 0) return "₹0";
    if (amt === 0) return "₹0";
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(1)}L`;
    }
    return `₹${amt.toLocaleString()}`;
  };

  const moneyAtRisk = dashboard?.money_at_risk || 0;
  const revenueRecovered = dashboard?.revenue_recovered || 0;
  const recoveryRate = dashboard?.recovery_rate || 0;
  const categories = dashboard?.categories || [];
  const aiInsights = dashboard?.ai_insights || [];
  const activeCasesCount = dashboard?.active_cases_count || 0;
  const totalEventsChecked = dashboard?.total_events_checked || 0;

  const isBrandNewWorkspace = (moneyAtRisk === 0 && revenueRecovered === 0 && activeCasesCount === 0);

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto space-y-10 animate-fadeInUp select-none">
      
      {/* 1. Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-border-low pb-4">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
            EXECUTIVE DASHBOARD &bull; {user?.organization_name || "COMPANY"}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Revenue Overview
          </h1>
          <p className="text-muted-slate text-sm mt-1">
            "Find revenue that's slipping away, understand why, and recover it."
          </p>
        </div>

        <div className="font-mono text-xs text-muted-slate bg-surface border border-border-low px-3 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>MID: {user?.merchant_id || "ACTIVE"}</span>
        </div>
      </div>

      {/* Brand New Company: NO REVENUE DATA HAS BEEN ADDED YET Banner */}
      {isBrandNewWorkspace && (
        <section className="border-2 border-primary/60 bg-surface p-8 text-center space-y-4 shadow-[0_0_30px_rgba(242,202,80,0.1)]">
          <div className="flex justify-center">
            <span className="w-12 h-12 rounded-full border border-primary/40 bg-surface-container-lowest flex items-center justify-center text-primary text-2xl material-symbols-outlined">
              dataset
            </span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface uppercase tracking-tight">
              No revenue data has been added yet.
            </h2>
            <p className="text-muted-slate font-mono text-xs max-w-md mx-auto mt-1 leading-relaxed">
              Upload invoice, payment, or subscription data to start detecting revenue leakage.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/data-sources')}
              className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-2.5 font-mono text-xs font-bold uppercase transition-all"
            >
              ADD DATA &rarr;
            </button>
            <button
              onClick={() => navigate('/data-sources')}
              className="border border-border-low hover:border-primary bg-surface-container-lowest text-on-surface hover:text-primary px-6 py-2.5 font-mono text-xs font-bold uppercase transition-all"
            >
              UPLOAD PAYMENT DATA
            </button>
          </div>
        </section>
      )}

      {/* 2. ONE Dominant Hero Metric */}
      <section className="border-2 border-primary bg-surface p-8 md:p-12 relative shadow-[0_0_40px_rgba(242,202,80,0.06)]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase block mb-2">
              MONEY AT RISK
            </span>
            <div className="font-metric text-5xl md:text-7xl font-bold text-on-surface tracking-tight">
              {formatAmountLakhs(moneyAtRisk)}
            </div>
            <p className="text-muted-slate text-sm md:text-base mt-2">
              Revenue currently at risk across failed payments, overdue invoices, and checkout drop-offs for {user?.organization_name}.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/leakage')}
              className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-3.5 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
            >
              FIND LEAKAGE &rarr;
            </button>
            <button 
              onClick={() => navigate('/verify')}
              className="btn-primary border border-border-low bg-surface-container-lowest hover:border-primary text-on-surface hover:text-primary px-6 py-3.5 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              VERIFY A PAYMENT
            </button>
            <button 
              onClick={runAiRecovery}
              disabled={isSimulating || moneyAtRisk === 0}
              className="btn-primary border border-border-low bg-surface-container-lowest hover:border-primary text-on-surface hover:text-primary px-6 py-3.5 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              {isSimulating ? "RUNNING..." : "RUN AI RECOVERY"}
            </button>
          </div>
        </div>

        {/* Recovery Summary (Only 2 Secondary Metrics Below) */}
        <div className="mt-8 pt-8 border-t border-border-low/60 grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
          <div className="flex items-center gap-4">
            <div className="p-3 border border-border-low bg-surface-container-lowest">
              <span className="material-symbols-outlined text-secondary text-2xl">check_circle</span>
            </div>
            <div>
              <div className="text-muted-slate text-xs uppercase font-bold">REVENUE RECOVERED</div>
              <div className="font-metric text-2xl font-bold text-secondary">
                {formatAmountLakhs(revenueRecovered)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 border border-border-low bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-2xl">percent</span>
            </div>
            <div>
              <div className="text-muted-slate text-xs uppercase font-bold">RECOVERY RATE</div>
              <div className="font-metric text-2xl font-bold text-on-surface">
                {recoveryRate}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Where is Money Leaking? (Dynamic Category Breakdown) */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface uppercase">
              Where is Money Leaking?
            </h2>
            <p className="text-xs text-muted-slate font-mono mt-0.5">
              Live category exposure calculated from {user?.organization_name}'s database.
            </p>
          </div>
          <button 
            onClick={() => navigate('/leakage')}
            className="text-xs font-mono text-primary hover:underline"
          >
            View all cases &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div 
              key={cat.key}
              onClick={() => navigate(`/leakage?type=${cat.key}`)}
              className="border border-border-low bg-surface p-5 hover:border-primary cursor-pointer transition-all group"
            >
              <span className="font-mono text-xs text-muted-slate block uppercase font-bold group-hover:text-primary transition-colors">
                {cat.title}
              </span>
              <div className="font-metric text-3xl font-bold text-primary my-2">
                {formatAmountLakhs(cat.amount_at_risk)}
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-muted-slate border-t border-border-low/40 pt-2 mt-2">
                <span>{cat.case_count} cases</span>
                <span className="text-on-surface font-semibold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. What Did AI Find? (Dynamic AI Insights) */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-on-surface uppercase">
            What Did AI Find?
          </h2>
          <p className="text-xs text-muted-slate font-mono mt-0.5">
            Key revenue leaks spotted by automated scans across company records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.length === 0 ? (
            <div className="col-span-2 p-6 border border-border-low bg-surface text-muted-slate font-mono text-xs">
              No revenue anomalies or leaks detected. Workspace revenue health is optimal.
            </div>
          ) : (
            aiInsights.map(insight => (
              <div 
                key={insight.id}
                className="border border-border-low bg-surface p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-sans font-bold text-base text-on-surface mb-1">
                    {insight.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-slate leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t border-border-low/40 mt-4">
                  <button 
                    onClick={() => navigate('/leakage')}
                    className="btn-primary border border-primary text-primary hover:bg-primary hover:text-background px-4 py-2 font-mono text-xs font-bold uppercase transition-all"
                  >
                    INVESTIGATE &rarr;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Simple AI Agent Status */}
      <section className="border border-border-low bg-surface p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border-low pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">
                REVGUARD AGENT &bull; ACTIVE &bull; {user?.organization_name}
              </span>
            </div>
            <p className="text-sm text-muted-slate">
              "Continuously monitoring payment gateways and clearing ledgers for leakage."
            </p>
          </div>

          <button 
            onClick={() => navigate('/activity')}
            className="text-xs font-mono text-primary hover:underline"
          >
            View live activity stream &rarr;
          </button>
        </div>

        {/* Text Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono">
          <div>
            <span className="text-xs text-muted-slate uppercase block">EVENTS CHECKED</span>
            <div className="font-metric text-2xl font-bold text-on-surface mt-0.5">
              {totalEventsChecked.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-slate uppercase block">ACTIVE LEAKAGE</span>
            <div className="font-metric text-2xl font-bold text-primary mt-0.5">
              {activeCasesCount} Cases
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-slate uppercase block">AUTONOMOUS STATUS</span>
            <div className="font-metric text-2xl font-bold text-on-surface mt-0.5">
              GUARDED
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-slate uppercase block">MONEY RECOVERED</span>
            <div className="font-metric text-2xl font-bold text-secondary mt-0.5">
              {formatAmountLakhs(revenueRecovered)}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
