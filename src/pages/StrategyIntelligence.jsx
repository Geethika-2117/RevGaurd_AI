import React from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function StrategyIntelligence() {
  const { insights } = useRecovery();

  const learningLoopStages = [
    { step: "01", name: "HISTORICAL ACTIONS", desc: "1,180 logged interventions with timestamps and customer telemetry", icon: "history" },
    { step: "02", name: "RECOVERY OUTCOMES", desc: "Granular settlement matching, time-to-pay, and customer responses", icon: "task_alt" },
    { step: "03", name: "PATTERN DETECTION", desc: "Identifies cohort clusters where specific interventions outperform", icon: "scatter_plot" },
    { step: "04", name: "STRATEGY OPTIMIZATION", desc: "Adjusts dynamic probability weights and dispatch timing", icon: "tune" },
    { step: "05", name: "NEXT-BEST-ACTION", desc: "Continuously deploys highest-yield bounded intervention", icon: "psychology", isGold: true }
  ];

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm">psychology</span>
          <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
            AI INTELLIGENCE &bull; CONTINUOUS RECOVERY LEARNING
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
          Strategy Intelligence
        </h1>
        <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
          RevGuard AI is a learning recovery agent, not a static rules engine. By analyzing past recovery outcomes, the system detects patterns and optimizes the next-best-action.
        </p>
      </div>

      {/* Visual Learning Loop Component */}
      <section className="border border-border-low bg-surface p-6 md:p-8 mb-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
              CLOSED-LOOP ADAPTIVE ARCHITECTURE
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface uppercase">
              The AI Learning Loop
            </h2>
          </div>
          <span className="font-mono text-xs text-secondary font-bold hidden sm:inline">
            SELF-OPTIMIZING RECOVERY HEURISTICS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {learningLoopStages.map((st, i) => (
            <div 
              key={i}
              className={`border p-5 flex flex-col justify-between h-44 transition-all ${
                st.isGold 
                  ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(242,202,80,0.1)]' 
                  : 'border-border-low bg-surface-container-lowest'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-primary">{st.step}</span>
                <span className="material-symbols-outlined text-muted-slate text-sm">{st.icon}</span>
              </div>
              <div>
                <div className="font-label-caps text-xs font-bold text-on-surface uppercase mb-1">
                  {st.name}
                </div>
                <p className="font-mono text-[11px] text-muted-slate leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Empirical AI Insights Grid */}
      <section className="border border-border-low bg-surface p-6 md:p-8 mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
              EMPIRICALLY DISCOVERED RECOVERY HEURISTICS
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface uppercase">
              Actionable Strategy Insights
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-slate">
            EVALUATED ACROSS 5,000 EVENTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map(ins => (
            <div key={ins.id} className="border border-border-low bg-surface-container-lowest p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[10px] text-primary font-bold">{ins.id}</span>
                  <span className="font-mono text-[9px] px-2 py-0.5 border border-secondary/40 text-secondary bg-secondary/10 uppercase font-bold">
                    {ins.impact}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-on-surface mb-2">
                  {ins.title}
                </h3>

                <blockquote className="border-l-2 border-primary pl-4 py-1 text-on-surface font-body-md text-sm italic mb-4 bg-surface/50">
                  "{ins.highlight}"
                </blockquote>
              </div>

              <div className="border-t border-border-low/40 pt-3 font-mono text-xs text-muted-slate">
                <strong className="text-secondary font-bold block mb-1">AI STRATEGY DIRECTIVE:</strong>
                {ins.recommendation}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
