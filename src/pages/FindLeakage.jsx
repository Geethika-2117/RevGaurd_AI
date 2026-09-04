import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function FindLeakage() {
  const { cases, dashboard, openCaseModal, pendingApprovals } = useRecovery();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam) {
      setSelectedCategory(typeParam.toUpperCase());
    }
  }, [location.search]);

  const filteredCases = cases.filter(c => {
    if (selectedCategory !== 'ALL' && c.leakage_type !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.customer_name && c.customer_name.toLowerCase().includes(q)) ||
        (c.root_cause && c.root_cause.toLowerCase().includes(q)) ||
        (c.recommended_action && c.recommended_action.toLowerCase().includes(q)) ||
        (c.action_status && c.action_status.toLowerCase().includes(q)) ||
        String(c.id).includes(q)
      );
    }
    return true;
  });

  const categories = dashboard?.categories || [];

  return (
    <div className="p-6 md:p-12 w-full max-w-6xl mx-auto space-y-8 animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="border-b border-border-low pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
            REVENUE LEAKAGE DOSSIERS &bull; {user?.organization_name}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Find Revenue Leakage
          </h1>
          <p className="text-muted-slate text-sm mt-1">
            Isolated transaction cases where money is at risk of being lost.
          </p>
        </div>

        <div className="font-mono text-xs text-muted-slate bg-surface border border-border-low px-3 py-1.5">
          <span>CASES MONITORED: {cases.length}</span>
        </div>
      </div>

      {/* Pending Approvals High-Visibility Alert Banner */}
      {pendingApprovals && pendingApprovals.length > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs animate-fadeInUp">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">
              pending_actions
            </span>
            <div>
              <span className="text-on-surface font-bold">
                {pendingApprovals.length} High-Value Case{pendingApprovals.length > 1 ? 's' : ''} Awaiting Finance Authorization
              </span>
              <span className="text-muted-slate block text-[11px]">
                Cases exceeding the ₹5,00,000 automatic limit require explicit human manager sign-off.
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/approvals')}
            className="px-4 py-2 bg-primary text-background hover:bg-primary-container font-bold uppercase text-[11px] transition-colors shrink-0 shadow-sm"
          >
            REVIEW APPROVALS ({pendingApprovals.length}) &rarr;
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`p-3 border text-left transition-all ${
            selectedCategory === 'ALL'
              ? 'border-primary bg-primary text-background font-bold'
              : 'border-border-low bg-surface text-muted-slate hover:text-on-surface'
          }`}
        >
          <span className="block text-[10px] uppercase">SHOW ALL</span>
          <span className="font-bold text-sm">All ({cases.length})</span>
        </button>

        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`p-3 border text-left transition-all ${
              selectedCategory === cat.key
                ? 'border-primary bg-primary text-background font-bold'
                : 'border-border-low bg-surface text-muted-slate hover:text-on-surface'
            }`}
          >
            <span className="block text-[10px] uppercase truncate">{cat.title}</span>
            <span className="font-bold text-sm">₹{(cat.amount_at_risk / 100000).toFixed(1)}L</span>
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-slate text-base">
            search
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, cause, or action..."
            className="w-full bg-surface border border-border-low text-on-surface font-sans text-sm pl-9 pr-3 py-2 focus:border-primary focus:outline-none placeholder-muted-slate"
          />
        </div>

        <span className="font-mono text-xs text-muted-slate hidden sm:inline">
          Showing {filteredCases.length} cases
        </span>
      </div>

      {/* Cases Table */}
      <div className="border border-border-low bg-surface overflow-x-auto shadow-sm">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-low bg-surface-container-lowest font-mono text-xs text-muted-slate uppercase">
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Root Cause / Problem</th>
              <th className="p-4 text-right font-semibold">Amount at Risk</th>
              <th className="p-4 text-center font-semibold">Recovery Chance</th>
              <th className="p-4 font-semibold">Recommended Action</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-low/60">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-muted-slate font-mono text-xs">
                  No leakage cases found matching your search.
                </td>
              </tr>
            ) : (
              filteredCases.map(item => (
                <tr 
                  key={item.id} 
                  className="hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="p-4 font-bold text-on-surface">
                    {item.customer_name}
                    <span className="block font-mono text-xs text-muted-slate font-normal">CASE #{item.id}</span>
                  </td>
                  <td className="p-4 text-muted-slate text-xs max-w-[220px]">
                    {item.root_cause}
                  </td>
                  <td className="p-4 text-right font-metric font-bold text-primary text-base whitespace-nowrap">
                    ₹{item.amount_at_risk.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-secondary">
                    {Math.round(item.recovery_probability * 100)}%
                  </td>
                  <td className="p-4 text-on-surface text-xs max-w-[180px] font-mono font-bold">
                    {item.recommended_action.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <StatusBadge status={item.action_status} />
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => openCaseModal(item)}
                      className="border border-border-low hover:border-primary text-on-surface hover:text-primary px-3 py-1 font-mono text-xs uppercase transition-colors"
                    >
                      INSPECT
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
