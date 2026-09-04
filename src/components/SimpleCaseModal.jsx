import React, { useState, useEffect } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

export default function SimpleCaseModal() {
  const { 
    selectedCase, 
    isCaseModalOpen, 
    closeCaseModal, 
    checkPolicy,
    requestApproval,
    approveRecovery,
    rejectRecovery,
    recoverCase, 
    simulatePayment, 
    escalateCase, 
    stopCase,
    pendingApprovals
  } = useRecovery();

  const { user } = useAuth();
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [policyCheck, setPolicyCheck] = useState(null);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Reset local state when modal opens for a new case
  useEffect(() => {
    if (selectedCase) {
      setPolicyCheck(null);
      setPolicyChecked(false);
      setModalError(null);
      setShowExplanation(false);

      // If already pending approval or approved, auto-evaluate policy state for display
      if (selectedCase.action_status === 'PENDING_APPROVAL' || selectedCase.action_status === 'APPROVED') {
        checkPolicy(selectedCase.id)
          .then(res => {
            setPolicyCheck(res);
            setPolicyChecked(true);
          })
          .catch(err => console.error("Policy check error:", err));
      }
    }
  }, [selectedCase?.id]);

  if (!isCaseModalOpen || !selectedCase) return null;

  const isPendingApproval = selectedCase.action_status === 'PENDING_APPROVAL';
  const isApproved = selectedCase.action_status === 'APPROVED';
  const isRecovering = selectedCase.action_status === 'RECOVERING';
  const isRecovered = selectedCase.action_status === 'RECOVERED';
  const isRejected = selectedCase.action_status === 'REJECTED';
  const isStopped = selectedCase.action_status === 'STOPPED';

  const canAuthorize = user?.role === 'ADMIN' || user?.role === 'FINANCE_MANAGER';

  // Find matching pending approval action ID if exists
  const pendingAction = pendingApprovals.find(a => a.case_id === selectedCase.id);

  // Step 4: Run Policy Engine when clicking START RECOVERY
  const handleStartRecovery = async () => {
    setActionLoading(true);
    setModalError(null);
    try {
      const res = await checkPolicy(selectedCase.id);
      setPolicyCheck(res);
      setPolicyChecked(true);
    } catch (err) {
      setModalError(`Policy check failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Step 8: User clicks REQUEST FINANCE APPROVAL
  const handleRequestApproval = async () => {
    setActionLoading(true);
    setModalError(null);
    try {
      await requestApproval(selectedCase.id, selectedCase.recommended_action);
    } catch (err) {
      setModalError(`Failed to request approval: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Finance Manager / Admin clicks APPROVE
  const handleApprove = async () => {
    if (!pendingAction && !isPendingApproval) return;
    setActionLoading(true);
    setModalError(null);
    try {
      const actionId = pendingAction ? pendingAction.action_id : selectedCase.id;
      await approveRecovery(actionId, "Approved via case dossier modal.");
    } catch (err) {
      setModalError(`Approval failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Finance Manager / Admin clicks REJECT
  const handleReject = async () => {
    if (!pendingAction && !isPendingApproval) return;
    setActionLoading(true);
    setModalError(null);
    try {
      const actionId = pendingAction ? pendingAction.action_id : selectedCase.id;
      await rejectRecovery(actionId, "Rejected via case dossier modal.");
    } catch (err) {
      setModalError(`Rejection failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Execute recovery (automatic or post-approval)
  const handleExecuteRecovery = async () => {
    setActionLoading(true);
    setModalError(null);
    try {
      await recoverCase(selectedCase.id, selectedCase.recommended_action);
    } catch (err) {
      setModalError(`Execution blocked: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate payment received
  const handleSimulatePayment = async () => {
    setActionLoading(true);
    setModalError(null);
    try {
      await simulatePayment(selectedCase.id);
    } catch (err) {
      setModalError(`Simulation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    setActionLoading(true);
    setModalError(null);
    try {
      await escalateCase(selectedCase.id, "Escalated to human finance review.");
    } catch (err) {
      setModalError(`Escalation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    setModalError(null);
    try {
      await stopCase(selectedCase.id, "Stopped by operator.");
    } catch (err) {
      setModalError(`Stop failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-surface-dim/95 flex items-center justify-center p-4 backdrop-blur-sm select-none">
      <div className="bg-surface border border-border-low w-full max-w-xl flex flex-col relative shadow-[0_10px_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-border-low flex justify-between items-start bg-surface-dim sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                PAYMENT RECOVERY DOSSIER
              </span>
              <StatusBadge status={selectedCase.action_status} />
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {selectedCase.customer_name}
            </h2>
            <div className="font-mono text-xs text-muted-slate mt-0.5">
              Case ID: #{selectedCase.id} &bull; Type: {selectedCase.leakage_type.replace(/_/g, ' ')}
            </div>
          </div>
          <button 
            onClick={closeCaseModal}
            className="text-muted-slate hover:text-on-surface p-1 border border-border-low hover:border-primary"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Modal Error Banner */}
        {modalError && (
          <div className="p-3 mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {modalError}
          </div>
        )}

        {/* Amount at Risk Banner */}
        <div className="bg-surface-container-lowest p-6 border-b border-border-low flex justify-between items-center">
          <div>
            <span className="text-xs text-muted-slate font-mono uppercase block font-semibold">
              {isRecovered ? "REVENUE RECOVERED" : "AMOUNT AT RISK"}
            </span>
            <div className={`font-metric text-3xl font-bold mt-0.5 ${isRecovered ? "text-secondary" : "text-primary"}`}>
              ₹{(isRecovered ? selectedCase.revenue_recovered : selectedCase.amount_at_risk).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-slate font-mono uppercase block font-semibold">RECOVERY CHANCE</span>
            <div className="font-metric text-2xl font-bold text-secondary mt-0.5">
              {Math.round(selectedCase.recovery_probability * 100)}%
            </div>
          </div>
        </div>

        {/* Q&A Body */}
        <div className="p-6 space-y-5 text-sm font-sans">
          
          <div>
            <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
              WHAT HAPPENED?
            </div>
            <p className="text-on-surface text-base leading-relaxed">
              Revenue leakage detected for {selectedCase.customer_name} under {selectedCase.leakage_type.replace(/_/g, ' ')}.
            </p>
          </div>

          <div>
            <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
              WHY DID THIS HAPPEN?
            </div>
            <p className="text-on-surface text-sm leading-relaxed text-muted-slate">
              {selectedCase.root_cause}
            </p>
          </div>

          <div>
            <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
              WHAT DOES AI RECOMMEND?
            </div>
            <p className="text-secondary text-base font-semibold font-mono">
              {selectedCase.recommended_action.replace(/_/g, ' ')}
            </p>
          </div>

          {/* ============================================================== */}
          {/* DYNAMIC POLICY WORKFLOW PANELS (REQUIREMENTS 5, 6, 11, 16, 35, 36) */}
          {/* ============================================================== */}

          {/* STATE A: HUMAN APPROVAL REQUIRED (Amount > ₹500,000 and Policy Checked) */}
          {policyChecked && policyCheck?.requires_human_approval && !isPendingApproval && !isApproved && !isRecovering && !isRecovered && (
            <div className="border border-primary/50 bg-surface-container-lowest p-5 space-y-3 font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-primary font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">gavel</span>
                  HUMAN APPROVAL REQUIRED
                </span>
                <span className="text-[10px] text-muted-slate px-2 py-0.5 border border-primary/30">
                  THRESHOLD: ₹5,00,000
                </span>
              </div>

              <p className="text-on-surface leading-relaxed text-xs">
                {policyCheck.explanation}
              </p>

              {/* Policy Checklist */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="text-muted-slate font-bold uppercase tracking-wider text-[10px]">
                  POLICY CHECK
                </div>
                {policyCheck.safety_checks.map((chk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={chk.status === 'PASS' ? 'text-secondary font-bold' : 'text-primary font-bold'}>
                      {chk.status === 'PASS' ? '✓' : (chk.icon === 'warning' ? '⚠' : '→')}
                    </span>
                    <span className={chk.status === 'PASS' ? 'text-on-surface' : 'text-primary font-medium'}>
                      {chk.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-slate pt-1 border-t border-border-low/60">
                Finance authorization is required before this recovery action can be executed.
              </p>
            </div>
          )}

          {/* STATE B: AUTOMATIC RECOVERY ALLOWED (Amount <= ₹500,000 and Policy Checked) */}
          {policyChecked && policyCheck?.is_automatic_allowed && !isRecovering && !isRecovered && (
            <div className="border border-secondary/50 bg-surface-container-lowest p-5 space-y-3 font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-secondary font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">verified</span>
                  AUTOMATIC RECOVERY ALLOWED
                </span>
                <span className="text-[10px] text-secondary px-2 py-0.5 border border-secondary/30">
                  POLICY CLEARED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="text-muted-slate font-bold uppercase tracking-wider text-[10px]">
                  SAFETY CHECK
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <span>✓</span>
                  <span className="text-on-surface">Within automatic recovery limit (≤ ₹500,000)</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <span>✓</span>
                  <span className="text-on-surface">AI recommendation approved ({selectedCase.recommended_action.replace(/_/g, ' ')})</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <span>✓</span>
                  <span className="text-on-surface">Recovery action allowed</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE C: FINANCE APPROVAL REQUESTED (PENDING_APPROVAL) */}
          {isPendingApproval && (
            <div className="border border-primary/60 bg-surface-container-lowest p-5 space-y-3 font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-primary font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">pending_actions</span>
                  FINANCE APPROVAL REQUESTED
                </span>
                <span className="text-[10px] text-primary px-2 py-0.5 border border-primary/40 font-bold">
                  WAITING FOR FINANCE APPROVAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-slate uppercase text-[10px] block font-bold">Amount at Risk</span>
                  <span className="font-metric text-base font-bold text-primary">₹{selectedCase.amount_at_risk.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-slate uppercase text-[10px] block font-bold">Requested Action</span>
                  <span className="font-bold text-on-surface">{selectedCase.recommended_action.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-slate leading-relaxed border-t border-border-low/40 pt-2">
                Reason: Amount exceeds ₹500,000 automatic recovery threshold. Waiting for finance manager review.
              </p>

              {/* Role-based Authorization notice or Inline Actions */}
              {canAuthorize ? (
                <div className="p-3 bg-surface border border-primary/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-[11px] text-secondary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">shield_person</span>
                    <span>You are logged in as {user?.role} — Authorize recovery:</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="px-3 py-1.5 border border-red-400 text-red-400 hover:bg-red-500/10 font-bold uppercase text-[10px] transition-colors"
                    >
                      REJECT
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-secondary text-background hover:bg-emerald-400 font-bold uppercase text-[10px] transition-colors shadow-sm"
                    >
                      APPROVE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-muted-slate p-2 border border-border-low bg-surface">
                  * Logged in as <span className="text-on-surface font-bold">{user?.role}</span>. Only Finance Managers or Administrators can authorize this recovery.
                </div>
              )}
            </div>
          )}

          {/* STATE D: APPROVED FOR RECOVERY */}
          {isApproved && (
            <div className="border border-secondary bg-surface-container-lowest p-5 space-y-2 font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-secondary font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  APPROVED FOR RECOVERY
                </span>
                <span className="text-[10px] text-secondary px-2 py-0.5 border border-secondary/40 font-bold">
                  EXPLICIT AUTHORIZATION GRANTED
                </span>
              </div>
              <p className="text-on-surface text-xs leading-relaxed">
                Executive finance approval confirmed for ₹{selectedCase.amount_at_risk.toLocaleString()} ({selectedCase.recommended_action.replace(/_/g, ' ')}). Ready for bounded pipeline execution.
              </p>
            </div>
          )}

          {/* STATE E: RECOVERED */}
          {isRecovered && (
            <div className="border border-secondary bg-surface-container-lowest p-5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-secondary font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  REVENUE RECOVERED
                </span>
                <span className="text-[10px] text-secondary px-2 py-0.5 border border-secondary/40 font-bold">
                  SETTLEMENT CONFIRMED
                </span>
              </div>
              <p className="text-on-surface text-xs leading-relaxed">
                ₹{selectedCase.revenue_recovered.toLocaleString()} has been recovered and verified in the company revenue vault.
              </p>
            </div>
          )}

          {/* STATE F: REJECTED */}
          {isRejected && (
            <div className="border border-red-500/50 bg-surface-container-lowest p-5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-red-400 font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">cancel</span>
                  RECOVERY REJECTED
                </span>
                <span className="text-[10px] text-red-400 px-2 py-0.5 border border-red-500/40 font-bold">
                  DECLINED BY FINANCE
                </span>
              </div>
              <p className="text-muted-slate text-xs leading-relaxed">
                This high-value recovery request was declined during human finance authorization.
              </p>
            </div>
          )}

          {/* STATE G: STOPPED */}
          {isStopped && (
            <div className="border border-border-low bg-surface-container-lowest p-5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-low pb-2">
                <span className="text-muted-slate font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">stop_circle</span>
                  RECOVERY WORKFLOW STOPPED
                </span>
                <span className="text-[10px] text-muted-slate px-2 py-0.5 border border-border-low font-bold">
                  HALTED
                </span>
              </div>
              <p className="text-muted-slate text-xs leading-relaxed">
                No further automated recovery actions will occur for this case.
              </p>
            </div>
          )}

          {/* Collapsible Evidence */}
          <div className="pt-2 border-t border-border-low/40">
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-muted-slate hover:text-primary font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                {showExplanation ? 'expand_less' : 'expand_more'}
              </span>
              Why did AI choose this?
            </button>

            {showExplanation && (
              <div className="mt-3 p-4 bg-surface-container-lowest border border-border-low space-y-2 font-mono text-xs text-muted-slate animate-fadeInUp">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">&bull;</span>
                  <span className="text-on-surface">Confidence Score: {Math.round(selectedCase.root_cause_confidence * 100)}% based on historical decline patterns.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">&bull;</span>
                  <span className="text-on-surface">Policy check verified: Automatic ceiling is ₹5,00,000; high-value cases route to human authorization.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">&bull;</span>
                  <span className="text-on-surface">Expected Recovery Value: ₹{Math.round(selectedCase.expected_recovery).toLocaleString()}.</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 border-t border-border-low flex flex-wrap justify-between items-center gap-3 bg-surface-dim sticky bottom-0 z-10">
          <div className="flex gap-2">
            <button 
              onClick={handleStop}
              disabled={actionLoading || isRecovered || isStopped}
              className="border border-border-low px-3 py-2 font-mono text-xs text-muted-slate hover:text-red-400 hover:border-red-400 uppercase transition-colors disabled:opacity-40"
            >
              STOP
            </button>
            <button 
              onClick={handleEscalate}
              disabled={actionLoading || isRecovered || isStopped}
              className="border border-border-low px-3 py-2 font-mono text-xs text-muted-slate hover:text-primary hover:border-primary uppercase transition-colors disabled:opacity-40"
            >
              ESCALATE
            </button>
          </div>

          <div className="flex gap-2">
            
            {/* If in RECOVERING state, allow instant settlement simulation */}
            {isRecovering && !isRecovered && (
              <button
                onClick={handleSimulatePayment}
                disabled={actionLoading}
                className="border border-secondary text-secondary bg-secondary/10 hover:bg-secondary hover:text-background px-4 py-2 font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                <span>{actionLoading ? "SETTLING..." : "SIMULATE PAYMENT RECEIVED"}</span>
              </button>
            )}

            {/* BUTTON LOGIC:
                1. If RECOVERED -> show close
                2. If RECOVERING -> already handled above (settlement simulation)
                3. If APPROVED -> show EXECUTE RECOVERY
                4. If PENDING_APPROVAL -> show WAITING or inline authorize
                5. If Policy Checked & REQUIRES_HUMAN_APPROVAL -> show [ REQUEST FINANCE APPROVAL ]
                6. If Policy Checked & AUTOMATIC_ALLOWED -> show [ EXECUTE RECOVERY ]
                7. Initial State (un-checked) -> show [ START RECOVERY ]
            */}
            {isRecovered ? (
              <button 
                onClick={closeCaseModal}
                className="border border-secondary text-secondary bg-secondary/10 px-6 py-2 font-mono text-xs font-bold uppercase"
              >
                RECOVERED ✓
              </button>
            ) : isApproved ? (
              <button 
                onClick={handleExecuteRecovery}
                disabled={actionLoading}
                className="btn-primary border border-secondary text-background bg-secondary hover:bg-emerald-400 px-6 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>{actionLoading ? "EXECUTING..." : "EXECUTE RECOVERY"}</span>
              </button>
            ) : isPendingApproval ? (
              <button 
                disabled
                className="border border-primary/50 text-primary bg-primary/10 px-6 py-2 font-mono text-xs font-bold uppercase cursor-not-allowed flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                <span>FINANCE APPROVAL PENDING</span>
              </button>
            ) : policyChecked && policyCheck?.requires_human_approval ? (
              <button 
                onClick={handleRequestApproval}
                disabled={actionLoading}
                className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,202,80,0.15)]"
              >
                <span className="material-symbols-outlined text-sm">approval</span>
                <span>{actionLoading ? "SUBMITTING..." : "REQUEST FINANCE APPROVAL"}</span>
              </button>
            ) : policyChecked && policyCheck?.is_automatic_allowed ? (
              <button 
                onClick={handleExecuteRecovery}
                disabled={actionLoading}
                className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>{actionLoading ? "EXECUTING..." : "EXECUTE RECOVERY"}</span>
              </button>
            ) : !isRecovering && !isStopped && !isRejected ? (
              <button 
                onClick={handleStartRecovery}
                disabled={actionLoading}
                className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,202,80,0.15)]"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>{actionLoading ? "CHECKING POLICY..." : `START RECOVERY (₹${selectedCase.amount_at_risk.toLocaleString()})`}</span>
              </button>
            ) : null}

          </div>
        </div>

      </div>
    </div>
  );
}

