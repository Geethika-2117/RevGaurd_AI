import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecovery } from '../context/RecoveryContext';
import api from '../api/client';

export default function DataSources() {
  const { user } = useAuth();
  const { refreshData } = useRecovery();

  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStreamType, setActiveStreamType] = useState('PAYMENT_GATEWAY');
  const [notification, setNotification] = useState(null);

  const fileInputRef = useRef(null);

  const loadSources = async () => {
    try {
      const res = await api.get('/api/data-sources');
      setData(res);
    } catch (err) {
      console.error("Failed to fetch data sources:", err);
    }
  };

  useEffect(() => {
    loadSources();
  }, [user]);

  const handleRefresh = async () => {
    setSyncing(true);
    setNotification({ type: 'info', message: "Auditing enterprise revenue ledgers and verifying transaction streams..." });
    try {
      const res = await api.post('/api/data-sources/sync', {});
      setNotification({
        type: 'success',
        message: `Audit complete: ${res.events_analyzed.toLocaleString()} active events verified for ${user?.organization_name}.`
      });
      await loadSources();
      await refreshData();
    } catch (err) {
      setNotification({ type: 'error', message: `Audit failed: ${err.message}` });
    } finally {
      setSyncing(false);
    }
  };

  const triggerUpload = (streamType) => {
    setActiveStreamType(streamType);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotification({
      type: 'info',
      message: `Uploading and processing '${file.name}' for ${user?.organization_name}...`
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source_type', activeStreamType);

      const res = await api.post('/api/data-sources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNotification({
        type: 'success',
        message: `Successfully imported ${res.imported_count.toLocaleString()} records from '${file.name}'. Found ${res.leakage_cases_created} leakage cases for AI recovery.`
      });

      await loadSources();
      await refreshData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Upload failed: ${err.response?.data?.detail || err.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateSample = async (streamType) => {
    setUploading(true);
    setNotification({
      type: 'info',
      message: `Generating 250 payment records for ${user?.organization_name}...`
    });

    try {
      const res = await api.post('/api/data-sources/sample-batch', {
        source_type: streamType,
        count: 250
      });

      setNotification({
        type: 'success',
        message: `Successfully ingested 250 records into ${streamType.replace('_', ' ')}. Found ${res.leakage_cases_created} leakage opportunities.`
      });

      await loadSources();
      await refreshData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Generation failed: ${err.response?.data?.detail || err.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  const totalEvents = data?.total_events_analyzed ?? 0;
  const hasConnected = data?.has_connected_sources ?? false;

  const sourcesList = data?.sources || [
    { id: "payments", name: "Payment Gateway Stream", type: "PAYMENT_GATEWAY", status: "NOT_CONNECTED", events_count: 0, last_synced: "Never", description: "Primary webhook & API stream for card, UPI, and bank debit transactions." },
    { id: "invoices", name: "Billing & ERP Invoices", type: "INVOICE_LEDGER", status: "NOT_CONNECTED", events_count: 0, last_synced: "Never", description: "Corporate receivable ledger, Net-30/60 billing cycles, and customer accounts." },
    { id: "checkouts", name: "E-Commerce Checkout Sessions", type: "CHECKOUT_SESSIONS", status: "NOT_CONNECTED", events_count: 0, last_synced: "Never", description: "Cart drop-off telemetry, 3DS authentication outcomes, and abandonment events." },
    { id: "subscriptions", name: "Subscription Mandates", type: "RECURRING_BILLING", status: "NOT_CONNECTED", events_count: 0, last_synced: "Never", description: "ACH, e-mandate recurring renewals, auto-debits, and churn risk triggers." }
  ];

  return (
    <div className="p-6 md:p-12 space-y-8 max-w-7xl mx-auto animate-fadeInUp">
      
      {/* Hidden File Input for Real Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".csv,.json,.txt,.xlsx"
        className="hidden"
      />

      {/* Header */}
      <div className="border-b border-border-low pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-2">
            INTELLIGENCE INGESTION
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Revenue Data Sources
          </h1>
          <p className="text-muted-slate text-sm font-mono mt-1">
            Connected revenue pipelines and transaction streams for {user?.organization_name}.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={syncing || uploading}
          className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-4 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span className={`material-symbols-outlined text-sm ${syncing ? 'animate-spin' : ''}`}>sync</span>
          <span>{syncing ? "AUDITING..." : "REFRESH STREAMS"}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 border font-mono text-xs flex items-center justify-between gap-3 ${
          notification.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-primary/10 border-primary/30 text-primary'
        }`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-base">
              {notification.type === 'error' ? 'error' : notification.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-muted-slate hover:text-on-surface material-symbols-outlined text-sm"
          >
            close
          </button>
        </div>
      )}

      {/* Empty State Notice for Brand New Companies */}
      {!hasConnected && totalEvents === 0 && (
        <div className="border-2 border-primary/40 bg-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_25px_rgba(242,202,80,0.06)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border border-primary/30 bg-surface-container-lowest flex items-center justify-center text-primary text-2xl shrink-0">
              <span className="material-symbols-outlined">dataset</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface uppercase tracking-tight">
                No revenue data has been added yet.
              </h2>
              <p className="text-muted-slate font-mono text-xs mt-1 leading-relaxed max-w-xl">
                Upload your company's revenue data (CSV or JSON) to begin detecting leakage. Each stream is cryptographically isolated to <span className="text-primary font-bold">{user?.organization_name}</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => triggerUpload("PAYMENT_GATEWAY")}
              disabled={uploading}
              className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-4 py-2 font-mono text-xs font-bold uppercase transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>+ UPLOAD PAYMENT DATA</span>
            </button>
          </div>
        </div>
      )}

      {/* Aggregated Events Banner */}
      <div className="bg-surface border border-border-low p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="font-mono text-xs text-muted-slate uppercase tracking-wider mb-1">
            TOTAL REVENUE EVENTS MONITORED
          </div>
          <div className="font-metric text-4xl font-bold text-on-surface">
            {totalEvents.toLocaleString()}
          </div>
          <p className="font-mono text-xs text-secondary mt-1">
            {totalEvents > 0 
              ? `✓ 100% of payment streams cryptographically isolated to ${user?.organization_name}`
              : "Awaiting first transaction or ledger upload for this workspace."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerUpload("PAYMENT_GATEWAY")}
            disabled={uploading}
            className="px-3 py-2 bg-surface-container-lowest hover:bg-surface border border-border-low hover:border-primary text-xs font-mono text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-primary">add</span>
            <span>+ UPLOAD PAYMENT DATA</span>
          </button>
          <button
            onClick={() => triggerUpload("INVOICE_LEDGER")}
            disabled={uploading}
            className="px-3 py-2 bg-surface-container-lowest hover:bg-surface border border-border-low hover:border-primary text-xs font-mono text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-primary">add</span>
            <span>+ UPLOAD INVOICE DATA</span>
          </button>
          <button
            onClick={() => triggerUpload("CHECKOUT_SESSIONS")}
            disabled={uploading}
            className="px-3 py-2 bg-surface-container-lowest hover:bg-surface border border-border-low hover:border-primary text-xs font-mono text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-primary">add</span>
            <span>+ UPLOAD CHECKOUT DATA</span>
          </button>
          <button
            onClick={() => triggerUpload("RECURRING_BILLING")}
            disabled={uploading}
            className="px-3 py-2 bg-surface-container-lowest hover:bg-surface border border-border-low hover:border-primary text-xs font-mono text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-primary">add</span>
            <span>+ UPLOAD SUBSCRIPTION DATA</span>
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sourcesList.map((src) => {
          const isConnected = src.status === "CONNECTED";

          return (
            <div key={src.id} className="bg-surface border border-border-low p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-border-low pb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{src.name}</h3>
                    <p className="font-mono text-[11px] text-muted-slate mt-0.5">{src.description}</p>
                  </div>
                  
                  {isConnected ? (
                    <span className="font-mono text-[10px] px-2.5 py-1 border border-secondary/40 text-secondary bg-secondary/10 font-bold flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      CONNECTED
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] px-2.5 py-1 border border-border-low text-muted-slate bg-surface-container-lowest font-bold flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-slate/50"></span>
                      NOT CONNECTED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <div className="text-muted-slate text-[11px]">EVENTS CHECKED</div>
                    <div className={`font-metric text-xl font-bold mt-0.5 ${isConnected ? 'text-on-surface' : 'text-muted-slate'}`}>
                      {src.events_count.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-slate text-[11px]">LAST REFRESH</div>
                    <div className="text-on-surface font-mono text-sm mt-0.5">{src.last_synced}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons inside each stream card */}
              <div className="pt-4 border-t border-border-low/40 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => triggerUpload(src.type)}
                  disabled={uploading}
                  className="btn-primary border border-border-low hover:border-primary bg-surface-container-lowest hover:bg-surface text-on-surface hover:text-primary px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xs">upload</span>
                  <span>Upload File</span>
                </button>

                <button
                  onClick={() => handleGenerateSample(src.type)}
                  disabled={uploading}
                  className="text-xs font-mono text-muted-slate hover:text-primary underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <span>Load 250 Sample Rows</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
