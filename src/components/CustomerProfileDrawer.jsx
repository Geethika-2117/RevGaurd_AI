import React from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function CustomerProfileDrawer() {
  const { activeCustomerModal, closeCustomerModal, openCaseModal, cases } = useRecovery();

  if (!activeCustomerModal) return null;

  const customerCases = cases.filter(c => c.customer_name === activeCustomerModal.name || c.customer_id === activeCustomerModal.customer_id);

  return (
    <div className="fixed inset-0 z-[120] bg-surface-dim/95 flex justify-end backdrop-blur-sm animate-fadeInUp select-none">
      <div className="bg-surface border-l border-border-low w-full max-w-lg h-full flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-border-low bg-surface-dim flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">
                CUSTOMER RISK PROFILE &bull; {activeCustomerModal.customer_id}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {activeCustomerModal.name}
            </h2>
            <span className="font-mono text-[11px] text-muted-slate uppercase">
              {activeCustomerModal.segment}
            </span>
          </div>
          <button 
            onClick={closeCustomerModal}
            className="text-muted-slate hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest p-4 border border-border-low">
            <div>
              <span className="text-[10px] text-muted-slate uppercase">LIFETIME VALUE (LTV)</span>
              <div className="font-metric text-xl font-bold text-on-surface mt-0.5">
                {activeCustomerModal.ltv}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-slate uppercase">REVENUE AT RISK</span>
              <div className="font-metric text-xl font-bold text-primary mt-0.5">
                {activeCustomerModal.revenueAtRisk}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-slate uppercase">RISK SCORE</span>
              <div className="font-metric text-xl font-bold text-on-surface mt-0.5">
                {activeCustomerModal.riskScore} <span className="text-xs text-muted-slate font-normal">/ 100</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-slate uppercase">RECOVERY PROBABILITY</span>
              <div className="font-metric text-xl font-bold text-secondary mt-0.5">
                {activeCustomerModal.recoveryProbability}%
              </div>
            </div>
          </div>

          {/* Historical Payment Behavior */}
          <div className="border border-border-low bg-surface-container-lowest p-4">
            <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">history</span>
              PAYMENT BEHAVIOR PROFILE
            </div>
            <div className="space-y-1.5 text-muted-slate">
              <p><strong className="text-on-surface">Classification:</strong> {activeCustomerModal.paymentBehavior}</p>
              <p><strong className="text-on-surface">Average Days to Pay:</strong> {activeCustomerModal.avgDaysToPay} days</p>
              <p><strong className="text-on-surface">Recommended Action:</strong> <span className="text-secondary font-bold">{activeCustomerModal.recommendedAction}</span></p>
            </div>
          </div>

          {/* Open Cases Drill-Down */}
          <div>
            <div className="font-mono text-[10px] text-muted-slate uppercase font-bold mb-2">
              ACTIVE REVENUE LEAKAGE CASES ({customerCases.length})
            </div>
            <div className="space-y-2">
              {customerCases.map(c => (
                <div 
                  key={c.case_id}
                  onClick={() => {
                    closeCustomerModal();
                    openCaseModal(c);
                  }}
                  className="p-3 border border-border-low bg-surface-container-lowest hover:border-primary cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold text-primary group-hover:text-on-surface">{c.case_id}</div>
                    <div className="text-[10px] text-muted-slate">{c.leakage_type} &bull; {c.days_overdue} overdue</div>
                  </div>
                  <div className="text-right">
                    <div className="font-metric font-bold text-primary">₹{c.amount_at_risk.toLocaleString()}</div>
                    <div className="text-[9px] text-secondary">{c.recovery_probability}% prob</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-low bg-surface-dim flex justify-between items-center">
          <span className="font-mono text-[10px] text-muted-slate">CUSTOMER PROFILE SYNCED</span>
          <button 
            onClick={closeCustomerModal}
            className="btn-primary border border-border-low text-on-surface hover:border-primary hover:text-primary px-4 py-2 font-mono text-xs uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
