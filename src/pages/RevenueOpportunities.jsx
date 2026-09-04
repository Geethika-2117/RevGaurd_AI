import React from 'react';
import { useRecovery } from '../context/RecoveryContext';
import StatusBadge from '../components/StatusBadge';

export default function RevenueOpportunities() {
  const { cases, openCaseModal, executeRecoveryAction, openCustomerModal } = useRecovery();

  // Sort strictly by Expected Recovery Value = Amount at Risk * (Recovery Probability / 100) descending
  const sortedOpportunities = [...cases].sort((a, b) => b.expected_recovery - a.expected_recovery);

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
              REVENUE INTELLIGENCE &bull; PRIORITY QUEUE
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
            Recovery Opportunities
          </h1>
          <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
            Intelligent prioritization: "What should the AI recover first?" Opportunities ranked mathematically by Expected Yield rather than raw face value.
          </p>
        </div>

        {/* Formula Box */}
        <div className="border border-border-low bg-surface p-3 font-mono text-[11px]">
          <span className="text-muted-slate block text-[9px] uppercase font-bold">PRIORITIZATION FORMULA:</span>
          <span className="text-primary font-bold">Expected Yield = Amount at Risk &times; Recovery Probability</span>
        </div>
      </div>

      {/* Priority Queue Cards */}
      <div className="space-y-4 mb-12">
        {sortedOpportunities.map((opp, idx) => {
          const rankNumber = String(idx + 1).padStart(2, '0');
          const isTopTier = idx < 3;

          return (
            <div 
              key={opp.case_id}
              className={`border bg-surface p-5 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group hover:border-primary ${
                isTopTier ? 'border-primary/60 shadow-[0_0_20px_rgba(242,202,80,0.06)]' : 'border-border-low'
              }`}
            >
              {/* Rank & Customer Profile Info */}
              <div className="flex items-start gap-4">
                <div className={`font-mono text-xl md:text-2xl font-bold p-3 border text-center min-w-[56px] ${
                  isTopTier ? 'border-primary text-primary bg-primary/5' : 'border-border-low text-muted-slate bg-surface-container-lowest'
                }`}>
                  #{rankNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-primary font-bold">{opp.case_id}</span>
                    <span className="text-muted-slate">&bull;</span>
                    <span className="font-mono text-[10px] text-muted-slate uppercase">{opp.leakage_type}</span>
                    <StatusBadge status={opp.action_status} />
                  </div>
                  <h3 
                    onClick={() => openCustomerModal(opp.customer_name)}
                    className="font-display text-xl font-bold text-on-surface hover:text-primary cursor-pointer transition-colors"
                  >
                    {opp.customer_name}
                  </h3>
                  <p className="font-mono text-xs text-muted-slate mt-0.5 max-w-xl">
                    Recommended: <strong className="text-on-surface">{opp.recommended_action}</strong> &bull; {opp.channel}
                  </p>
                </div>
              </div>

              {/* Mathematical Values Breakdown */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 font-mono text-left w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-border-low/40 pt-3 lg:pt-0">
                <div>
                  <span className="text-muted-slate block text-[10px] uppercase font-semibold">AMOUNT AT RISK</span>
                  <div className="font-metric text-lg font-bold text-on-surface">
                    ₹{opp.amount_at_risk.toLocaleString()}
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-muted-slate block text-[10px] uppercase font-semibold">RECOV PROB</span>
                  <div className="font-metric text-lg font-bold text-secondary">
                    {opp.recovery_probability}%
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-primary block text-[10px] uppercase font-bold tracking-wider">EXPECTED RECOVERY</span>
                  <div className="font-metric text-2xl font-bold text-secondary">
                    ₹{opp.expected_recovery.toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => openCaseModal(opp)}
                    className="border border-border-low bg-surface-container-lowest hover:border-primary text-on-surface hover:text-primary px-3 py-2 font-mono text-xs uppercase"
                  >
                    DOSSIER
                  </button>
                  <button 
                    onClick={() => executeRecoveryAction(opp.case_id, opp.recommended_action)}
                    disabled={opp.action_status === 'RECOVERED' || opp.action_status === 'ACTION EXECUTED'}
                    className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-4 py-2 font-mono text-xs uppercase font-bold disabled:opacity-40"
                  >
                    RECOVER
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
