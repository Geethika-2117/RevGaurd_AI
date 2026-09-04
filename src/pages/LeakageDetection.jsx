import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import StatusBadge from '../components/StatusBadge';

export default function LeakageDetection() {
  const { zones, cases, openCaseModal, openCustomerModal } = useRecovery();
  
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => {
    if (selectedZone !== 'ALL' && c.category_key !== selectedZone) return false;
    if (statusFilter !== 'ALL' && c.action_status !== statusFilter) return false;
    if (riskFilter === 'HIGH' && c.risk_score < 85) return false;
    if (riskFilter === 'MEDIUM' && (c.risk_score < 70 || c.risk_score >= 85)) return false;
    if (riskFilter === 'LOW' && c.risk_score >= 70) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.case_id.toLowerCase().includes(q) ||
        c.customer_name.toLowerCase().includes(q) ||
        c.root_cause.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">radar</span>
          <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
            REVENUE INTELLIGENCE &bull; VECTOR DETECTION
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
          Where is Money Leaking?
        </h1>
        <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
          Continuous anomaly detection identifying where capital slips through payment channels, checkout funnels, billing schedules, and B2B receivables.
        </p>
      </div>

      {/* 4 Major Leakage Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {zones.map(zone => {
          const isSelected = selectedZone === zone.id;
          return (
            <div 
              key={zone.id}
              onClick={() => setSelectedZone(isSelected ? 'ALL' : zone.id)}
              className={`border p-5 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-surface shadow-[0_0_25px_rgba(242,202,80,0.12)]' 
                  : 'border-border-low bg-surface hover:border-muted-slate'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-caps text-xs font-bold text-on-surface uppercase">
                  {zone.name}
                </span>
                <span className="font-mono text-[10px] text-primary font-bold">{zone.trend}</span>
              </div>

              <div className="font-metric text-3xl font-bold text-primary my-1">
                {zone.amount}
              </div>
              <div className="font-mono text-[10px] text-muted-slate uppercase mb-4">
                REVENUE AT RISK
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-border-low/40 pt-3 font-mono text-[10px]">
                <div>
                  <span className="text-muted-slate block">CASES</span>
                  <span className="text-on-surface font-bold">{zone.casesCount}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">AVG VAL</span>
                  <span className="text-on-surface font-bold">{zone.avgCaseValue}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">RECOV %</span>
                  <span className="text-secondary font-bold">{zone.recoveryProbability}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Matrix & Search Bar */}
      <div className="border border-border-low bg-surface p-4 mb-6 flex flex-wrap gap-4 justify-between items-center font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-slate text-[10px] uppercase font-bold">FILTERS:</span>
          
          <select 
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-surface-container-lowest border border-border-low text-on-surface px-3 py-1.5 focus:border-primary focus:outline-none"
          >
            <option value="ALL">ZONE: ALL (4 Vectors)</option>
            <option value="failed_payments">Failed Payments</option>
            <option value="checkout_abandonment">Checkout Abandonment</option>
            <option value="subscription_failures">Subscription Failures</option>
            <option value="overdue_receivables">Overdue Receivables</option>
          </select>

          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-surface-container-lowest border border-border-low text-on-surface px-3 py-1.5 focus:border-primary focus:outline-none"
          >
            <option value="ALL">RISK LEVEL: ALL</option>
            <option value="HIGH">HIGH (Score &gt; 85)</option>
            <option value="MEDIUM">MEDIUM (70 - 85)</option>
            <option value="LOW">LOW (&lt; 70)</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-lowest border border-border-low text-on-surface px-3 py-1.5 focus:border-primary focus:outline-none"
          >
            <option value="ALL">STATUS: ALL</option>
            <option value="RECOVERY READY">RECOVERY READY</option>
            <option value="ACTION EXECUTED">ACTION EXECUTED</option>
            <option value="AWAITING RESPONSE">AWAITING RESPONSE</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-slate text-sm">
            search
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH CASE / CUSTOMER..."
            className="bg-surface-container-lowest border border-border-low text-on-surface pl-8 pr-3 py-1.5 w-full focus:border-primary focus:outline-none placeholder-muted-slate"
          />
        </div>
      </div>

      {/* Leakage Cases Table */}
      <div className="border border-border-low bg-surface overflow-x-auto mb-12">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-low bg-surface-dim font-label-caps text-[10px] text-muted-slate uppercase tracking-wider">
              <th className="p-4">Case ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Leakage Type</th>
              <th className="p-4 text-right">Amount at Risk</th>
              <th className="p-4 text-center">Risk Score</th>
              <th className="p-4 text-center">Recov Prob</th>
              <th className="p-4 text-right">Expected Yield</th>
              <th className="p-4">Root Cause</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-muted-slate">
                  &gt; NO LEAKAGE CASES FOUND MATCHING SPECIFIED FILTER PARAMETERS
                </td>
              </tr>
            ) : (
              filteredCases.map(c => (
                <tr 
                  key={c.case_id}
                  className="border-b border-border-low/60 hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="p-4 font-bold text-primary">{c.case_id}</td>
                  <td 
                    onClick={() => openCustomerModal(c.customer_name)}
                    className="p-4 font-bold text-on-surface font-sans hover:text-primary cursor-pointer underline decoration-dotted"
                  >
                    {c.customer_name}
                  </td>
                  <td className="p-4 text-muted-slate text-[11px]">{c.leakage_type}</td>
                  <td className="p-4 text-right font-metric text-sm font-bold text-primary">
                    ₹{c.amount_at_risk.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-bold text-on-surface">{c.risk_score}</td>
                  <td className="p-4 text-center text-secondary font-bold">{c.recovery_probability}%</td>
                  <td className="p-4 text-right font-metric font-bold text-secondary">
                    ₹{c.expected_recovery.toLocaleString()}
                  </td>
                  <td className="p-4 text-muted-slate text-[11px] truncate max-w-[200px]" title={c.root_cause}>
                    {c.root_cause}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={c.action_status} />
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openCaseModal(c)}
                      className="border border-primary text-primary px-3 py-1 font-label-caps text-[10px] uppercase hover:bg-primary hover:text-background transition-all font-bold"
                    >
                      DIAGNOSE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
