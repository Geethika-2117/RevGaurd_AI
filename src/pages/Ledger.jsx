import React, { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import TerminalPanel from '../components/TerminalPanel';
import StatusBadge from '../components/StatusBadge';

export default function Ledger() {
  const { auditTrail, escalations } = useRecovery();
  const [expandedRow, setExpandedRow] = useState(null);
  const [verificationLogs, setVerificationLogs] = useState([]);
  const [activeEscalationModal, setActiveEscalationModal] = useState(null);
  const [resolvedEscalations, setResolvedEscalations] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  const toggleRow = (idx) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  const handleVerifyHash = (item, e) => {
    e.stopPropagation();
    const newLogs = [
      `> VERIFYING MERKLE LEAF: ${item.caseId}`,
      `> TIMESTAMP: ${item.timestamp}`,
      `> HASH: ${item.hash}`,
      `> POLICY CHECK: ${item.policyResult}`,
      `> STATUS: CRYPTOGRAPHICALLY VALID [SOC2 & RBI COMPLIANT]`
    ];
    setVerificationLogs(newLogs);
  };

  const handleResolveEscalation = (escId) => {
    setResolvedEscalations(prev => [...prev, escId]);
    setVerificationLogs([
      `> HUMAN ESCALATION RESOLVED: ${escId}`,
      `> AUTHORIZED BY: Chief Financial Officer`,
      `> TERMS: Customized payment restructure approved`,
      `> AUDIT LOG COMMITTED: SUCCESS`
    ]);
    setActiveEscalationModal(null);
  };

  const filteredAudit = auditTrail.filter(item => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.caseId.toLowerCase().includes(q) ||
      item.event.toLowerCase().includes(q) ||
      item.aiDecision.toLowerCase().includes(q) ||
      item.action.toLowerCase().includes(q) ||
      item.policyResult.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-168px)] w-full select-none">
      {/* Left Main Ledger & Escalation View */}
      <div className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto">
        
        {/* Ledger Header */}
        <div className="mb-8 border-b border-border-low pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-sm">gavel</span>
              <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
                IMMUTABLE AUDIT TRAIL
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface uppercase">
              Audit Trail &amp; Escalations
            </h1>
            <p className="font-body-md text-xs md:text-sm text-muted-slate mt-1 max-w-xl">
              Chronological log of every autonomous AI decision, policy evaluation, executed recovery action, and human escalation.
            </p>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-slate text-sm">
              search
            </span>
            <input 
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="SEARCH AUDIT LOGS..."
              className="bg-surface border border-border-low text-on-surface font-mono text-[11px] pl-9 pr-3 py-2 focus:border-primary focus:outline-none rounded-none w-56 placeholder-muted-slate"
            />
          </div>
        </div>

        {/* Section 1: Immutable AI Audit Trail */}
        <div className="border border-border-low bg-surface overflow-x-auto mb-10">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-low bg-surface-dim font-label-caps text-[10px] text-muted-slate uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Case ID</th>
                <th className="p-4">Event</th>
                <th className="p-4">AI Decision</th>
                <th className="p-4 text-center">Policy Result</th>
                <th className="p-4">Action</th>
                <th className="p-4 text-center">Outcome</th>
                <th className="p-4 text-right">Recovered</th>
                <th className="p-4 text-right">Proof</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudit.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-muted-slate">
                    &gt; NO AUDIT LOGS MATCHING SEARCH QUERY
                  </td>
                </tr>
              ) : (
                filteredAudit.map((item, idx) => {
                  const isExpanded = expandedRow === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr 
                        onClick={() => toggleRow(idx)}
                        className={`border-b border-border-low/60 hover:bg-surface-container-lowest transition-colors cursor-pointer ${
                          isExpanded ? 'bg-surface-container-low' : ''
                        }`}
                      >
                        <td className="p-4 text-muted-slate">{item.timestamp}</td>
                        <td className="p-4 font-bold text-primary">{item.caseId}</td>
                        <td className="p-4 font-bold text-on-surface">{item.event}</td>
                        <td className="p-4 text-muted-slate text-[11px] truncate max-w-[150px]">
                          {item.aiDecision}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 font-label-caps text-[9px] border ${
                            item.policyResult.includes('APPROVED') || item.policyResult.includes('COMPLIANT')
                              ? 'text-secondary border-secondary/40 bg-secondary/10'
                              : 'text-primary border-primary/40 bg-primary/10'
                          }`}>
                            {item.policyResult}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface text-[11px] truncate max-w-[150px]">
                          {item.action}
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={item.outcome} />
                        </td>
                        <td className="p-4 text-right font-metric font-bold text-secondary">
                          {item.revenueRecovered}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={(e) => handleVerifyHash(item, e)}
                            className="border border-border-low text-muted-slate hover:border-primary hover:text-primary px-2.5 py-1 text-[10px] uppercase font-mono transition-colors"
                          >
                            VERIFY
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Row with Raw Decision Telemetry */}
                      {isExpanded && (
                        <tr className="bg-surface-container-lowest border-b border-border-low">
                          <td colSpan="9" className="p-4 space-y-2 font-mono text-[11px] text-muted-slate">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border-low/40 pb-2">
                              <div>
                                <span className="text-primary font-bold">SHA-256 HASH:</span>{' '}
                                <span className="text-on-surface select-all break-all">{item.hash}</span>
                              </div>
                              <span className="text-[10px] text-secondary font-bold uppercase">
                                Cryptographically Signed &bull; Immutable
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                              <div>
                                <span className="text-muted-slate block">EVENT CONTEXT:</span>
                                <span className="text-on-surface font-semibold">{item.event}</span>
                              </div>
                              <div>
                                <span className="text-muted-slate block">AI INTERVENTION LOGIC:</span>
                                <span className="text-on-surface font-semibold">{item.aiDecision}</span>
                              </div>
                              <div>
                                <span className="text-muted-slate block">POLICY VALIDATION RESULT:</span>
                                <span className="text-secondary font-semibold">{item.policyResult}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Human Escalation Queue */}
        <section className="border border-border-low bg-surface p-6 mb-8">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error-red text-lg">supervised_user_circle</span>
              <h2 className="font-display text-xl font-bold text-on-surface uppercase tracking-tight">
                Human Escalation Queue
              </h2>
            </div>
            <span className="font-mono text-[10px] text-error-red border border-error-red/40 px-2 py-0.5 bg-error-red/10 font-bold uppercase">
              HIGH-VALUE &bull; POLICY RESTRICTED
            </span>
          </div>

          <p className="font-mono text-xs text-muted-slate mb-6">
            Cases where automation is bounded or disallowed (e.g. invoices &gt; ₹5,00,000, legal disputes, explicit opt-outs). Requires executive authorization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {escalations.map(esc => {
              const isResolved = resolvedEscalations.includes(esc.id);
              return (
                <div 
                  key={esc.id} 
                  className={`border p-5 flex flex-col justify-between transition-all ${
                    isResolved 
                      ? 'border-secondary/40 bg-secondary/5 opacity-60' 
                      : 'border-border-low bg-surface-container-lowest hover:border-primary'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] font-bold text-primary">{esc.id}</span>
                      <span className={`font-mono text-[9px] px-2 py-0.5 border ${
                        isResolved 
                          ? 'border-secondary text-secondary' 
                          : esc.priority === 'CRITICAL' 
                          ? 'border-error-red text-error-red bg-error-red/10 font-bold' 
                          : 'border-primary text-primary'
                      }`}>
                        {isResolved ? 'RESOLVED' : esc.priority}
                      </span>
                    </div>

                    <div className="font-bold text-base text-on-surface mb-1">
                      {esc.customer}
                    </div>

                    <div className="font-metric text-2xl font-bold text-error-red mb-2">
                      {esc.amountAtRisk}
                    </div>

                    <div className="space-y-1 font-mono text-[10px] text-muted-slate mb-4">
                      <div><strong className="text-on-surface">Overdue:</strong> {esc.overdueDays}</div>
                      <div><strong className="text-on-surface">Reason:</strong> {esc.reason}</div>
                      <div><strong className="text-on-surface">Assigned To:</strong> {esc.assignedTo}</div>
                    </div>
                  </div>

                  <div>
                    {isResolved ? (
                      <div className="text-center font-mono text-[10px] text-secondary font-bold py-2 border border-secondary/20">
                        &check; RESOLVED BY FINANCE
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveEscalationModal(esc)}
                        className="w-full border border-primary text-primary py-2 font-mono text-xs uppercase hover:bg-primary hover:text-background transition-all font-bold"
                      >
                        REVIEW CASE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Right Compliance & Telemetry Terminal Panel */}
      <TerminalPanel verificationLogs={verificationLogs} />

      {/* Escalation Review Modal */}
      {activeEscalationModal && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/95 flex items-center justify-center p-4 backdrop-blur-md animate-fadeInUp">
          <div className="bg-surface border border-error-red w-full max-w-lg p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex justify-between items-start mb-4 border-b border-border-low pb-3">
              <div>
                <span className="font-mono text-[10px] text-error-red uppercase font-bold tracking-widest">
                  EXECUTIVE HUMAN REVIEW
                </span>
                <h3 className="font-display text-xl font-bold text-on-surface">
                  {activeEscalationModal.customer} ({activeEscalationModal.id})
                </h3>
              </div>
              <button 
                onClick={() => setActiveEscalationModal(null)}
                className="text-muted-slate hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="font-mono text-xs space-y-3 mb-6">
              <div className="p-3 border border-border-low bg-surface-container-lowest">
                <div className="text-muted-slate text-[10px]">TOTAL VALUE ESCALATED:</div>
                <div className="font-metric text-2xl font-bold text-error-red">{activeEscalationModal.amountAtRisk}</div>
              </div>
              <div><strong className="text-on-surface">Policy Trigger:</strong> {activeEscalationModal.reason}</div>
              <div><strong className="text-on-surface">Days Overdue:</strong> {activeEscalationModal.overdueDays}</div>
              <div><strong className="text-on-surface">Assigned Executive:</strong> {activeEscalationModal.assignedTo}</div>
              <p className="text-muted-slate text-[11px] leading-relaxed pt-2">
                Company policy strictly restricts automated retries or programmatic collection workflows on enterprise accounts above ₹5,00,000. Authorize manual payment restructuring below.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-border-low pt-4">
              <button 
                onClick={() => setActiveEscalationModal(null)}
                className="border border-border-low px-4 py-2 font-mono text-xs uppercase text-muted-slate hover:text-on-surface"
              >
                CANCEL
              </button>
              <button 
                onClick={() => handleResolveEscalation(activeEscalationModal.id)}
                className="border border-secondary bg-secondary text-background font-mono text-xs font-bold px-5 py-2 uppercase hover:bg-secondary/90 transition-all"
              >
                AUTHORIZE &amp; RESOLVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
