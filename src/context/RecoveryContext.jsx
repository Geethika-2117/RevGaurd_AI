import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const RecoveryContext = createContext(null);

export function RecoveryProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  // Dashboard & Financial Metrics
  const [dashboard, setDashboard] = useState({
    organization_name: "",
    merchant_id: "",
    money_at_risk: 0,
    revenue_recovered: 0,
    recovery_rate: 0,
    still_at_risk: 0,
    active_cases_count: 0,
    total_events_checked: 0,
    categories: [],
    ai_insights: []
  });

  const [cases, setCases] = useState([]);
  const [recentRecoveries, setRecentRecoveries] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected Case Modal State
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  // Batch Recovery Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0); // 0 to 5
  const [simulationStage, setSimulationStage] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Refresh all tenant data from backend
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [dashData, casesData, recovData, approvalsData] = await Promise.all([
        api.get('/api/dashboard'),
        api.get('/api/leakage'),
        api.get('/api/recovery'),
        api.get('/api/recovery/approvals')
      ]);
      setDashboard(dashData);
      setCases(casesData);
      setRecentRecoveries(recovData);
      setPendingApprovals(approvalsData);
    } catch (err) {
      console.error("Failed to load tenant recovery data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Reload data whenever authenticated user changes (tenant switch)
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, user?.organization_id, refreshData]);

  // Modal Open / Close Handlers
  const openCaseModal = (caseItem) => {
    setSelectedCase(caseItem);
    setIsCaseModalOpen(true);
  };

  const closeCaseModal = () => {
    setSelectedCase(null);
    setIsCaseModalOpen(false);
  };

  // Evaluate Policy Engine without executing action
  const checkPolicy = async (caseId, actionType = null) => {
    return await api.post(`/api/leakage/${caseId}/policy-check`, { action_type: actionType });
  };

  // Request Finance Approval for high-value case
  const requestApproval = async (caseId, actionType = null) => {
    const res = await api.post(`/api/leakage/${caseId}/request-approval`, { action_type: actionType });
    await refreshData();
    return res;
  };

  // Authorize Pending Recovery Request (ADMIN / FINANCE_MANAGER)
  const approveRecovery = async (actionId, notes = "") => {
    const res = await api.post(`/api/recovery/approvals/${actionId}/approve`, { notes });
    await refreshData();
    return res;
  };

  // Reject Pending Recovery Request (ADMIN / FINANCE_MANAGER)
  const rejectRecovery = async (actionId, notes = "") => {
    const res = await api.post(`/api/recovery/approvals/${actionId}/reject`, { notes });
    await refreshData();
    return res;
  };

  // Case Action: Recover
  const recoverCase = async (caseId, actionType = null) => {
    const updated = await api.post(`/api/leakage/${caseId}/recover`, { action_type: actionType });
    setCases(prev => prev.map(c => c.id === caseId ? updated : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(updated);
    }
    await refreshData();
    return updated;
  };

  // Case Action: Simulate Payment Settlement
  const simulatePayment = async (caseId) => {
    const updated = await api.post(`/api/leakage/${caseId}/simulate-payment`, {});
    setCases(prev => prev.map(c => c.id === caseId ? updated : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(updated);
    }
    await refreshData();
    return updated;
  };

  // Case Action: Escalate
  const escalateCase = async (caseId, notes = "") => {
    const updated = await api.post(`/api/leakage/${caseId}/escalate`, { reviewer_notes: notes });
    setCases(prev => prev.map(c => c.id === caseId ? updated : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(updated);
    }
    await refreshData();
    return updated;
  };

  // Case Action: Stop
  const stopCase = async (caseId, reason = "") => {
    const updated = await api.post(`/api/leakage/${caseId}/stop`, { reason });
    setCases(prev => prev.map(c => c.id === caseId ? updated : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(updated);
    }
    await refreshData();
    return updated;
  };

  // Batch AI Recovery with 5-stage interactive modal
  const runAiRecovery = async () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setIsRecoveryModalOpen(true);
    setSimulationResult(null);

    const stages = [
      "Scanning revenue streams across payment gateways...",
      "Detecting failure codes, expired cards, and overdue invoices...",
      "Evaluating recovery opportunities and calculating probabilities...",
      "Validating safety policies and executing bounded recovery actions...",
      "Measuring settlements and finalizing recovery ledger..."
    ];

    try {
      for (let i = 0; i < stages.length; i++) {
        setSimulationProgress(i + 1);
        setSimulationStage(stages[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const result = await api.post('/api/recovery/batch', {});
      setSimulationResult(result);
      await refreshData();
    } catch (err) {
      console.error("Batch simulation failed:", err);
      alert(`Batch AI Recovery Failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const closeRecoveryModal = () => {
    setIsRecoveryModalOpen(false);
    setSimulationProgress(0);
    setSimulationResult(null);
  };

  return (
    <RecoveryContext.Provider
      value={{
        dashboard,
        cases,
        recentRecoveries,
        pendingApprovals,
        loading,
        error,
        selectedCase,
        isCaseModalOpen,
        openCaseModal,
        closeCaseModal,
        checkPolicy,
        requestApproval,
        approveRecovery,
        rejectRecovery,
        recoverCase,
        simulatePayment,
        escalateCase,
        stopCase,
        isSimulating,
        simulationProgress,
        simulationStage,
        simulationResult,
        isRecoveryModalOpen,
        runAiRecovery,
        closeRecoveryModal,
        refreshData
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error('useRecovery must be used within a RecoveryProvider');
  }
  return context;
}
