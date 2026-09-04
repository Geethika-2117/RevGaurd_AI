import React from 'react';
import { useRecovery } from '../context/RecoveryContext';
import { useAuth } from '../context/AuthContext';

export default function Recovery() {
  const { dashboard, recentRecoveries, runAiRecovery, isSimulating } = useRecovery();
  const { user } = useAuth();

  const moneyAtRisk = dashboard?.money_at_risk || 0;
  const revenueRecovered = dashboard?.revenue_recovered || 0;
  const recoveryRate = dashboard?.recovery_rate || 0;
  const stillAtRisk = dashboard?.still_at_risk || 0;

  const formatAmountLakhs = (amt) => {
    if (!amt && amt !== 0) return "₹0";
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(1)}L`;
    }
    return `₹${amt.toLocaleString()}`;
  };

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto space-y-10 animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="border-b border-border-low pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="font-mono text-xs text-secondary font-bold uppercase tracking-wider mb-1">
            REVENUE RECOVERY LEDGER &bull; {user?.organization_name}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            Recovered Revenue
          </h1>
          <p className="text-muted-slate text-sm mt-1">
            Settled transactions successfully salvaged by RevGuard AI.
          </p>
        </div>

        <div className="font-mono text-xs text-muted-slate bg-surface border border-border-low px-3 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>TENANT RECOVERY VAULT</span>
        </div>
      </div>

      {/* Hero Metric: TOTAL RECOVERED */}
      <section className="border-2 border-secondary bg-surface p-8 md:p-12 relative shadow-[0_0_30px_rgba(104,219,169,0.06)]">
        <span className="font-mono text-xs text-secondary font-bold tracking-widest uppercase block mb-2">
          TOTAL RECOVERED
        </span>
        <div className="font-metric text-5xl md:text-7xl font-bold text-secondary tracking-tight">
          {formatAmountLakhs(revenueRecovered)}
        </div>
        <p className="text-muted-slate text-sm md:text-base mt-2">
          Real revenue successfully settled and credited back to {user?.organization_name}.
        </p>

        {/* 4 Clean Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border-low/60 font-mono">
          <div>
            <span className="text-xs text-muted-slate uppercase block">TOTAL EXPOSURE</span>
            <div className="font-metric text-xl font-bold text-on-surface mt-1">
              {formatAmountLakhs(moneyAtRisk + revenueRecovered)}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-slate uppercase block">RECOVERED</span>
            <div className="font-metric text-xl font-bold text-secondary mt-1">
              {formatAmountLakhs(revenueRecovered)}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-slate uppercase block">STILL AT RISK</span>
            <div className="font-metric text-xl font-bold text-primary mt-1">
              {formatAmountLakhs(stillAtRisk)}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-slate uppercase block">RECOVERY RATE</span>
            <div className="font-metric text-xl font-bold text-on-surface mt-1">
              {recoveryRate}%
            </div>
          </div>
        </div>
      </section>

      {/* Recent Recoveries List */}
      <section className="border border-border-low bg-surface p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-low">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface uppercase">
              Recent Recoveries
            </h2>
            <p className="text-xs text-muted-slate font-mono mt-0.5">
              Latest transactions resolved and deposited.
            </p>
          </div>

          <button 
            onClick={runAiRecovery}
            disabled={isSimulating}
            className="btn-primary border border-primary text-background bg-primary hover:bg-primary-container px-4 py-2 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50"
          >
            {isSimulating ? "RUNNING..." : "RUN AI RECOVERY →"}
          </button>
        </div>

        <div className="divide-y divide-border-low/40">
          {recentRecoveries.length === 0 ? (
            <div className="py-8 text-center text-muted-slate font-mono text-xs">
              No recent settlements recorded. Run AI Recovery or simulate a case settlement.
            </div>
          ) : (
            recentRecoveries.map((rec, i) => (
              <div key={i} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-secondary text-secondary flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <span className="font-metric font-bold text-secondary text-lg mr-2">
                      ₹{rec.amount.toLocaleString()}
                    </span>
                    <span className="font-bold text-on-surface text-sm">
                      {rec.customer_name}
                    </span>
                    <div className="text-xs text-muted-slate font-mono mt-0.5">
                      {rec.action_type.replace(/_/g, ' ')} &bull; {rec.date}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-xs text-secondary font-bold px-2.5 py-1 bg-secondary/10 border border-secondary/20">
                  CONFIRMED SETTLED
                </span>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
