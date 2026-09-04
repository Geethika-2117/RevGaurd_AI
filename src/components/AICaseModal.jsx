import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import StatusBadge from './StatusBadge';

export default function AICaseModal() {
  const { activeCaseModal, closeCaseModal, executeRecoveryAction, escalateCaseToHuman, stopCaseWorkflow } = useRecovery();
  const [notice, setNotice] = useState(null);

  if (!activeCaseModal) return null;

  const handleExecute = () => {
    executeRecoveryAction(activeCaseModal.case_id, activeCaseModal.recommended_action);
    const actionId = `ACT-${Math.floor(10000 + Math.random() * 90000)}`;
    setNotice({
      type: 'EXECUTE',
      actionId,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }) + " IST",
      channel: activeCaseModal.channel || "Payment Gateway",
      msg: "Recovery action executed. Telemetry committed to immutable audit trail."
    });
  };

  const handleEscalate = () => {
    escalateCaseToHuman(activeCaseModal.case_id, "Manual review requested by operator in Case Investigation Dossier");
    setNotice({
      type: 'ESCALATE',
      msg: "Case escalated to Human Queue [ESC-2031]. Assigned to Chief Financial Officer."
    });
  };

  const handleStop = () => {
    stopCaseWorkflow(activeCaseModal.case_id, "Workflow stopped via AI Dossier control panel");
    setNotice({
      type: 'STOP',
      msg: "Workflow halted. All scheduled reminders and automated retries terminated."
    });
  };

  const pipelineStages = [
    { label: "DETECTED", val: activeCaseModal.timestamp },
    { label: "LEAKAGE VECTOR", val: activeCaseModal.leakage_type },
    { label: "ROOT CAUSE", val: activeCaseModal.root_cause_confidence ? `${activeCaseModal.root_cause_confidence}% Conf` : "91% Conf" },
    { label: "RISK ASSESSMENT", val: `Score ${activeCaseModal.risk_score}` },
    { label: "RECOVERY PREDICTION", val: `${activeCaseModal.recovery_probability}% Prob` },
    { label: "AI RECOMMENDATION", val: activeCaseModal.recommended_action },
    { label: "POLICY CHECK", val: activeCaseModal.policy_status || "APPROVED" },
    { label: "ACTION", val: activeCaseModal.action_status || "EXECUTE" }
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-surface-dim/95 flex items-center justify-center p-4 backdrop-blur-md animate-fadeInUp select-none">
      <div className="bg-surface border border-primary w-full max-w-4xl flex flex-col relative shadow-[0_0_50px_rgba(242,202,80,0.2)] max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-border-low flex justify-between items-start bg-surface-dim">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">
                AI CASE INVESTIGATION DOSSIER &bull; {activeCaseModal.case_id}
              </span>
              <StatusBadge status={activeCaseModal.action_status} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
              {activeCaseModal.customer_name}
            </h2>
          </div>
          <button 
            onClick={closeCaseModal}
            className="text-muted-slate hover:text-primary transition-colors p-1 border border-border-low bg-surface hover:border-primary"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest p-4 border border-border-low">
            <div>
              <div className="text-[10px] text-muted-slate uppercase font-semibold">REVENUE AT RISK</div>
              <div className="font-metric text-2xl font-bold text-primary mt-0.5">
                ₹{activeCaseModal.amount_at_risk.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-slate uppercase font-semibold">RISK SCORE</div>
              <div className="font-metric text-2xl font-bold text-on-surface mt-0.5">
                {activeCaseModal.risk_score} <span className="text-xs text-muted-slate font-normal">/ 100</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-slate uppercase font-semibold">RECOVERY PROBABILITY</div>
              <div className="font-metric text-2xl font-bold text-secondary mt-0.5">
                {activeCaseModal.recovery_probability}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-slate uppercase font-semibold">EXPECTED YIELD</div>
              <div className="font-metric text-2xl font-bold text-secondary mt-0.5">
                ₹{activeCaseModal.expected_recovery.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Notice Alert */}
          {notice && (
            <div className="p-4 border border-secondary bg-secondary/10 text-secondary space-y-1 animate-fadeInUp">
              <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {notice.msg}
              </div>
              {notice.actionId && (
                <div className="text-[10px] text-on-surface">
                  Action ID: <span className="text-primary font-bold">{notice.actionId}</span> &bull; 
                  Timestamp: {notice.time} &bull; 
                  Channel: {notice.channel}
                </div>
              )}
            </div>
          )}

          {/* Visual Reasoning Pipeline */}
          <div className="border border-border-low bg-surface-container-lowest p-4">
            <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">account_tree</span>
              AUTONOMOUS REASONING PIPELINE
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {pipelineStages.map((stage, i) => (
                <div key={i} className="border border-border-low bg-surface p-2.5 flex flex-col justify-between h-20 text-[10px]">
                  <span className="text-primary font-bold text-[9px] uppercase">{stage.label}</span>
                  <span className="text-on-surface font-semibold truncate" title={stage.val}>{stage.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause Intelligence & Evidence */}
          <div className="border border-border-low bg-surface-container-lowest p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="font-label-caps text-xs text-primary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">psychology</span>
                ROOT CAUSE ANALYSIS &amp; EMPIRICAL EVIDENCE
              </div>
              <span className="font-mono text-[10px] text-secondary font-bold border border-secondary/40 px-2 py-0.5 bg-secondary/10">
                {activeCaseModal.root_cause_confidence || 91}% AI CONFIDENCE
              </span>
            </div>

            <div className="font-bold text-on-surface text-sm mb-3">
              Primary Cause: <span className="text-primary font-sans">{activeCaseModal.root_cause}</span>
            </div>

            <div className="border-t border-border-low/40 pt-3">
              <div className="font-mono text-[10px] text-muted-slate uppercase font-bold mb-2">
                EMPIRICAL TELEMETRY EVIDENCE:
              </div>
              <ul className="space-y-1.5 text-muted-slate">
                {activeCaseModal.evidence && activeCaseModal.evidence.length > 0 ? (
                  activeCaseModal.evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-secondary select-none">&bull;</span>
                      <span className="text-on-surface">{ev}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary select-none">&bull;</span>
                      <span>Payment failures increased 3.2&times; across cohort within last 7 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary select-none">&bull;</span>
                      <span>87% of failures involve expired credentials or delayed reconciliation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary select-none">&bull;</span>
                      <span>Customer previously had successful payments with lifetime value ₹{activeCaseModal.customer_lifetime_value?.toLocaleString() || '14.2L'}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Policy Check Validation */}
          <div className="border border-border-low bg-surface-container-lowest p-5">
            <div className="font-label-caps text-xs text-primary font-bold mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">security</span>
              RECOVERY POLICY &amp; GUARDRAIL VALIDATION
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeCaseModal.policy_checks && activeCaseModal.policy_checks.map((pc, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 border border-border-low/60 bg-surface">
                  <span className={`material-symbols-outlined text-sm ${pc.passed ? 'text-secondary' : 'text-error-red'}`}>
                    {pc.passed ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={`text-[11px] ${pc.passed ? 'text-on-surface' : 'text-error-red font-bold'}`}>
                    {pc.rule}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Event Logs */}
          <div>
            <div className="font-label-caps text-[11px] text-muted-slate mb-2">AUDIT DECISION TELEMETRY</div>
            <div className="bg-surface-container-lowest p-3 border border-border-low font-mono text-[10px] text-muted-slate space-y-1">
              {activeCaseModal.logs && activeCaseModal.logs.map((log, i) => (
                <p key={i} className={log.includes("recovered") || log.includes("verified") ? "text-secondary font-bold" : ""}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-6 border-t border-border-low flex flex-wrap justify-between items-center gap-4 bg-surface-dim">
          <div className="flex gap-2">
            <button 
              onClick={handleStop}
              disabled={activeCaseModal.action_status === 'STOPPED'}
              className="border border-border-low text-muted-slate hover:text-error-red hover:border-error-red px-4 py-2 font-mono text-xs uppercase transition-all disabled:opacity-40"
            >
              STOP WORKFLOW
            </button>
            <button 
              onClick={handleEscalate}
              disabled={activeCaseModal.action_status === 'ESCALATED'}
              className="border border-error-red/60 text-error-red hover:bg-error-red/10 px-4 py-2 font-mono text-xs uppercase transition-all disabled:opacity-40"
            >
              ESCALATE
            </button>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={closeCaseModal}
              className="border border-border-low px-4 py-2 font-mono text-xs uppercase text-muted-slate hover:text-on-surface"
            >
              DISMISS
            </button>
            <button 
              onClick={handleExecute}
              className="btn-primary border border-primary text-background bg-primary px-6 py-2 font-mono text-xs font-bold uppercase hover:bg-primary-container transition-all"
            >
              EXECUTE RECOVERY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
