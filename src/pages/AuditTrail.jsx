import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AuditTrail() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function loadAudit() {
      setLoading(true);
      try {
        const data = await api.get('/api/audit');
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [user]);

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter(l => l.event_type.includes(filter));

  const getEventBadge = (evt) => {
    if (evt.includes('RECOVER')) return 'text-secondary border-secondary/30 bg-emerald-500/10';
    if (evt.includes('ESCALAT') || evt.includes('BLOCKED')) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (evt.includes('VERIF')) return 'text-primary border-primary/30 bg-yellow-500/10';
    return 'text-muted-slate border-border-low bg-surface-container-lowest';
  };

  return (
    <div className="p-6 md:p-12 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-border-low pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-2">
            ENTERPRISE GOVERNANCE
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Audit Trail
          </h1>
          <p className="text-muted-slate text-sm font-mono mt-1">
            Immutable, organization-isolated audit logs for {user?.organization_name || "Company"}.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-muted-slate bg-surface border border-border-low px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>TENANT ISOLATED: ORG #{user?.organization_id}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'ALL EVENTS' },
          { id: 'VERIF', label: 'PAYMENT VERIFICATION' },
          { id: 'LEAKAGE', label: 'LEAKAGE DETECTED' },
          { id: 'RECOVERY', label: 'RECOVERY ACTIONS' },
          { id: 'POLICY', label: 'POLICY ESCALATIONS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`font-mono text-xs px-3 py-2 border transition-all ${
              filter === tab.id
                ? 'bg-primary text-background border-primary font-bold'
                : 'bg-surface text-muted-slate border-border-low hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-surface border border-border-low overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-low bg-surface-container-lowest text-muted-slate uppercase text-[11px]">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">ACTOR</th>
                <th className="py-3 px-4">EVENT TYPE</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">ENTITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-low">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted-slate">
                    Loading audit trail from secure database...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted-slate">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="py-3 px-4 text-muted-slate whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-on-surface font-bold whitespace-nowrap">
                      {log.user_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold ${getEventBadge(log.event_type)}`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-muted-slate whitespace-nowrap">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
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
