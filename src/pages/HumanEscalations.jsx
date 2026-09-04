import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function HumanEscalations() {
  const { escalations, resolveHumanEscalation, openCaseModal } = useRecovery();
  const [selectedEsc, setSelectedEsc] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolve = () => {
    if (!selectedEsc) return;
    resolveHumanEscalation(selectedEsc.id);
    setSelectedEsc(null);
    setResolutionNotes('');
  };

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-error-red text-sm">supervised_user_circle</span>
          <span className="font-mono text-[11px] text-error-red uppercase font-bold tracking-widest">
            AI OPERATIONS &bull; HUMAN-IN-THE-LOOP GOVERNANCE
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
          Human Escalations Queue
        </h1>
        <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
          Autonomous execution is bounded. When exposure exceeds ₹5,00,000, diagnostic confidence is low (&lt;50%), or customer disputes emerge, RevGuard AI halts automation and mandates executive human review.
        </p>
      </div>

      {/* Escalation Policy Reasons Badges */}
      <div className="flex flex-wrap gap-2 mb-8 font-mono text-[10px]">
        <span className="text-muted-slate py-1 uppercase font-bold">ESCALATION TRIGGERS:</span>
        <span className="border border-border-low bg-surface px-2.5 py-1 text-on-surface">HIGH VALUE (&gt; ₹5L)</span>
        <span className="border border-border-low bg-surface px-2.5 py-1 text-on-surface">LOW CONFIDENCE (&lt; 50%)</span>
        <span className="border border-border-low bg-surface px-2.5 py-1 text-on-surface">CUSTOMER DISPUTE</span>
        <span className="border border-border-low bg-surface px-2.5 py-1 text-on-surface">MAX RETRIES REACHED (2/2)</span>
        <span className="border border-border-low bg-surface px-2.5 py-1 text-on-surface">POLICY RESTRICTION</span>
        <span className="border border-border-low bg-surface px-2.5 py-1 text-on-surface">UNUSUAL BEHAVIOR</span>
      </div>

      {/* Escalation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {escalations.map(esc => {
          const isResolved = esc.status === 'RESOLVED';
          return (
            <div 
              key={esc.id}
              className={`border p-6 flex flex-col justify-between transition-all bg-surface ${
                isResolved 
                  ? 'border-secondary/40 opacity-60' 
                  : esc.priority === 'CRITICAL' 
                  ? 'border-error-red/60 hover:border-error-red shadow-[0_0_20px_rgba(239,68,68,0.06)]' 
                  : 'border-border-low hover:border-primary'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[11px] text-primary font-bold">{esc.id}</span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border font-bold uppercase ${
                    isResolved ? 'border-secondary text-secondary' :
                    esc.priority === 'CRITICAL' ? 'border-error-red text-error-red bg-error-red/10' :
                    'border-primary text-primary bg-primary/10'
                  }`}>
                    {isResolved ? 'RESOLVED' : esc.priority}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-on-surface mb-1">
                  {esc.customer_name}
                </h3>
                <div className="font-metric text-2xl font-bold text-error-red mb-3">
                  {esc.amount_at_risk}
                </div>

                <div className="space-y-1.5 font-mono text-xs text-muted-slate mb-4 bg-surface-container-lowest p-3 border border-border-low/40">
                  <div><strong className="text-on-surface">Overdue:</strong> {esc.days_overdue}</div>
                  <div><strong className="text-on-surface">Reason:</strong> <span className="text-error-red">{esc.reason}</span></div>
                  <div><strong className="text-on-surface">AI Confidence:</strong> {esc.ai_confidence}%</div>
                  <div><strong className="text-on-surface">Assigned:</strong> {esc.assigned_to}</div>
                </div>
              </div>

              <div>
                {isResolved ? (
                  <div className="text-center font-mono text-[11px] text-secondary font-bold py-2 border border-secondary/30">
                    &check; RESOLVED BY EXECUTIVE
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedEsc(esc)}
                    className="w-full border border-primary text-primary py-2.5 font-mono text-xs uppercase hover:bg-primary hover:text-background transition-all font-bold"
                  >
                    REVIEW CASE
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedEsc && (
        <div className="fixed inset-0 z-[130] bg-surface-dim/95 flex items-center justify-center p-4 backdrop-blur-md animate-fadeInUp">
          <div className="bg-surface border border-error-red w-full max-w-lg p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex justify-between items-start mb-4 border-b border-border-low pb-3">
              <div>
                <span className="font-mono text-[10px] text-error-red uppercase font-bold tracking-widest">
                  MANDATORY HUMAN REVIEW
                </span>
                <h3 className="font-display text-xl font-bold text-on-surface">
                  {selectedEsc.customer_name} ({selectedEsc.id})
                </h3>
              </div>
              <button 
                onClick={() => setSelectedEsc(null)}
                className="text-muted-slate hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="font-mono text-xs space-y-3 mb-6">
              <div className="p-3 border border-border-low bg-surface-container-lowest flex justify-between items-center">
                <span className="text-muted-slate">EXPOSURE:</span>
                <span className="font-metric text-2xl font-bold text-error-red">{selectedEsc.amount_at_risk}</span>
              </div>
              <div><strong className="text-on-surface">Policy Restriction:</strong> {selectedEsc.reason}</div>
              <div><strong className="text-on-surface">Recommendation:</strong> {selectedEsc.recommendation}</div>
              <div><strong className="text-on-surface">Assigned Executive:</strong> {selectedEsc.assigned_to}</div>

              <div>
                <label className="block text-muted-slate text-[10px] uppercase mb-1">EXECUTIVE DISPOSITION NOTES:</label>
                <textarea 
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter authorized payment terms or restructuring schedule..."
                  className="w-full bg-surface-container-lowest border border-border-low p-2 text-on-surface font-mono text-xs h-20 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-border-low pt-4">
              <button 
                onClick={() => openCaseModal(selectedEsc.case_id)}
                className="text-primary font-mono text-xs hover:underline"
              >
                Open Full Dossier &rarr;
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedEsc(null)}
                  className="border border-border-low px-4 py-2 font-mono text-xs uppercase text-muted-slate hover:text-on-surface"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleResolve}
                  className="btn-primary border border-secondary bg-secondary text-background font-mono text-xs font-bold px-5 py-2 uppercase hover:bg-secondary/90 transition-all"
                >
                  AUTHORIZE &amp; RESOLVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
