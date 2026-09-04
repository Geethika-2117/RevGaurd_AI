import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function PolicyEngine() {
  const { policies } = useRecovery();
  
  // Interactive Policy Simulator state
  const [simAmount, setSimAmount] = useState(48000);
  const [simRetries, setSimRetries] = useState(1);
  const [simOptOut, setSimOptOut] = useState(false);
  const [simConfidence, setSimConfidence] = useState(85);

  const evaluatePolicy = () => {
    if (simOptOut) return { status: "BLOCKED", reason: "Customer explicit opt-out flag triggered STOP rule" };
    if (simAmount > 500000) return { status: "ESCALATION MANDATED", reason: "Amount strictly exceeds ₹5,00,000 threshold limit" };
    if (simRetries >= 2) return { status: "BLOCKED", reason: "Max retry limit (2/2 attempts) reached" };
    if (simConfidence < 50) return { status: "HUMAN REVIEW", reason: "Confidence below 50% safety guardrail floor" };
    return { status: "APPROVED", reason: "All 8 corporate recovery guardrails fully satisfied" };
  };

  const simResult = evaluatePolicy();

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">security</span>
          <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
            GOVERNANCE &bull; AUTONOMY BOUNDARIES
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
          Recovery Policy Engine
        </h1>
        <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
          Predefined control system governing the AI agent. Every autonomous intervention is evaluated against strict frequency caps, value ceilings, and customer protection guardrails.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {policies.map(pol => (
          <div key={pol.id} className="border border-border-low bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] text-primary font-bold">{pol.id}</span>
                <span className="font-mono text-[9px] px-2 py-0.5 border border-secondary/40 text-secondary bg-secondary/10 uppercase font-bold">
                  {pol.status}
                </span>
              </div>
              <h3 className="font-label-caps text-sm font-bold text-on-surface uppercase mb-1">
                {pol.rule}
              </h3>
              <div className="font-mono text-sm text-primary font-bold mb-2">
                {pol.value}
              </div>
              <p className="font-mono text-xs text-muted-slate">
                {pol.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Policy Simulator */}
      <div className="border border-border-low bg-surface p-6 md:p-8 mb-12">
        <div className="flex justify-between items-end mb-6 border-b border-border-low pb-4">
          <div>
            <div className="font-mono text-[10px] text-primary uppercase font-bold tracking-widest mb-1">
              GUARDRAILS INTERACTIVE VALIDATOR
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface uppercase">
              Simulate Case Against Policy Guardrails
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-slate">REAL-TIME EVALUATION</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono text-xs">
          {/* Controls Form */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-muted-slate uppercase text-[10px] mb-1">
                INVOICE / EXPOSURE AMOUNT (₹):
              </label>
              <input 
                type="number" 
                value={simAmount} 
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full bg-surface-container-lowest border border-border-low p-2.5 text-on-surface font-mono font-bold focus:border-primary focus:outline-none"
              />
              <span className="text-[10px] text-muted-slate mt-1 block">
                Rule: Amounts &gt; ₹5,00,000 immediately trigger mandatory human escalation.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-slate uppercase text-[10px] mb-1">
                  PREVIOUS ATTEMPTS:
                </label>
                <select 
                  value={simRetries} 
                  onChange={(e) => setSimRetries(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-border-low p-2.5 text-on-surface font-mono focus:border-primary focus:outline-none"
                >
                  <option value={0}>0 Attempts</option>
                  <option value={1}>1 Attempt</option>
                  <option value={2}>2 Attempts (Max Ceiling)</option>
                  <option value={3}>3 Attempts</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-slate uppercase text-[10px] mb-1">
                  AI CONFIDENCE SCORE (%):
                </label>
                <input 
                  type="number"
                  min="10"
                  max="99"
                  value={simConfidence} 
                  onChange={(e) => setSimConfidence(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-border-low p-2.5 text-on-surface font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox"
                id="optout"
                checked={simOptOut}
                onChange={(e) => setSimOptOut(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="optout" className="text-on-surface cursor-pointer text-xs">
                Customer has active dispute or SMS/email opt-out flag
              </label>
            </div>
          </div>

          {/* Validation Result Box */}
          <div className="lg:col-span-5 border border-border-low bg-surface-container-lowest p-6 flex flex-col justify-between">
            <div>
              <div className="text-muted-slate uppercase text-[10px] font-bold mb-2">
                POLICY ENGINE DETERMINATION:
              </div>
              <div className={`font-display text-2xl font-bold my-2 ${
                simResult.status === 'APPROVED' ? 'text-secondary' :
                simResult.status === 'ESCALATION MANDATED' ? 'text-primary' : 'text-error-red'
              }`}>
                {simResult.status}
              </div>
              <p className="text-muted-slate leading-relaxed mt-2">
                {simResult.reason}
              </p>
            </div>

            <div className="pt-4 border-t border-border-low/40 text-[10px] text-muted-slate flex justify-between">
              <span>EVALUATED AT:</span>
              <span className="text-on-surface font-bold">Just now</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
