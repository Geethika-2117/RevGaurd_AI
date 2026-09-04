import React from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function SimpleRecoveryModal() {
  const { 
    isRecoveryModalOpen, 
    closeRecoveryModal, 
    isSimulating, 
    simulationProgress, 
    simulationStage, 
    simulationResult 
  } = useRecovery();

  if (!isRecoveryModalOpen) return null;

  const stagesList = [
    "Scanning revenue streams across payment gateways...",
    "Detecting failure codes, expired cards, and overdue invoices...",
    "Evaluating recovery opportunities and calculating probabilities...",
    "Validating safety policies and executing bounded recovery actions...",
    "Measuring settlements and finalizing recovery ledger..."
  ];

  return (
    <div className="fixed inset-0 z-[130] bg-surface-dim/95 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg border border-border-low bg-surface p-8 relative shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
        
        {/* Progress Line */}
        <div 
          className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${(simulationProgress / 5) * 100}%` }}
        ></div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
              BATCH AI RECOVERY PIPELINE
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-on-surface">
            {simulationResult ? "Recovery Pipeline Completed" : "Autonomous Recovery in Progress..."}
          </h3>
          <p className="text-xs font-mono text-muted-slate mt-1">
            {simulationStage || "Executing policy checks and gateway retries..."}
          </p>
        </div>

        {/* 5-Step List */}
        <div className="space-y-3 font-mono text-xs border border-border-low bg-surface-container-lowest p-5 mb-6">
          {stagesList.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = simulationProgress > stepNum || simulationResult;
            const isCurrent = simulationProgress === stepNum && !simulationResult;

            return (
              <div key={idx} className="flex items-center gap-3">
                <span className={`w-5 h-5 flex items-center justify-center border text-[11px] ${
                  isCompleted ? 'border-secondary text-secondary bg-secondary/10 font-bold' :
                  isCurrent ? 'border-primary text-primary animate-pulse font-bold' :
                  'border-border-low text-muted-slate'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span className={isCompleted ? 'text-on-surface font-semibold' : isCurrent ? 'text-primary font-bold' : 'text-muted-slate'}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>

        {/* Final Recovery Result Card */}
        {simulationResult && (
          <div className="border border-secondary/40 bg-secondary/5 p-6 mb-6 text-center animate-fadeInUp">
            <span className="font-mono text-xs text-secondary font-bold uppercase block mb-1">
              REVENUE RECOVERED
            </span>
            <div className="font-metric text-4xl font-bold text-secondary my-1">
              ₹{simulationResult.amount_recovered.toLocaleString()}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-left font-mono text-[11px] text-muted-slate mt-4 pt-3 border-t border-border-low/40">
              <div>Opportunities Found: <span className="text-on-surface font-bold">{simulationResult.recovery_opportunities_found}</span></div>
              <div>Actions Executed: <span className="text-secondary font-bold">{simulationResult.automated_actions_executed}</span></div>
              <div>Human Escalations: <span className="text-primary font-bold">{simulationResult.human_escalations_routed}</span></div>
              <div>New Recovery Rate: <span className="text-on-surface font-bold">{simulationResult.updated_recovery_rate}%</span></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {simulationResult ? (
          <button 
            onClick={closeRecoveryModal}
            className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-3 font-mono text-xs font-bold uppercase transition-all w-full"
          >
            VIEW UPDATED DASHBOARD &rarr;
          </button>
        ) : (
          <div className="text-center font-mono text-xs text-muted-slate">
            Evaluating safety rules &bull; Zero customer friction &bull; Cryptographically isolated
          </div>
        )}

      </div>
    </div>
  );
}
