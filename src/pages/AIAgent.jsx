import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import StatusBadge from '../components/StatusBadge';

export default function AIAgent() {
  const { 
    revenueRecovered, 
    agentActivity, 
    openCaseModal, 
    runRecoveryBatch, 
    isBatchSimulating 
  } = useRecovery();

  const [agentActive, setAgentActive] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [autonomyMode, setAutonomyMode] = useState('BOUNDED_AUTONOMOUS');

  const agentStats = [
    { title: "EVENTS ANALYZED", value: "5,000", icon: "dataset", sub: "Webhooks, API, ERP" },
    { title: "LEAKAGE CASES", value: "1,840", icon: "radar", sub: "Identified anomalies" },
    { title: "RECOVERY OPPORTUNITIES", value: "1,420", icon: "balance", sub: "Ranked by yield" },
    { title: "ACTIONS EXECUTED", value: "1,180", icon: "play_circle", sub: "Bounded interventions" },
    { title: "REVENUE RECOVERED", value: "₹11.7L", icon: "payments", isGold: true, sub: "Verified capital" }
  ];

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header & Status Banner */}
      <div className="mb-8 border-b border-border-low pb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-3 h-3 rounded-full ${agentActive ? 'bg-secondary animate-pulse' : 'bg-muted-slate'}`}></span>
            <span className={`font-mono text-xs font-bold tracking-widest uppercase ${agentActive ? 'text-secondary' : 'text-muted-slate'}`}>
              REVGUARD AGENT &bull; STATUS: {agentActive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase tracking-tight">
            AI Agent Cockpit
          </h1>
          <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
            Autonomous agent continuously evaluating gateway declines, checkout timeouts, and invoice delinquency against strict company policy guardrails.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setAgentActive(!agentActive)}
            className={`px-5 py-2.5 font-mono text-xs uppercase font-bold border transition-all ${
              agentActive 
                ? 'border-error-red text-error-red bg-error-red/10 hover:bg-error-red/20' 
                : 'border-secondary text-secondary bg-secondary/10 hover:bg-secondary/20'
            }`}
          >
            {agentActive ? 'PAUSE AGENT' : 'RESUME AGENT'}
          </button>

          <button 
            onClick={runRecoveryBatch}
            disabled={isBatchSimulating}
            className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-5 py-2.5 font-mono text-xs uppercase font-bold transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            RUN RECOVERY BATCH
          </button>
        </div>
      </div>

      {/* Live Agent Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {agentStats.map((st, i) => (
          <div 
            key={i} 
            className={`border p-4 bg-surface flex flex-col justify-between ${
              st.isGold ? 'border-secondary bg-secondary/5' : 'border-border-low'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[10px] text-muted-slate uppercase font-bold">{st.title}</span>
              <span className="material-symbols-outlined text-sm text-muted-slate">{st.icon}</span>
            </div>
            <div className={`font-metric text-2xl md:text-3xl font-bold my-1 ${st.isGold ? 'text-secondary' : 'text-on-surface'}`}>
              {st.value}
            </div>
            <span className="font-mono text-[9px] text-muted-slate">{st.sub}</span>
          </div>
        ))}
      </div>

      {/* Cockpit Center: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left 7 Columns: Autonomous Activity Stream */}
        <div className="lg:col-span-7 border border-border-low bg-surface p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">psychology</span>
              <h3 className="font-display text-lg font-bold text-on-surface uppercase">
                Agent Decisioning Telemetry Stream
              </h3>
            </div>
            <span className="font-mono text-[10px] text-secondary font-bold animate-pulse">
              LIVE EXECUTION
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-[460px] pr-1">
            {agentActivity.map((act, i) => (
              <div 
                key={i}
                onClick={() => openCaseModal(act.case_id)}
                className="p-3.5 border border-border-low/60 bg-surface-container-lowest hover:border-primary transition-all cursor-pointer group"
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

        {/* Right 5 Columns: Agent Bounds & Governance Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Autonomy Mode Panel */}
          <div className="border border-border-low bg-surface p-6">
            <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider mb-2">
              AUTONOMOUS GOVERNANCE CEILING
            </div>
            <h4 className="font-display text-lg font-bold text-on-surface uppercase mb-3">
              Operational Bounds
            </h4>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 border border-border-low bg-surface-container-lowest">
                <span className="text-muted-slate">EXECUTION MODE:</span>
                <span className="text-primary font-bold">{autonomyMode}</span>
              </div>

              <div className="flex justify-between items-center p-3 border border-border-low bg-surface-container-lowest">
                <span className="text-muted-slate">AUTONOMOUS LIMIT:</span>
                <span className="text-secondary font-bold">&le; ₹5,00,000</span>
              </div>

              <div className="flex justify-between items-center p-3 border border-border-low bg-surface-container-lowest">
                <span className="text-muted-slate">ESCALATION RULE:</span>
                <span className="text-error-red font-bold">MANDATORY (&gt; ₹5L)</span>
              </div>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="mt-6 pt-4 border-t border-border-low/40">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-muted-slate">MIN AI CONFIDENCE:</span>
                <span className="text-primary font-bold">{confidenceThreshold}%</span>
              </div>
              <input 
                type="range"
                min="50"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="font-mono text-[9px] text-muted-slate block mt-1">
                Cases with confidence below {confidenceThreshold}% are automatically diverted to human review.
              </span>
            </div>
          </div>

          {/* Quick Health Audit */}
          <div className="border border-border-low bg-surface p-6 font-mono text-xs">
            <div className="font-mono text-[10px] text-secondary font-bold uppercase tracking-wider mb-2">
              GUARDRAIL INTEGRITY
            </div>
            <div className="space-y-2 text-muted-slate">
              <div className="flex justify-between">
                <span>POLICY VIOLATIONS:</span>
                <span className="text-secondary font-bold">0 (ZERO)</span>
              </div>
              <div className="flex justify-between">
                <span>ANTI-SPAM CAPS:</span>
                <span className="text-secondary font-bold">100% ENFORCED</span>
              </div>
              <div className="flex justify-between">
                <span>PCI-DSS ENCRYPTION:</span>
                <span className="text-secondary font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
