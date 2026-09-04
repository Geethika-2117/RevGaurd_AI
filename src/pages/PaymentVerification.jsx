import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecovery } from '../context/RecoveryContext';
import api from '../api/client';

export default function PaymentVerification() {
  const { user } = useAuth();
  const { refreshData } = useRecovery();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const demoScenarios = [
    { id: 'verified_success', label: '1. Verified Success', subtitle: '100% Ledger Match', color: 'emerald' },
    { id: 'status_mismatch', label: '2. Status Mismatch', subtitle: 'Doc: SUCCESS / DB: FAILED', color: 'red' },
    { id: 'wrong_recipient', label: '3. Wrong Recipient', subtitle: 'Paid to another company', color: 'amber' },
    { id: 'amount_mismatch', label: '4. Amount Mismatch', subtitle: 'Claims ₹1L / Ledger ₹10k', color: 'purple' },
    { id: 'duplicate_payment', label: '5. Duplicate Payment', subtitle: 'Previously Settled', color: 'blue' },
    { id: 'verified_failure', label: '6. Verified Failure', subtitle: 'Doc & DB both FAILED', color: 'slate' },
  ];

  const runVerificationSimulation = async (scenarioId) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      "Reading payment document details...",
      "Searching authoritative transaction ledger...",
      "Verifying payment settlement status...",
      "Validating transfer amount against clearing balance...",
      "Verifying recipient company & merchant identifier...",
      "Analyzing duplicate risk and clearing window..."
    ];

    try {
      for (const step of steps) {
        setLoadingStep(step);
        await new Promise(r => setTimeout(r, 250));
      }

      const res = await api.post('/api/documents/demo-scenarios', { scenario_id: scenarioId });
      setResult(res);
      await refreshData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      `Securely storing ${uploadedFile.name} in isolated vault...`,
      "Extracting text & optical character tokens...",
      "Searching authoritative company transaction records...",
      "Comparing status, amount, and recipient identity...",
      "Finalizing 7-point cryptographic verification score..."
    ];

    try {
      for (const step of steps) {
        setLoadingStep(step);
        await new Promise(r => setTimeout(r, 300));
      }

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('document_type', 'RECEIPT');

      const res = await api.upload('/api/documents/upload', formData);
      setResult(res);
      await refreshData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (resType) => {
    if (resType === 'VERIFIED') {
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-secondary',
        label: 'PAYMENT VERIFIED',
        icon: 'verified'
      };
    }
    if (resType === 'NEEDS_REVIEW') {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-primary',
        label: 'NEEDS HUMAN REVIEW',
        icon: 'warning'
      };
    }
    if (resType === 'UNVERIFIED') {
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        text: 'text-muted-slate',
        label: 'TRANSACTION UNVERIFIED',
        icon: 'help'
      };
    }
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'VERIFICATION FAILED',
      icon: 'gpp_bad'
    };
  };

  return (
    <div className="p-6 md:p-12 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-border-low pb-6">
        <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-2">
          PAYMENT VERIFICATION ENGINE
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
          Verify a Payment Document
        </h1>
        <p className="text-muted-slate text-sm font-mono mt-2 max-w-2xl">
          Upload a payment receipt, bank statement, or transaction slip to test whether it matches {user?.organization_name || "your company"}'s authoritative payment records.
        </p>
      </div>

      {/* 1-Click Quick Demo Scenarios */}
      <div className="bg-surface border border-border-low p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">science</span>
            <span>INSTANT DEMO SCENARIOS (CLICK TO TEST)</span>
          </div>
          <span className="font-mono text-[11px] text-muted-slate">
            Pre-configured financial test cases
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {demoScenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => runVerificationSimulation(s.id)}
              disabled={loading}
              className="bg-surface-container-lowest hover:bg-surface border border-border-low hover:border-primary p-3 text-left transition-all group disabled:opacity-50"
            >
              <div className="font-mono text-xs font-bold text-on-surface group-hover:text-primary mb-1 truncate">
                {s.label}
              </div>
              <div className="font-mono text-[10px] text-muted-slate truncate">
                {s.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Real File Upload Box */}
      <div className="bg-surface border border-border-low p-8 text-center relative">
        <input
          type="file"
          id="doc-upload"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          disabled={loading}
          className="hidden"
        />
        <label
          htmlFor="doc-upload"
          className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-low hover:border-primary transition-colors bg-surface-container-lowest"
        >
          <span className="material-symbols-outlined text-4xl text-primary mb-3">
            upload_file
          </span>
          <div className="font-mono text-sm font-bold text-on-surface uppercase mb-1">
            {file ? file.name : "UPLOAD PAYMENT RECEIPT OR STATEMENT"}
          </div>
          <p className="text-xs text-muted-slate font-mono mb-4">
            Supports PDF, PNG, JPG, and JPEG. Files are securely isolated under {user?.organization_name}.
          </p>
          <span className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-6 py-2 font-mono text-xs font-bold uppercase transition-all">
            CHOOSE DOCUMENT
          </span>
        </label>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="bg-surface border border-primary/40 p-6 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-primary font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span>AUTHORITATIVE VERIFICATION IN PROGRESS...</span>
            </span>
            <span className="text-[11px] text-muted-slate">Cross-checking ledger</span>
          </div>
          <div className="text-on-surface pl-4 border-l-2 border-primary">
            {loadingStep}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Verification Results Panel */}
      {result && (
        <div className="space-y-6">
          
          {/* Main Status Banner */}
          {(() => {
            const badge = getBadgeStyle(result.verification_result);
            return (
              <div className={`p-6 border ${badge.border} ${badge.bg} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined text-4xl ${badge.text}`}>
                    {badge.icon}
                  </span>
                  <div>
                    <div className={`font-mono text-lg font-bold tracking-wider ${badge.text}`}>
                      {badge.label}
                    </div>
                    <div className="text-xs font-mono text-on-surface mt-1">
                      {result.verification_reason}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-on-surface">
                    {result.verification_score}%
                  </div>
                  <div className="font-mono text-[10px] text-muted-slate uppercase tracking-wider">
                    CONFIDENCE SCORE
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Side-by-Side Comparison: Extracted Document vs Authoritative Ledger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Extracted Document */}
            <div className="bg-surface border border-border-low p-6 space-y-4">
              <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider border-b border-border-low pb-2 flex items-center justify-between">
                <span>1. EXTRACTED FROM DOCUMENT</span>
                <span className="text-muted-slate">{result.file_name}</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-border-low/50">
                  <span className="text-muted-slate">Transaction ID</span>
                  <span className="text-on-surface font-bold">{result.extracted_data.transaction_id || "None found"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-low/50">
                  <span className="text-muted-slate">Claimed Amount</span>
                  <span className="text-primary font-bold">
                    {result.extracted_data.amount ? `₹${result.extracted_data.amount.toLocaleString()}` : "Not detected"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-low/50">
                  <span className="text-muted-slate">Claimed Status</span>
                  <span className="font-bold text-on-surface">{result.extracted_data.payment_status || "Unknown"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-low/50">
                  <span className="text-muted-slate">Recipient Specified</span>
                  <span className="font-bold text-on-surface">{result.extracted_data.recipient_name || "Unspecified"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-low/50">
                  <span className="text-muted-slate">File SHA-256 Hash</span>
                  <span className="font-mono text-[10px] text-muted-slate truncate max-w-[200px]">{result.file_hash}</span>
                </div>
              </div>
            </div>

            {/* Authoritative Ledger Record */}
            <div className="bg-surface border border-border-low p-6 space-y-4">
              <div className="font-mono text-xs text-secondary font-bold uppercase tracking-wider border-b border-border-low pb-2 flex items-center justify-between">
                <span>2. AUTHORITATIVE COMPANY LEDGER</span>
                <span className="text-muted-slate">{user?.organization_name}</span>
              </div>
              {result.authoritative_record ? (
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-border-low/50">
                    <span className="text-muted-slate">Ledger Transaction</span>
                    <span className="text-on-surface font-bold">{result.authoritative_record.transaction_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-low/50">
                    <span className="text-muted-slate">Settled Amount</span>
                    <span className="text-secondary font-bold">₹{result.authoritative_record.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-low/50">
                    <span className="text-muted-slate">Authoritative Status</span>
                    <span className={`font-bold ${result.authoritative_record.status === 'SUCCESS' ? 'text-secondary' : 'text-red-400'}`}>
                      {result.authoritative_record.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-low/50">
                    <span className="text-muted-slate">Account Owner</span>
                    <span className="font-bold text-on-surface">{result.authoritative_record.recipient_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-low/50">
                    <span className="text-muted-slate">Merchant ID</span>
                    <span className="font-bold text-on-surface">{result.authoritative_record.merchant_id}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-slate font-mono text-xs">
                  <span className="material-symbols-outlined text-3xl mb-1 text-muted-slate">search_off</span>
                  <p>Transaction ID was not found in {user?.organization_name}'s authoritative database.</p>
                </div>
              )}
            </div>

          </div>

          {/* 7-Point Verification Checks Breakdown */}
          <div className="bg-surface border border-border-low p-6">
            <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-4">
              7-POINT VERIFICATION AUDIT MATRIX
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.checks.map((c, i) => (
                <div
                  key={i}
                  className={`p-3.5 border ${
                    c.passed ? 'border-border-low bg-surface-container-lowest' : 'border-red-500/30 bg-red-500/5'
                  } font-mono text-xs`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-on-surface">{c.name}</span>
                    <span className={c.passed ? 'text-secondary' : 'text-red-400'}>
                      {c.passed ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-slate leading-relaxed">
                    {c.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
