import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function CustomerRisk() {
  const { customers, openCustomerModal, openCaseModal } = useRecovery();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-sm">person_alert</span>
            <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
              REVENUE INTELLIGENCE &bull; CLIENT PORTFOLIO
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
            Customer Risk &amp; LTV
          </h1>
          <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
            Customer-centric risk modeling: Evaluating historical payment behaviors, lifetime value (LTV), and relationship sensitivity to guide non-destructive autonomous recovery.
          </p>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-slate text-sm">
            search
          </span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH CUSTOMER..."
            className="bg-surface border border-border-low text-on-surface font-mono text-xs pl-9 pr-3 py-2 w-64 focus:border-primary focus:outline-none placeholder-muted-slate"
          />
        </div>
      </div>

      {/* Customer Risk Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filtered.map(cust => (
          <div 
            key={cust.customer_id}
            className="border border-border-low bg-surface p-6 flex flex-col justify-between hover:border-primary transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] text-primary font-bold">{cust.customer_id}</span>
                <span className="font-mono text-[9px] px-2 py-0.5 border border-border-low bg-surface-container-lowest text-muted-slate uppercase">
                  {cust.segment}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                {cust.name}
              </h3>

              <div className="grid grid-cols-2 gap-3 my-4 bg-surface-container-lowest p-3 border border-border-low/60 font-mono">
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">REVENUE AT RISK</span>
                  <span className="font-metric text-lg font-bold text-primary">{cust.revenueAtRisk}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">LIFETIME VALUE</span>
                  <span className="font-metric text-lg font-bold text-on-surface">{cust.ltv}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">RISK SCORE</span>
                  <span className="font-metric text-base font-bold text-on-surface">{cust.riskScore}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">RECOV PROB</span>
                  <span className="font-metric text-base font-bold text-secondary">{cust.recoveryProbability}%</span>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs text-muted-slate mb-4">
                <div>
                  <strong className="text-on-surface">Payment Behavior:</strong>
                  <div className="text-primary mt-0.5">{cust.paymentBehavior}</div>
                </div>
                <div>
                  <strong className="text-on-surface">Average Days to Pay:</strong> {cust.avgDaysToPay} days
                </div>
                <div>
                  <strong className="text-on-surface">AI Recommended Action:</strong>
                  <div className="text-secondary font-bold mt-0.5">{cust.recommendedAction}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border-low/40">
              <button 
                onClick={() => openCustomerModal(cust)}
                className="w-full border border-border-low py-2 font-mono text-xs uppercase text-on-surface hover:border-primary hover:text-primary transition-all text-center"
              >
                VIEW PROFILE &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
