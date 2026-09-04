import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function Approvals() {
  const { 
    pendingApprovals, 
    approveRecovery, 
    rejectRecovery, 
    recoverCase,
    openCaseModal, 
    cases,
    refreshData 
  } = useRecovery();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const [processingId, setProcessingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const canAuthorize = user?.role === 'ADMIN' || user?.role === 'FINANCE_MANAGER';

  const totalPendingAmount = pendingApprovals.reduce((acc, curr) => acc + (curr.amount_at_risk || 0), 0);

  const handleApprove = async (item) => {
    setProcessingId(item.action_id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await approveRecovery(item.action_id, `Authorized by ${user?.name} (${user?.role})`);
      setActionSuccess(`Case #${item.case_id} (${item.customer_name}) approved for recovery.`);
      await refreshData();
    } catch (err) {
      setActionError(`Approval failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item) => {
    setProcessingId(item.action_id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await rejectRecovery(item.action_id, `Declined by ${user?.name} (${user?.role})`);
      setActionSuccess(`Case #${item.case_id} (${item.customer_name}) recovery rejected.`);
      await refreshData();
    } catch (err) {
      setActionError(`Rejection failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecute = async (caseId, recommendedAction) => {
    setProcessingId(caseId);
    setActionError(null);
    try {
      await recoverCase(caseId, recommendedAction);
      setActionSuccess(`Recovery action started for Case #${caseId}.`);
      await refreshData();
    } catch (err) {
      setActionError(`Execution failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleInspectCase = (caseId) => {
    const fullCase = cases.find(c => c.id === caseId);
    if (fullCase) {
      openCaseModal(fullCase);
    }
  };

  return (
    <div className="p-6 md:p-12 w-full max-w-6xl mx-auto space-y-8 animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="border-b border-border-low pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
            GOVERNANCE &bull; {user?.organization_name}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Finance Approvals
          </h1>
          <p className="text-muted-slate text-sm mt-1">
            High-value cases (above ₹5,00,000) requiring authoritative finance authorization.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            canAuthorize ? 'bg-secondary/10 border-secondary/40 text-secondary' : 'bg-surface border-border-low text-muted-slate'
          }`}>
            <span className={`w-2 h-2 rounded-full ${canAuthorize ? 'bg-secondary' : 'bg-muted-slate'}`}></span>
            <span>ROLE: {user?.role || "ANALYST"}</span>
            <span className="text-[10px]">({canAuthorize ? "Authorized to Approve" : "Read-Only"})</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center justify-between animate-fadeInUp">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="hover:text-on-surface">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center justify-between animate-fadeInUp">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="hover:text-on-surface">✕</button>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="border border-border-low bg-surface p-5">
          <span className="text-xs text-muted-slate uppercase block font-bold">PENDING APPROVALS</span>
          <div className="font-metric text-3xl font-bold text-primary mt-1">
            {pendingApprovals.length} {pendingApprovals.length === 1 ? 'Case' : 'Cases'}
          </div>
          <span className="text-[10px] text-muted-slate block mt-1">Awaiting manager sign-off</span>
        </div>

        <div className="border border-border-low bg-surface p-5">
          <span className="text-xs text-muted-slate uppercase block font-bold">EXPOSURE IN QUEUE</span>
          <div className="font-metric text-3xl font-bold text-on-surface mt-1">
            ₹{totalPendingAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-muted-slate block mt-1">Total revenue awaiting release</span>
        </div>

        <div className="border border-border-low bg-surface p-5">
          <span className="text-xs text-muted-slate uppercase block font-bold">AUTOMATION CEILING</span>
          <div className="font-metric text-3xl font-bold text-secondary mt-1">
            ₹5,00,000
          </div>
          <span className="text-[10px] text-muted-slate block mt-1">Cases above this require human sign-off</span>
        </div>
      </div>

      {/* Role Explanation Alert if Analyst */}
      {!canAuthorize && (
        <div className="p-4 bg-surface border border-border-low text-muted-slate font-mono text-xs flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-base">info</span>
          <div>
            <span className="text-on-surface font-bold">Role Authorization Notice:</span> You are currently signed in as an <strong className="text-primary">ANALYST</strong>. You can inspect recovery dossiers and request approvals, but only team members with the <strong className="text-secondary">FINANCE_MANAGER</strong> or <strong className="text-secondary">ADMIN</strong> role can authorize or reject high-value releases.
          </div>
        </div>
      )}

      {/* Approvals Table */}
      <div className="border border-border-low bg-surface shadow-sm">
        <div className="p-5 border-b border-border-low flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-display text-lg font-bold text-on-surface uppercase">
            Pending Authorization Requests
          </h2>
          <span className="font-mono text-xs text-muted-slate">
            {pendingApprovals.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-border-low bg-surface font-mono text-xs text-muted-slate uppercase">
                <th className="p-4 font-semibold">Customer &amp; Case</th>
                <th className="p-4 text-right font-semibold">Amount at Risk</th>
                <th className="p-4 font-semibold">Recommended Action</th>
                <th className="p-4 text-center font-semibold">Recovery Chance</th>
                <th className="p-4 font-semibold">Policy Reason</th>
                <th className="p-4 font-semibold">Requested By</th>
                <th className="p-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-low/60">
              {pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-muted-slate font-mono text-xs">
                    <span className="material-symbols-outlined text-3xl text-secondary block mb-2">
                      verified_user
                    </span>
                    No pending finance approvals. All high-value recovery actions have been cleared or are within automatic limits.
                  </td>
                </tr>
              ) : (
                pendingApprovals.map(item => (
                  <tr key={item.action_id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-bold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span>{item.customer_name}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <span className="block font-mono text-xs text-muted-slate font-normal">
                        CASE #{item.case_id} &bull; {item.leakage_type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right font-metric font-bold text-primary text-base whitespace-nowrap">
                      ₹{item.amount_at_risk.toLocaleString()}
                    </td>

                    <td className="p-4 font-mono font-bold text-on-surface text-xs whitespace-nowrap">
                      {item.recommended_action.replace(/_/g, ' ')}
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-secondary">
                      {Math.round(item.recovery_probability * 100)}%
                    </td>

                    <td className="p-4 text-xs text-muted-slate max-w-[200px]">
                      {item.reason}
                    </td>

                    <td className="p-4 text-xs font-mono">
                      <div className="text-on-surface font-bold">{item.requested_by_name}</div>
                      <div className="text-[10px] text-muted-slate">
                        {item.requested_at ? new Date(item.requested_at).toLocaleDateString() : 'Today'}
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInspectCase(item.case_id)}
                          className="px-2.5 py-1.5 border border-border-low hover:border-primary text-on-surface font-mono text-xs uppercase transition-colors"
                        >
                          INSPECT
                        </button>

                        {canAuthorize ? (
                          <>
                            <button
                              onClick={() => handleReject(item)}
                              disabled={processingId === item.action_id}
                              className="px-2.5 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-xs uppercase font-bold transition-colors disabled:opacity-40"
                            >
                              REJECT
                            </button>
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={processingId === item.action_id}
                              className="px-3.5 py-1.5 bg-secondary text-background hover:bg-emerald-400 font-mono text-xs uppercase font-bold transition-all disabled:opacity-40 shadow-sm"
                            >
                              {processingId === item.action_id ? "APPROVING..." : "APPROVE"}
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-slate px-2 py-1 border border-border-low bg-surface">
                            APPROVAL LOCKED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
