import React from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function RecoveryPerformance() {
  const { revenueRecovered, recoveryRate } = useRecovery();

  const strategyBenchmarks = [
    { name: "Payment Method Update", rate: 41, baseline: 24, diff: "+17%", category: "Subscriptions", color: "#85f8c4" },
    { name: "Payment Retry", rate: 34, baseline: 18, diff: "+16%", category: "Failed Payments", color: "#f2ca50" },
    { name: "Dynamic Payment Link", rate: 27, baseline: 14, diff: "+13%", category: "Checkout", color: "#e9c349" },
    { name: "Payment Reminder", rate: 24, baseline: 12, diff: "+12%", category: "Receivables", color: "#68dba9" },
    { name: "Human Escalation", rate: 52, baseline: 35, diff: "+17%", category: "High Value", color: "#68dba9" }
  ];

  const categoryRecovery = [
    { name: "Overdue Receivables", amount: "₹5.6L", pct: "41%", share: 41 },
    { name: "Failed Payments", amount: "₹3.8L", pct: "28%", share: 28 },
    { name: "Checkout Abandonment", amount: "₹2.2L", pct: "16%", share: 16 },
    { name: "Subscription Failures", amount: "₹2.1L", pct: "15%", share: 15 }
  ];

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">insights</span>
          <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
            ANALYTICS &bull; EFFICACY MEASUREMENT
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
          Recovery Performance
        </h1>
        <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
          Answering "Which strategies actually recover money?" Measuring empirical intervention conversion rates and expected vs actual yield.
        </p>
      </div>

      {/* Top Benchmark Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border border-border-low bg-surface p-6">
          <span className="font-mono text-[10px] text-muted-slate uppercase font-bold">TOTAL VERIFIED RECOVERED</span>
          <div className="font-metric text-4xl font-bold text-secondary my-1">
            ₹{(revenueRecovered / 100000).toFixed(1)}L
          </div>
          <span className="font-mono text-[11px] text-secondary font-bold">+18.6% vs previous cycle</span>
        </div>

        <div className="border border-border-low bg-surface p-6">
          <span className="font-mono text-[10px] text-muted-slate uppercase font-bold">GLOBAL RECOVERY RATE</span>
          <div className="font-metric text-4xl font-bold text-on-surface my-1">
            {recoveryRate.toFixed(1)}%
          </div>
          <span className="font-mono text-[11px] text-muted-slate">Across 1,180 autonomous actions</span>
        </div>

        <div className="border border-border-low bg-surface p-6">
          <span className="font-mono text-[10px] text-muted-slate uppercase font-bold">EXPECTED VS ACTUAL DELTA</span>
          <div className="font-metric text-4xl font-bold text-primary my-1">
            +9.4%
          </div>
          <span className="font-mono text-[11px] text-muted-slate">Actual yield exceeding model estimates</span>
        </div>
      </div>

      {/* Strategy Conversion Benchmarks */}
      <div className="border border-border-low bg-surface p-6 md:p-8 mb-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-mono text-[10px] text-primary uppercase font-bold tracking-widest mb-1">
              CONVERSION EFFICIENCY BY INTERVENTION TYPE
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface uppercase">
              Intervention Strategy Recovery Rates
            </h2>
          </div>
          <span className="font-mono text-xs text-secondary hidden sm:inline font-bold">
            VS MANUAL INDUSTRY BENCHMARKS
          </span>
        </div>

        <div className="space-y-4">
          {strategyBenchmarks.map((strat, i) => (
            <div key={i} className="border border-border-low bg-surface-container-lowest p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-on-surface">{strat.name}</span>
                  <span className="font-mono text-[9px] border border-border-low px-2 py-0.5 text-muted-slate uppercase">
                    {strat.category}
                  </span>
                </div>
                <div className="font-mono text-sm">
                  <strong className="text-secondary font-bold text-base">{strat.rate}%</strong>
                  <span className="text-muted-slate ml-2 text-xs">(Industry Baseline: {strat.baseline}%)</span>
                  <span className="text-primary font-bold ml-2 text-xs">{strat.diff}</span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-surface h-3 border border-border-low overflow-hidden">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ width: `${strat.rate}%`, backgroundColor: strat.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Recovered by Leakage Category */}
      <div className="border border-border-low bg-surface p-6 md:p-8 mb-12">
        <div className="font-mono text-[10px] text-primary uppercase font-bold tracking-widest mb-1">
          CAPITAL DISTRIBUTION
        </div>
        <h2 className="font-display text-2xl font-bold text-on-surface uppercase mb-6">
          Revenue Recovered by Leakage Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryRecovery.map((cat, i) => (
            <div key={i} className="border border-border-low bg-surface-container-lowest p-5">
              <span className="font-mono text-[10px] text-muted-slate uppercase block mb-1">{cat.name}</span>
              <div className="font-metric text-3xl font-bold text-secondary my-1">
                {cat.amount}
              </div>
              <div className="font-mono text-xs text-primary font-bold">
                {cat.pct} of total recovery
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
