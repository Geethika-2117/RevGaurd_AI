import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    revenueAtRisk, 
    revenueRecovered, 
    recoveryRate, 
    activeCasesCount, 
    expectedRecovery, 
    humanEscalationsCount,
    categories,
    agentActivity,
    topOpportunities,
    interventionPerformance,
    runRecoveryBatch,
    isBatchSimulating
  } = useRecovery();

  const decisionEngineSteps = [
    { step: "01", name: "INPUT", desc: "Failed Payment / Overdue Invoice / Abandoned Cart" },
    { step: "02", name: "DIAGNOSIS", desc: "Root Cause Categorization & Telemetry" },
    { step: "03", name: "RISK", desc: "Dynamic Risk Score (1-100)" },
    { step: "04", name: "PROBABILITY", desc: "Recovery Success % Calculation" },
    { step: "05", name: "EXPECTED YIELD", desc: "Risk Amount × Recovery Probability" },
    { step: "06", name: "ACTION RECOMMEND", desc: "Optimal Targeted Intervention" },
    { step: "07", name: "POLICY CHECK", desc: "Safety Guardrails & Limits Validation" },
    { step: "08", name: "FINAL ACTION", desc: "Autonomous Execute / Human Escalate" }
  ];

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp">
      {/* Command Center Hero & Agent Status */}
      <section className="mb-10 relative select-none">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle at 40% 40%, rgba(242, 202, 80, 0.15) 0%, transparent 65%)' }}></div>
        
        <div className="relative z-10 flex flex-col items-start gap-6">
          {/* Prominent AI Status Banner */}
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface border border-border-low">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              <div>
                <span className="font-mono text-xs font-bold text-secondary uppercase tracking-widest mr-2">
                  AI RECOVERY AGENT — STATUS: ACTIVE
                </span>
                <span className="text-muted-slate text-xs hidden md:inline">
                  | Monitoring revenue leakage across payments, checkout, subscriptions and receivables.
                </span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-muted-slate flex items-center gap-2">
              <span className="text-primary font-bold">100% BOUNDED</span>
              <span>&bull;</span>
              <span>AUTONOMOUS EXECUTION</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-5xl lg:text-[56px] font-bold text-on-surface leading-[1.1] mb-3 tracking-tight">
              REVGUARD AI &mdash; <span className="text-primary">REVENUE COMMAND CENTER</span>
            </h1>
            <p className="font-body-md text-sm md:text-base text-muted-slate mb-6 max-w-2xl font-light">
              Autonomous AI agent detecting lost revenue, diagnosing root causes, validating policy guardrails, executing bounded interventions, and tracking recovered capital.
            </p>
            
            {/* Functional Buttons Panel */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={runRecoveryBatch}
                disabled={isBatchSimulating}
                className="group relative flex min-w-[220px] cursor-pointer items-center justify-center overflow-hidden h-[48px] px-6 border border-primary bg-primary text-background text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed rounded-none select-none"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  {isBatchSimulating ? 'Processing Recovery Batch...' : 'RUN RECOVERY BATCH'}
                </span>
              </button>

              <button 
                onClick={() => navigate('/recovery-gallery')}
                className="flex min-w-[180px] cursor-pointer items-center justify-center h-[48px] px-6 border border-border-low bg-surface text-on-surface text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 hover:border-primary hover:text-primary rounded-none"
              >
                LEAKAGE CASES ({activeCasesCount})
              </button>

              <button 
                onClick={() => navigate('/recovery-loop')}
                className="flex min-w-[180px] cursor-pointer items-center justify-center h-[48px] px-6 border border-border-low bg-surface text-muted-slate text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 hover:border-primary hover:text-primary rounded-none"
              >
                AI DECISION LOOP &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top 6 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <MetricCard 
          title="Revenue at Risk" 
          value={`₹${(revenueAtRisk / 100000).toFixed(1)}L`} 
          icon="warning"
          change="+8.4%"
          subLabel="vs previous period"
          isGold={true}
        />
        <MetricCard 
          title="Revenue Recovered" 
          value={`₹${(revenueRecovered / 100000).toFixed(1)}L`} 
          icon="payments"
          change="+18.6%"
          subLabel="vs previous period"
          badgeText="VERIFIED"
          badgeColor="secondary"
        />
        <MetricCard 
          title="Recovery Rate" 
          value={`${recoveryRate.toFixed(1)}%`} 
          icon="percent"
          subLabel="Autonomous efficiency"
          badgeText="OPTIMAL"
          badgeColor="secondary"
        />
        <MetricCard 
          title="Active Leakage Cases" 
          value={activeCasesCount.toLocaleString()} 
          icon="sync"
          subLabel="4 active channels"
          badgeText="MONITORED"
          badgeColor="primary"
        />
        <MetricCard 
          title="Expected Recovery" 
          value={`₹${(expectedRecovery / 100000).toFixed(1)}L`} 
          icon="trending_up"
          subLabel="Weighted probability yield"
          badgeText="84% CONFIDENCE"
          badgeColor="primary"
        />
        <MetricCard 
          title="Human Escalations" 
          value={humanEscalationsCount.toString()} 
          icon="gavel"
          subLabel="High-value threshold (> ₹5L)"
          badgeText="HUMAN REVIEW"
          badgeColor="error"
        />
      </section>

      {/* Revenue Leakage Overview — Category Breakdown */}
      <section className="border border-border-low bg-surface p-6 md:p-8 mb-12 select-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-sm">donut_large</span>
              <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
                LEAKAGE VECTOR ANALYSIS
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase">
              Where is the Company Losing Revenue?
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-slate">
            Total Revenue at Risk: <span className="text-primary font-bold">₹{(revenueAtRisk / 100000).toFixed(1)}L</span>
          </p>
        </div>

        {/* Stacked Proportional Distribution Bar */}
        <div className="w-full h-4 flex overflow-hidden mb-6 border border-border-low">
          <div style={{ width: '36%' }} className="bg-secondary h-full" title="Overdue Receivables (36%)"></div>
          <div style={{ width: '29%' }} className="bg-primary h-full" title="Failed Payments (29%)"></div>
          <div style={{ width: '20%' }} className="bg-[#e9c349] h-full" title="Checkout Abandonment (20%)"></div>
          <div style={{ width: '15%' }} className="bg-[#85f8c4] h-full" title="Subscription Failures (15%)"></div>
        </div>

        {/* 4 Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => navigate('/recovery-gallery')}
              className="border border-border-low bg-surface-container-lowest p-5 hover:border-primary transition-all duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] text-muted-slate uppercase tracking-wider">{cat.casesCount} Cases</span>
                <span className="font-mono text-xs font-bold text-primary">{cat.percentage}%</span>
              </div>
              <div className="font-metric text-2xl font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                {cat.amount}
              </div>
              <div className="font-label-caps text-[11px] font-bold text-on-surface mb-2 uppercase">
                {cat.name}
              </div>
              <p className="text-[11px] text-muted-slate font-body-md line-clamp-2">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Decision Engine — Autonomous Pipeline */}
      <section className="border border-border-low bg-surface p-6 md:p-8 mb-12 select-none">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-sm">account_tree</span>
              <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
                DECISIONING INFRASTRUCTURE
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase">
              Autonomous AI Decision Engine
            </h2>
          </div>
          <span className="font-mono text-xs text-secondary hidden sm:inline">
            ZERO GENERIC ANALYTICS &bull; BOUNDED AUTONOMY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {decisionEngineSteps.map((s, idx) => (
            <div key={idx} className="border border-border-low bg-surface-container-lowest p-3 flex flex-col justify-between h-32 relative group hover:border-primary transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[10px] text-primary font-bold">{s.step}</span>
                {idx < 7 && (
                  <span className="material-symbols-outlined text-[12px] text-muted-slate hidden lg:inline">arrow_forward</span>
                )}
              </div>
              <div className="font-label-caps text-[11px] font-bold text-on-surface uppercase group-hover:text-primary transition-colors">
                {s.name}
              </div>
              <div className="font-mono text-[9px] text-muted-slate leading-tight">
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Section: AI Activity Stream & Top Recovery Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column: AI Agent Activity Feed */}
        <section className="border border-border-low bg-surface p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">stream</span>
              <h3 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">
                AI Agent Activity Feed
              </h3>
            </div>
            <span className="font-mono text-[10px] text-secondary font-bold animate-pulse">
              LIVE STREAM
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-[420px] pr-1">
            {agentActivity.map((act, idx) => (
              <div key={idx} className="border border-border-low/60 bg-surface-container-lowest p-3 flex flex-col gap-1 hover:border-border-low transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-slate text-[10px]">{act.time}</span>
                    <span className="text-primary font-bold text-[11px]">{act.caseId}</span>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
                <div className="font-bold text-on-surface text-[12px]">
                  {act.event} {act.amount && <span className="text-secondary ml-1 font-metric">({act.amount})</span>}
                </div>
                <div className="text-muted-slate text-[11px]">
                  {act.customer} &mdash; {act.detail}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Top Recovery Opportunities (Ranked by Expected Recovery) */}
        <section className="border border-border-low bg-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">format_list_numbered</span>
                <h3 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">
                  Top Recovery Opportunities
                </h3>
              </div>
              <span className="font-mono text-[10px] text-muted-slate uppercase">
                RANKED BY EXPECTED VALUE
              </span>
            </div>

            <p className="font-mono text-[10px] text-muted-slate mb-4">
              Formula: <span className="text-on-surface font-bold">Expected Recovery = Amount at Risk &times; Recovery Probability</span>
            </p>

            <div className="space-y-3">
              {topOpportunities.map((opp, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate('/recovery-gallery')}
                  className="border border-border-low bg-surface-container-lowest p-3 flex items-center justify-between hover:border-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-primary w-6">{opp.rank}</span>
                    <div>
                      <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {opp.customer}
                      </div>
                      <div className="font-mono text-[10px] text-muted-slate">
                        ₹{opp.amountAtRisk.toLocaleString()} &bull; {opp.recoveryProbability}% prob &bull; {opp.leakageType}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-metric text-base font-bold text-secondary">
                      ₹{opp.expectedRecovery.toLocaleString()}
                    </div>
                    <div className="font-mono text-[9px] text-muted-slate uppercase">
                      Expected Yield
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/recovery-gallery')}
            className="w-full mt-4 border border-border-low py-2.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:border-primary hover:bg-primary/5 transition-all text-center"
          >
            VIEW ALL LEAKAGE CASES &rarr;
          </button>
        </section>
      </div>

      {/* Recovery Performance Analytics — Intervention Success Rates */}
      <section className="border border-border-low bg-surface p-6 md:p-8 mb-8 select-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-sm">insights</span>
              <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
                INTERVENTION PERFORMANCE LEARNING
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase">
              Which Recovery Interventions Work Best?
            </h2>
          </div>
          <div className="font-mono text-xs text-muted-slate">
            Heuristic Model Version: <span className="text-on-surface font-bold">4.2-Adaptive</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {interventionPerformance.map((item, idx) => (
            <div key={idx} className="border border-border-low bg-surface-container-lowest p-4 flex flex-col justify-between">
              <div>
                <div className="font-label-caps text-xs font-bold text-on-surface mb-1">
                  {item.name}
                </div>
                <div className="font-metric text-3xl font-bold text-secondary mb-3">
                  {item.rate}%
                </div>
                <div className="w-full bg-surface h-2 border border-border-low mb-3">
                  <div className="bg-secondary h-full" style={{ width: `${item.rate}%` }}></div>
                </div>
              </div>
              <p className="font-mono text-[10px] text-muted-slate">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
