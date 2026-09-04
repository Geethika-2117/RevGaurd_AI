import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import StatusBadge from '../components/StatusBadge';

export default function RecoveryGallery() {
  const navigate = useNavigate();
  const { 
    leakageCases, 
    setSelectedCaseId, 
    executeRecoveryAction, 
    escalateCaseToHuman, 
    stopCaseWorkflow 
  } = useRecovery();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseModal, setActiveCaseModal] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const categories = [
    { label: 'ALL CATEGORIES', value: 'ALL' },
    { label: 'Failed Payments', value: 'Failed Payments' },
    { label: 'Checkout Abandonment', value: 'Checkout Abandonment' },
    { label: 'Subscription Failures', value: 'Subscription Failures' },
    { label: 'Overdue Receivables', value: 'Overdue Receivables' }
  ];

  const statuses = [
    'ALL',
    'RECOVERY READY',
    'POLICY APPROVED',
    'ACTION EXECUTED',
    'AWAITING RESPONSE',
    'RECOVERED',
    'ESCALATED',
    'STOPPED'
  ];

  const filteredCases = leakageCases.filter(c => {
    if (categoryFilter !== 'ALL' && c.leakageType !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.customer.toLowerCase().includes(q) ||
        c.aiRecommendation.toLowerCase().includes(q) ||
        c.leakageType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenInvestigation = (caseItem) => {
    setActiveCaseModal(caseItem);
    setActionNotice(null);
  };

  const handleExecute = (caseId, actionName) => {
    executeRecoveryAction(caseId, actionName);
    const actionId = `ACT-${Math.floor(10000 + Math.random() * 90000)}`;
    setActionNotice({
      type: 'EXECUTE',
      actionId,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }) + " IST",
      channel: activeCaseModal?.channel || "API Gateway",
      msg: "Recovery action executed successfully. Telemetry committed to Audit Trail."
    });
    // Refresh modal with updated data
    const updated = leakageCases.find(c => c.id === caseId);
    if (updated) {
      setActiveCaseModal({
        ...updated,
        status: "ACTION EXECUTED",
        lastActionId: actionId
      });
    }
  };

  const handleEscalate = (caseId) => {
    escalateCaseToHuman(caseId, "Manual review requested from Investigation Modal");
    setActionNotice({
      type: 'ESCALATE',
      msg: "Case transferred to Human Escalation Queue [ESC-2031]. Finance desk notified."
    });
    const updated = leakageCases.find(c => c.id === caseId);
    if (updated) {
      setActiveCaseModal({
        ...updated,
        status: "ESCALATED"
      });
    }
  };

  const handleStop = (caseId) => {
    stopCaseWorkflow(caseId, "Operator triggered bounded workflow halt");
    setActionNotice({
      type: 'STOP',
      msg: "Workflow halted. All automated retries and scheduled reminders cancelled."
    });
    const updated = leakageCases.find(c => c.id === caseId);
    if (updated) {
      setActiveCaseModal({
        ...updated,
        status: "STOPPED"
      });
    }
  };

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header & Description */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border-low pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-sm">receipt_long</span>
            <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
              AUTONOMOUS LEAKAGE QUEUE
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
            Revenue Leakage Cases
          </h1>
          <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
            Prioritized revenue at risk across payments, carts, subscriptions, and receivables. Open any case for root cause analysis and policy-checked actions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/ledger')}
            className="btn-primary border border-border-low bg-surface px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-slate hover:text-primary hover:border-primary transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">gavel</span>
            AUDIT TRAIL &amp; ESCALATIONS
          </button>
        </div>
      </div>

      {/* Recovery Action Center — Quick Action Strip */}
      <section className="border border-border-low bg-surface p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">play_circle</span>
            <h3 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">
              Recovery Action Center
            </h3>
          </div>
          <span className="font-mono text-[10px] text-muted-slate uppercase">
            POLICY-APPROVED INTERVENTIONS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Action 1 */}
          <div className="border border-border-low bg-surface-container-lowest p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] text-primary font-bold">FAILED PAYMENTS</span>
                <span className="font-mono text-[9px] text-secondary border border-secondary/40 px-1.5 py-0.5">APPROVED</span>
              </div>
              <div className="font-bold text-sm text-on-surface mb-1">Payment Retry</div>
              <div className="font-mono text-[11px] text-muted-slate mb-3">
                Expected: <span className="text-secondary font-bold">₹18,500</span> &bull; 76% prob
              </div>
            </div>
            <button 
              onClick={() => handleExecute("REC-10487", "Payment Retry via Secondary Acquirer")}
              className="btn-primary border border-primary text-primary py-2 font-label-caps text-[10px] uppercase hover:bg-primary hover:text-background transition-all font-bold"
            >
              EXECUTE RETRY
            </button>
          </div>

          {/* Quick Action 2 */}
          <div className="border border-border-low bg-surface-container-lowest p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] text-primary font-bold">RECEIVABLES</span>
                <span className="font-mono text-[9px] text-secondary border border-secondary/40 px-1.5 py-0.5">APPROVED</span>
              </div>
              <div className="font-bold text-sm text-on-surface mb-1">Payment Reminder</div>
              <div className="font-mono text-[11px] text-muted-slate mb-3">
                Expected: <span className="text-secondary font-bold">₹39,360</span> &bull; 82% prob
              </div>
            </div>
            <button 
              onClick={() => handleExecute("REC-10482", "Send Payment Reminder")}
              className="btn-primary border border-primary text-primary py-2 font-label-caps text-[10px] uppercase hover:bg-primary hover:text-background transition-all font-bold"
            >
              SEND REMINDER
            </button>
          </div>

          {/* Quick Action 3 */}
          <div className="border border-border-low bg-surface-container-lowest p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] text-primary font-bold">CHECKOUT</span>
                <span className="font-mono text-[9px] text-secondary border border-secondary/40 px-1.5 py-0.5">APPROVED</span>
              </div>
              <div className="font-bold text-sm text-on-surface mb-1">Dynamic Payment Link</div>
              <div className="font-mono text-[11px] text-muted-slate mb-3">
                Expected: <span className="text-secondary font-bold">₹8,875</span> &bull; 71% prob
              </div>
            </div>
            <button 
              onClick={() => handleExecute("REC-10484", "Send Dynamic Payment Link")}
              className="btn-primary border border-primary text-primary py-2 font-label-caps text-[10px] uppercase hover:bg-primary hover:text-background transition-all font-bold"
            >
              DISPATCH LINK
            </button>
          </div>

          {/* Quick Action 4 */}
          <div className="border border-border-low bg-surface-container-lowest p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] text-primary font-bold">SUBSCRIPTIONS</span>
                <span className="font-mono text-[9px] text-secondary border border-secondary/40 px-1.5 py-0.5">APPROVED</span>
              </div>
              <div className="font-bold text-sm text-on-surface mb-1">Method Update Request</div>
              <div className="font-mono text-[11px] text-muted-slate mb-3">
                Expected: <span className="text-secondary font-bold">₹27,018</span> &bull; 79% prob
              </div>
            </div>
            <button 
              onClick={() => handleExecute("REC-10485", "Request Payment Method Update")}
              className="btn-primary border border-primary text-primary py-2 font-label-caps text-[10px] uppercase hover:bg-primary hover:text-background transition-all font-bold"
            >
              REQUEST UPDATE
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-stretch lg:items-center">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`font-mono text-[11px] px-3 py-2 border transition-all ${
                categoryFilter === cat.value
                  ? 'border-primary bg-primary text-background font-bold'
                  : 'border-border-low bg-surface text-muted-slate hover:text-on-surface hover:border-muted-slate'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown & Search Input */}
        <div className="flex gap-2 items-center">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border-low text-muted-slate font-mono text-[11px] px-3 py-2 focus:border-primary focus:outline-none rounded-none"
          >
            {statuses.map(st => (
              <option key={st} value={st}>STATUS: {st}</option>
            ))}
          </select>

          <div className="relative flex-grow sm:flex-grow-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-slate text-sm">
              search
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH CASE / CUSTOMER..."
              className="bg-surface border border-border-low text-on-surface font-mono text-[11px] pl-9 pr-3 py-2 focus:border-primary focus:outline-none rounded-none w-full sm:w-56 placeholder-muted-slate"
            />
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="border border-border-low bg-surface overflow-x-auto mb-12">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-low bg-surface-dim font-label-caps text-[10px] text-muted-slate uppercase tracking-wider">
              <th className="p-4">Case ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Leakage Type</th>
              <th className="p-4 text-right">Amount at Risk</th>
              <th className="p-4 text-center">Risk</th>
              <th className="p-4 text-center">Prob</th>
              <th className="p-4 text-right">Expected Recovery</th>
              <th className="p-4">AI Recommendation</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-muted-slate">
                  &gt; NO REVENUE LEAKAGE CASES FOUND MATCHING FILTERS
                </td>
              </tr>
            ) : (
              filteredCases.map(c => (
                <tr 
                  key={c.id} 
                  className="border-b border-border-low/60 hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="p-4 font-bold text-primary">{c.id}</td>
                  <td className="p-4 font-bold text-on-surface font-sans">{c.customer}</td>
                  <td className="p-4 text-muted-slate text-[11px]">{c.leakageType}</td>
                  <td className="p-4 text-right font-metric text-sm font-bold text-on-surface">
                    ₹{c.amountAtRisk.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-bold text-primary">{c.riskScore}</td>
                  <td className="p-4 text-center text-secondary font-bold">{c.recoveryProbability}%</td>
                  <td className="p-4 text-right font-metric font-bold text-secondary">
                    ₹{c.expectedRecovery.toLocaleString()}
                  </td>
                  <td className="p-4 text-on-surface text-[11px] truncate max-w-[180px]">
                    {c.aiRecommendation}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenInvestigation(c)}
                      className="border border-primary text-primary px-3 py-1 font-label-caps text-[10px] uppercase hover:bg-primary hover:text-background transition-all"
                    >
                      INVESTIGATE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Case Investigation / Detail Modal */}
      {activeCaseModal && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/95 flex items-center justify-center p-4 backdrop-blur-md animate-fadeInUp">
          <div className="bg-surface border border-primary w-full max-w-3xl flex flex-col relative shadow-[0_0_50px_rgba(242,202,80,0.15)] max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border-low flex justify-between items-start bg-surface-dim">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">
                    AI AGENT INVESTIGATION DOSSIER
                  </span>
                  <StatusBadge status={activeCaseModal.status} />
                </div>
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  {activeCaseModal.customer} &mdash; <span className="text-primary">{activeCaseModal.id}</span>
                </h2>
              </div>
              <button 
                onClick={() => setActiveCaseModal(null)}
                className="text-muted-slate hover:text-primary transition-colors p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
              
              {/* Financial Risk Header Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest p-4 border border-border-low">
                <div>
                  <div className="text-[10px] text-muted-slate uppercase font-semibold">REVENUE AT RISK</div>
                  <div className="font-metric text-xl font-bold text-primary mt-0.5">
                    ₹{activeCaseModal.amountAtRisk.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-slate uppercase font-semibold">RISK SCORE</div>
                  <div className="font-metric text-xl font-bold text-on-surface mt-0.5">
                    {activeCaseModal.riskScore} <span className="text-xs text-muted-slate font-normal">/ 100</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-slate uppercase font-semibold">RECOVERY PROBABILITY</div>
                  <div className="font-metric text-xl font-bold text-secondary mt-0.5">
                    {activeCaseModal.recoveryProbability}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-slate uppercase font-semibold">EXPECTED YIELD</div>
                  <div className="font-metric text-xl font-bold text-secondary mt-0.5">
                    ₹{activeCaseModal.expectedRecovery.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Execution Notice */}
              {actionNotice && (
                <div className="p-4 border border-secondary bg-secondary/10 text-secondary space-y-1">
                  <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {actionNotice.msg}
                  </div>
                  {actionNotice.actionId && (
                    <div className="text-[10px] text-on-surface">
                      Action ID: <span className="text-primary font-bold">{actionNotice.actionId}</span> &bull; 
                      Timestamp: {actionNotice.time} &bull; 
                      Channel: {actionNotice.channel} &bull; 
                      Status: <span className="text-secondary font-bold">AWAITING RESPONSE</span>
                    </div>
                  )}
                </div>
              )}

              {/* Root Cause Analysis */}
              <div className="border border-border-low bg-surface-container-lowest p-4">
                <div className="font-label-caps text-xs text-primary font-bold mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">analytics</span>
                  ROOT CAUSE ANALYSIS
                </div>
                <div className="space-y-1.5 text-muted-slate">
                  <p><strong className="text-on-surface">Observation:</strong> {activeCaseModal.rootCauseAnalysis.summary}</p>
                  <p><strong className="text-on-surface">Historical Behavior:</strong> {activeCaseModal.rootCauseAnalysis.historicalBehavior}</p>
                  <p><strong className="text-on-surface">Current Deviation:</strong> <span className="text-error-red">{activeCaseModal.rootCauseAnalysis.currentDeviation}</span></p>
                  <p><strong className="text-on-surface">AI Assessment:</strong> <span className="text-secondary">{activeCaseModal.rootCauseAnalysis.aiAssessment}</span></p>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="border border-border-low bg-surface-container-lowest p-4">
                <div className="font-label-caps text-xs text-primary font-bold mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  AI AGENT RECOMMENDATION
                </div>
                <div className="font-bold text-on-surface text-sm mb-2">
                  Recommended Action: <span className="text-primary">{activeCaseModal.aiRecommendationDetails.action}</span>
                </div>
                <ul className="space-y-1 text-muted-slate list-disc list-inside">
                  {activeCaseModal.aiRecommendationDetails.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Policy Check */}
              <div className="border border-border-low bg-surface-container-lowest p-4">
                <div className="font-label-caps text-xs text-primary font-bold mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  POLICY &amp; GUARDRAILS CHECK
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCaseModal.policyChecks.map((pc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border border-border-low/60 bg-surface">
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

              {/* Telemetry Logs */}
              <div>
                <div className="font-label-caps text-[11px] text-muted-slate mb-2">CASE TELEMETRY LOGS</div>
                <div className="bg-surface-container-lowest p-3 border border-border-low font-mono text-[10px] text-muted-slate space-y-1">
                  {activeCaseModal.logs.map((log, i) => (
                    <p key={i} className={log.includes("recovered") ? "text-secondary font-bold" : ""}>{log}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Action Controls */}
            <div className="p-6 border-t border-border-low flex flex-wrap justify-between items-center gap-4 bg-surface-dim">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStop(activeCaseModal.id)}
                  disabled={activeCaseModal.status === 'STOPPED'}
                  className="border border-border-low text-muted-slate hover:text-error-red hover:border-error-red px-4 py-2 font-mono text-xs uppercase transition-all disabled:opacity-40"
                >
                  STOP WORKFLOW
                </button>
                <button 
                  onClick={() => handleEscalate(activeCaseModal.id)}
                  disabled={activeCaseModal.status === 'ESCALATED'}
                  className="border border-error-red/60 text-error-red hover:bg-error-red/10 px-4 py-2 font-mono text-xs uppercase transition-all disabled:opacity-40"
                >
                  ESCALATE TO FINANCE
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveCaseModal(null)}
                  className="border border-border-low px-4 py-2 font-mono text-xs uppercase text-muted-slate hover:text-on-surface"
                >
                  CLOSE
                </button>
                <button 
                  onClick={() => handleExecute(activeCaseModal.id, activeCaseModal.aiRecommendation)}
                  className="btn-primary border border-primary text-background bg-primary px-6 py-2 font-mono text-xs font-bold uppercase hover:bg-primary-container transition-all"
                >
                  EXECUTE RECOVERY ACTION
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
