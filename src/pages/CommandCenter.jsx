import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import StatusBadge from '../components/StatusBadge';

export default function CommandCenter() {
  const navigate = useNavigate();
  const { 
    revenueAtRisk, 
    revenueRecovered, 
    recoveryRate, 
    expectedRecovery,
    agentActivity,
    openCaseModal,
    runRecoveryBatch,
    isBatchSimulating
  } = useRecovery();

  const recoveryPipeline = [
    { stage: "01", name: "REVENUE EVENTS", stat: "5,000", sub: "Webhooks & Invoices", icon: "dataset" },
    { stage: "02", name: "LEAKAGE DETECTED", stat: "1,840", sub: "4 Leakage Vectors", icon: "radar" },
    { stage: "03", name: "AI DIAGNOSIS", stat: "94.8%", sub: "Root Cause Accuracy", icon: "psychology" },
    { stage: "04", name: "RECOVERY DECISION", stat: "1,420", sub: "Expected Value Ranked", icon: "balance" },
    { stage: "05", name: "POLICY VALIDATION", stat: "100%", sub: "Zero-Violation Bounds", icon: "security" },
    { stage: "06", name: "ACTION", stat: "1,180", sub: "Automated Interventions", icon: "play_circle" },
    { stage: "07", name: "RECOVERED", stat: `₹${(revenueRecovered / 100000).toFixed(1)}L`, sub: "Verified Capital", icon: "payments", isGold: true }
  ];

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Hero Header Area */}
      <section className="mb-10 relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border-low pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono text-xs font-bold text-secondary tracking-widest uppercase">
                REVGUARD AI &bull; AUTONOMOUS REVENUE RECOVERY
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface uppercase tracking-tight">
              Revenue Command Center
            </h1>
            <p className="font-body-md text-sm md:text-base text-muted-slate mt-2 max-w-2xl">
              Autonomously detecting and recovering revenue leakage across payment gateways, checkout sessions, subscriptions, and enterprise receivables.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={runRecoveryBatch}
              disabled={isBatchSimulating}
              className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              {isBatchSimulating ? "Processing Batch..." : "RUN RECOVERY BATCH"}
            </button>
            <button 
              onClick={() => navigate('/leakage-detection')}
              className="btn-primary border border-border-low bg-surface hover:border-primary text-on-surface hover:text-primary px-5 py-3 font-mono text-xs uppercase transition-all"
            >
              DETECT LEAKAGE &rarr;
            </button>
          </div>
        </div>

        {/* Hero Revenue KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          
          {/* Primary Metric: Revenue at Risk */}
          <div className="md:col-span-2 border-2 border-primary bg-surface p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(242,202,80,0.08)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-primary text-6xl">warning</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">
                PRIMARY EXPOSURE
              </span>
              <span className="font-mono text-[10px] text-error-red border border-error-red/40 px-2 py-0.5 bg-error-red/10 font-bold">
                CRITICAL
              </span>
            </div>
            <div className="font-metric text-5xl md:text-6xl font-bold text-on-surface tracking-tight my-2">
              ₹{(revenueAtRisk / 100000).toFixed(1)}L
            </div>
            <div className="font-label-caps text-xs text-muted-slate uppercase tracking-wider font-bold mb-3">
              REVENUE AT RISK
            </div>
            <p className="font-mono text-[11px] text-muted-slate">
              Real-time capital exposed to payment failures, checkout lapses, and overdue invoices.
            </p>
          </div>

          {/* Secondary Metric 1: Revenue Recovered */}
          <div className="border border-border-low bg-surface p-6 flex flex-col justify-between hover:border-secondary transition-colors">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[10px] text-muted-slate uppercase font-bold">VERIFIED RECOVERY</span>
                <span className="font-mono text-[10px] text-secondary font-bold">+18.6%</span>
              </div>
              <div className="font-metric text-3xl md:text-4xl font-bold text-secondary my-1">
                ₹{(revenueRecovered / 100000).toFixed(1)}L
              </div>
              <div className="font-label-caps text-[11px] text-muted-slate uppercase font-bold">
                REVENUE RECOVERED
              </div>
            </div>
            <p className="font-mono text-[10px] text-muted-slate mt-4">
              Cryptographically verified funds settled into accounts.
            </p>
          </div>

          {/* Secondary Metric 2: Recovery Rate & Expected Recovery */}
          <div className="border border-border-low bg-surface p-6 flex flex-col justify-between hover:border-primary transition-colors">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[10px] text-muted-slate uppercase font-bold">AUTONOMOUS RATE</span>
                <span className="font-mono text-[10px] text-primary font-bold">OPTIMAL</span>
              </div>
              <div className="font-metric text-3xl md:text-4xl font-bold text-on-surface my-1">
                {recoveryRate.toFixed(1)}%
              </div>
              <div className="font-label-caps text-[11px] text-muted-slate uppercase font-bold">
                RECOVERY RATE
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border-low/40 flex justify-between items-center font-mono text-[11px]">
              <span className="text-muted-slate">EXPECTED YIELD:</span>
              <span className="text-primary font-bold">₹{(expectedRecovery / 100000).toFixed(1)}L</span>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Revenue Recovery Flow Component */}
      <section className="border border-border-low bg-surface p-6 md:p-8 mb-12 select-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-sm">hub</span>
              <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
                AUTONOMOUS PIPELINE
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase">
              Visual Revenue Recovery Flow
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-slate">
            Full Cycle: <strong className="text-primary font-bold">Detect &rarr; Diagnose &rarr; Decide &rarr; Validate &rarr; Act &rarr; Recover</strong>
          </span>
        </div>

        {/* The Pipeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative">
          {recoveryPipeline.map((node, idx) => (
            <div 
              key={idx} 
              className={`border p-4 flex flex-col justify-between h-36 transition-all hover:-translate-y-1 ${
                node.isGold 
                  ? 'border-secondary bg-secondary/5 shadow-[0_0_20px_rgba(104,219,169,0.1)]' 
                  : 'border-border-low bg-surface-container-lowest hover:border-primary'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-primary font-bold">{node.stage}</span>
                <span className="material-symbols-outlined text-muted-slate text-sm">{node.icon}</span>
              </div>
              <div>
                <div className={`font-metric text-2xl font-bold ${node.isGold ? 'text-secondary' : 'text-on-surface'}`}>
                  {node.stat}
                </div>
                <div className="font-label-caps text-[10px] font-bold text-on-surface uppercase mt-0.5 truncate" title={node.name}>
                  {node.name}
                </div>
              </div>
              <div className="font-mono text-[9px] text-muted-slate truncate" title={node.sub}>
                {node.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Section: Live Agent Activity Stream + Core Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left 7 Cols: Live Activity Feed */}
        <div className="lg:col-span-7 border border-border-low bg-surface p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">stream</span>
              <h3 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">
                Live AI Agent Activity Stream
              </h3>
            </div>
            <span className="font-mono text-[10px] text-secondary font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              REAL-TIME
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-[380px] pr-1">
            {agentActivity.map((act, idx) => (
              <div 
                key={idx} 
                onClick={() => openCaseModal(act.case_id)}
                className="border border-border-low/60 bg-surface-container-lowest p-3.5 hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-slate text-[10px]">{act.time}</span>
                    <span className="text-primary font-bold text-[11px] group-hover:text-on-surface">{act.case_id}</span>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
                <div className="font-bold text-on-surface text-xs flex justify-between items-center">
                  <span>{act.event}</span>
                  {act.amount && <span className="text-secondary font-metric">{act.amount}</span>}
                </div>
                <div className="text-muted-slate text-[11px] mt-0.5">
                  {act.customer} &mdash; {act.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Operational Action Hub Shortcuts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div 
            onClick={() => navigate('/leakage-detection')}
            className="border border-border-low bg-surface p-5 hover:border-primary transition-all cursor-pointer group flex items-start gap-4"
          >
            <span className="material-symbols-outlined text-primary text-3xl p-2 border border-border-low bg-surface-container-lowest group-hover:border-primary">
              radar
            </span>
            <div>
              <div className="font-label-caps text-xs text-primary font-bold uppercase mb-1">
                WHERE IS MONEY LEAKING?
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                Leakage Detection &rarr;
              </h4>
              <p className="font-mono text-xs text-muted-slate mt-1">
                Explore the 4 major revenue loss zones across failed payments, checkouts, and overdue invoices.
              </p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/opportunities')}
            className="border border-border-low bg-surface p-5 hover:border-primary transition-all cursor-pointer group flex items-start gap-4"
          >
            <span className="material-symbols-outlined text-primary text-3xl p-2 border border-border-low bg-surface-container-lowest group-hover:border-primary">
              trending_up
            </span>
            <div>
              <div className="font-label-caps text-xs text-primary font-bold uppercase mb-1">
                WHAT TO RECOVER FIRST?
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                Revenue Opportunities &rarr;
              </h4>
              <p className="font-mono text-xs text-muted-slate mt-1">
                Priority queue ranked by Expected Value (Amount at Risk &times; Recovery Probability).
              </p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/policy-engine')}
            className="border border-border-low bg-surface p-5 hover:border-primary transition-all cursor-pointer group flex items-start gap-4"
          >
            <span className="material-symbols-outlined text-primary text-3xl p-2 border border-border-low bg-surface-container-lowest group-hover:border-primary">
              security
            </span>
            <div>
              <div className="font-label-caps text-xs text-primary font-bold uppercase mb-1">
                BOUNDED AUTONOMY
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                Recovery Policy Engine &rarr;
              </h4>
              <p className="font-mono text-xs text-muted-slate mt-1">
                Enforced safety guardrails, retry limits, escalation ceilings (&gt; ₹5L), and stopping rules.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
