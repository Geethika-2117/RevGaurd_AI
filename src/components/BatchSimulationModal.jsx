import React from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function BatchSimulationModal() {
  const { showBatchModal, closeBatchModal, batchStep, batchSteps, batchFinished } = useRecovery();

  if (!showBatchModal) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-surface-dim/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl border border-primary bg-surface p-8 relative overflow-hidden shadow-[0_0_60px_rgba(242,202,80,0.2)]">
        {/* Top Glowing Progress Bar */}
        <div 
          className="absolute top-0 left-0 h-1.5 bg-primary transition-all duration-500 ease-out shadow-[0_0_15px_rgba(242,202,80,0.8)]" 
          style={{ width: `${batchSteps[batchStep]?.pct || 15}%` }}
        ></div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">
                AUTONOMOUS RECOVERY ENGINE &bull; BATCH PIPELINE
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase tracking-tight">
              {batchFinished ? "RECOVERY BATCH COMPLETED" : "PROCESSING REVENUE EVENT STREAM"}
            </h3>
          </div>
          <div className="font-mono text-sm text-primary font-bold">
            {batchSteps[batchStep]?.pct || 15}%
          </div>
        </div>

        {/* Step-by-Step Progressive Feed */}
        <div className="space-y-3 font-mono text-xs text-muted-slate h-56 overflow-y-auto border border-border-low bg-surface-container-lowest p-4">
          {batchSteps.slice(0, batchStep + 1).map((s, idx) => (
            <div key={idx} className="flex items-start gap-2 animate-fadeInUp">
              <span className="text-secondary select-none font-bold">&gt;</span>
              <span className={idx === batchStep ? "text-on-surface font-bold" : "text-muted-slate"}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Final Batch Summary Card */}
        {batchFinished && (
          <div className="mt-6 border-t border-border-low pt-6 animate-fadeInUp">
            <div className="bg-surface-container-low border border-secondary/40 p-5 mb-6">
              <div className="text-secondary font-label-caps text-[11px] mb-1 font-bold tracking-widest uppercase">
                TOTAL CAPITAL SECURED &bull; VERIFIED RECOVERY
              </div>
              <div className="font-metric text-4xl text-secondary font-bold mb-4">
                ₹11,70,000 RECOVERED
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left font-mono text-[11px] border-t border-border-low/60 pt-3">
                <div>
                  <span className="text-muted-slate block text-[10px]">EVENTS ANALYZED</span>
                  <span className="text-on-surface font-bold">5,000</span>
                </div>
                <div>
                  <span className="text-muted-slate block text-[10px]">LEAKAGE CASES</span>
                  <span className="text-error-red font-bold">1,840</span>
                </div>
                <div>
                  <span className="text-muted-slate block text-[10px]">ACTIONS EXECUTED</span>
                  <span className="text-primary font-bold">1,180</span>
                </div>
                <div>
                  <span className="text-muted-slate block text-[10px]">HUMAN ESCALATIONS</span>
                  <span className="text-primary font-bold">240 (&gt; ₹5L)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border-low/30 font-mono text-[10px]">
                <div>
                  <span className="text-muted-slate block">RECOVERY RATE:</span>
                  <span className="text-secondary font-bold">+18.2% (36.1% Overall)</span>
                </div>
                <div>
                  <span className="text-muted-slate block">SUCCESSFUL ACTIONS:</span>
                  <span className="text-on-surface font-bold">942 / 1,180</span>
                </div>
                <div>
                  <span className="text-muted-slate block">AVG RECOVERY / CASE:</span>
                  <span className="text-secondary font-bold">₹1,242</span>
                </div>
              </div>
            </div>

            <button 
              onClick={closeBatchModal}
              className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-3 font-label-caps text-xs uppercase transition-all w-full font-bold"
            >
              Confirm &amp; Sync Command Center
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
