import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';

export default function RecoveryLoop() {
  const navigate = useNavigate();
  const { policyRules, runRecoveryBatch, isBatchSimulating } = useRecovery();
  const [activeSection, setActiveSection] = useState('stage-detect');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['stage-detect', 'stage-prioritize', 'stage-policy', 'stage-learning'];
      let current = 'stage-detect';

      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = s;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 120;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const getProgressHeight = () => {
    if (activeSection === 'stage-detect') return '15%';
    if (activeSection === 'stage-prioritize') return '45%';
    if (activeSection === 'stage-policy') return '75%';
    return '100%';
  };

  const loopPhases = [
    { id: 'stage-detect', label: '01 / DETECT & DIAGNOSE', title: 'Root Cause Diagnostics' },
    { id: 'stage-prioritize', label: '02 / PRIORITIZE & DECIDE', title: 'Expected Yield Engine' },
    { id: 'stage-policy', label: '03 / POLICY GUARDRAILS', title: 'Bounded Autonomy Rules' },
    { id: 'stage-learning', label: '04 / ACT & LEARN', title: 'Continuous Strategy Optimization' }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative w-full select-none">
      {/* Left Stepper (Fixed on Desktop, Next to main side menu) */}
      <aside className="w-full md:w-[32%] md:fixed md:left-[280px] md:top-[120px] md:bottom-12 border-b md:border-b-0 md:border-r border-border-low bg-surface-dim p-6 md:p-10 flex flex-col justify-center select-none z-30">
        <div className="max-w-md mx-auto w-full relative">
          <div className="mb-6 pb-4 border-b border-border-low/40">
            <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">
              AUTONOMOUS EXECUTION PROTOCOL
            </span>
            <h2 className="font-display text-xl font-bold text-on-surface uppercase">
              AI Recovery Engine
            </h2>
            <div className="font-mono text-[9px] text-muted-slate mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>8-STEP CONTINUOUS CYCLE</span>
            </div>
          </div>

          {/* Stepper Vertical Progress Line */}
          <div className="relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-border-low"></div>
            <div 
              className="absolute left-[11px] top-4 w-[1px] bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(242,202,80,0.5)]" 
              style={{ height: getProgressHeight() }}
            ></div>
            
            <ul className="flex flex-col gap-8 md:gap-12 relative z-10">
              {loopPhases.map(phase => {
                const isActive = activeSection === phase.id;
                return (
                  <li 
                    key={phase.id}
                    onClick={() => scrollToSection(phase.id)}
                    className="flex items-start gap-5 cursor-pointer group"
                  >
                    <div className="relative pt-1">
                      <div className={`w-6 h-6 border flex items-center justify-center transition-all ${
                        isActive 
                          ? 'border-primary bg-surface shadow-[0_0_15px_rgba(242,202,80,0.4)]' 
                          : 'border-border-low bg-surface-container-lowest'
                      }`}>
                        <div className={`w-2 h-2 transition-all ${isActive ? 'bg-primary' : 'bg-transparent'}`}></div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-mono text-[10px] tracking-widest font-bold ${
                        isActive ? 'text-primary' : 'text-muted-slate'
                      }`}>
                        {phase.label}
                      </span>
                      <span className={`font-display text-base md:text-lg font-bold ${
                        isActive ? 'text-on-surface' : 'text-muted-slate group-hover:text-on-surface'
                      }`}>
                        {phase.title}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-border-low/40">
            <button 
              onClick={runRecoveryBatch}
              disabled={isBatchSimulating}
              className="w-full btn-primary border border-primary text-primary py-3 font-label-caps text-xs uppercase hover:bg-primary hover:text-background transition-all font-bold"
            >
              RUN RECOVERY BATCH
            </button>
          </div>
        </div>
      </aside>

      {/* Right Scrolling Content Sections */}
      <div className="w-full md:w-[68%] md:ml-auto flex flex-col relative select-none">
        
        {/* Section 01: DETECT & DIAGNOSE */}
        <section 
          id="stage-detect" 
          className="min-h-[85vh] p-8 md:p-20 border-b border-border-low relative overflow-hidden flex items-center bg-surface-dim/40"
        >
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">radar</span>
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-bold">
                STAGE 01 &bull; DETECT &rarr; DIAGNOSE
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Real-Time Leakage Detection &amp; Diagnosis
            </h2>
            <p className="font-body-md text-sm text-muted-slate mb-8 leading-relaxed">
              RevGuard AI continuously scans payment streams, checkout sessions, recurring subscription billing, and B2B receivables to capture anomalies the instant they emerge.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-border-low bg-surface p-5">
                <div className="font-mono text-[10px] text-muted-slate uppercase mb-1">SCANNING FREQUENCY</div>
                <div className="font-metric text-2xl font-bold text-on-surface mb-1">Real-Time</div>
                <p className="font-mono text-[11px] text-muted-slate">Sub-second webhook telemetry analysis on all gateway transactions.</p>
              </div>
              <div className="border border-border-low bg-surface p-5">
                <div className="font-mono text-[10px] text-muted-slate uppercase mb-1">ROOT CAUSE ENGINE</div>
                <div className="font-metric text-2xl font-bold text-secondary mb-1">94.8% Accuracy</div>
                <p className="font-mono text-[11px] text-muted-slate">Distinguishes soft bank declines from hard fraud and account abandonment.</p>
              </div>
            </div>

            <div className="border border-border-low bg-surface-container-lowest p-4 font-mono text-xs text-muted-slate space-y-1">
              <div className="text-primary font-bold">&gt; ACTIVE MONITORING PIPELINES:</div>
              <div>&bull; Payment Gateway: HDFC, ICICI, Razorpay, Stripe, PayU</div>
              <div>&bull; B2B ERP Ledger: Net-30, Net-60 accounts receivable reconciliation</div>
              <div>&bull; Checkout Sessions: OTP drop-off triggers &amp; cart idle alarms</div>
            </div>
          </div>
        </section>

        {/* Section 02: PRIORITIZE & DECIDE */}
        <section 
          id="stage-prioritize" 
          className="min-h-[85vh] p-8 md:p-20 border-b border-border-low relative overflow-hidden flex items-center"
        >
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">balance</span>
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-bold">
                STAGE 02 &bull; PRIORITIZE &rarr; DECIDE
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Expected Value Prioritization Engine
            </h2>
            <p className="font-body-md text-sm text-muted-slate mb-8 leading-relaxed">
              Instead of simple chronological queues or sorting purely by invoice size, RevGuard AI prioritizes recovery efforts mathematically using Expected Value.
            </p>

            <div className="border border-border-low bg-surface p-6 mb-6">
              <div className="font-mono text-xs text-primary font-bold mb-3 uppercase tracking-wider">
                CORE MATHEMATICAL FORMULATION
              </div>
              <div className="font-mono text-sm bg-surface-container-lowest p-4 border border-border-low text-on-surface mb-3">
                Expected Recovery Yield = Amount at Risk &times; Recovery Probability
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div className="p-2 border border-border-low bg-surface-container-low">
                  <span className="text-muted-slate block text-[10px]">CASE A</span>
                  <span className="text-on-surface">₹5L &times; 90%</span>
                  <span className="text-secondary font-bold block mt-1">₹4.5L YIELD</span>
                </div>
                <div className="p-2 border border-border-low bg-surface-container-low">
                  <span className="text-muted-slate block text-[10px]">CASE B</span>
                  <span className="text-on-surface">₹3L &times; 82%</span>
                  <span className="text-secondary font-bold block mt-1">₹2.46L YIELD</span>
                </div>
                <div className="p-2 border border-border-low bg-surface-container-low">
                  <span className="text-muted-slate block text-[10px]">CASE C</span>
                  <span className="text-on-surface">₹8L &times; 28%</span>
                  <span className="text-primary font-bold block mt-1">₹2.24L YIELD</span>
                </div>
              </div>
            </div>

            <p className="font-mono text-xs text-muted-slate">
              Notice: Case A and B are prioritized before Case C, even though Case C has the highest raw face value. This maximizes net recovery velocity.
            </p>
          </div>
        </section>

        {/* Section 03: POLICY & GUARDRAILS */}
        <section 
          id="stage-policy" 
          className="min-h-[85vh] p-8 md:p-20 border-b border-border-low relative overflow-hidden flex items-center bg-surface-dim/40"
        >
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">security</span>
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-bold">
                STAGE 03 &bull; POLICY CHECK &rarr; BOUNDED GUARDRAILS
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Recovery Policy &amp; Safety Guardrails
            </h2>
            <p className="font-body-md text-sm text-muted-slate mb-8 leading-relaxed">
              RevGuard AI never acts uncontrollably. Before any intervention is executed, it must validate 100% of corporate boundaries, contact limits, and anti-spam guardrails.
            </p>

            {/* Policy Rules Grid */}
            <div className="space-y-3 mb-6">
              {policyRules.map((rule, idx) => (
                <div key={idx} className="border border-border-low bg-surface p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-label-caps text-xs font-bold text-on-surface">
                      {rule.rule}
                    </div>
                    <div className="font-mono text-[11px] text-primary mt-0.5">
                      Limit: {rule.value}
                    </div>
                    <div className="font-mono text-[10px] text-muted-slate mt-1">
                      {rule.description}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] border border-secondary/40 text-secondary bg-secondary/10 px-2 py-0.5 shrink-0 font-bold">
                    {rule.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="border border-border-low bg-surface-container-lowest p-4 font-mono text-xs text-muted-slate">
              <span className="text-secondary font-bold">&gt; COMPLIANCE GUARANTEE:</span> High-value receivables exceeding ₹5,00,000 are blocked from automated debit and strictly routed to human executives.
            </div>
          </div>
        </section>

        {/* Section 04: ACT & LEARN */}
        <section 
          id="stage-learning" 
          className="min-h-[85vh] p-8 md:p-20 relative overflow-hidden flex items-center"
        >
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">psychology</span>
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-bold">
                STAGE 04 &bull; ACT &rarr; MEASURE &rarr; LEARN
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4">
              AI Recovery Intelligence &amp; Learning Loop
            </h2>
            <p className="font-body-md text-sm text-muted-slate mb-8 leading-relaxed">
              Every recovery action, successful settlement, and customer response feeds back into the learning loop to continually optimize subsequent intervention choices.
            </p>

            {/* Strategic Intelligence Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-border-low bg-surface p-5">
                <div className="font-mono text-[10px] text-primary font-bold uppercase mb-1">BEST PERFORMING INTERVENTION</div>
                <div className="font-metric text-2xl font-bold text-secondary mb-1">Method Update (41%)</div>
                <p className="font-mono text-[11px] text-muted-slate">
                  "Payment-method update requests produce 41% recovery for expired-card failures."
                </p>
              </div>

              <div className="border border-border-low bg-surface p-5">
                <div className="font-mono text-[10px] text-primary font-bold uppercase mb-1">HIGHEST RECOVERY SEGMENT</div>
                <div className="font-metric text-2xl font-bold text-on-surface mb-1">B2B Invoices &lt; 15d</div>
                <p className="font-mono text-[11px] text-muted-slate">
                  82% conversion within 48 hours of initial reminder dispatch.
                </p>
              </div>
            </div>

            {/* Adaptive Closed Loop Flow */}
            <div className="border border-border-low bg-surface p-6 mb-6">
              <div className="font-mono text-xs text-primary font-bold mb-4 uppercase tracking-widest text-center">
                CONTINUOUS CLOSED-LOOP OPTIMIZATION
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
                <span className="px-3 py-1.5 border border-border-low bg-surface-container-low text-on-surface">DETECT</span>
                <span className="text-primary">&rarr;</span>
                <span className="px-3 py-1.5 border border-border-low bg-surface-container-low text-on-surface">ACT</span>
                <span className="text-primary">&rarr;</span>
                <span className="px-3 py-1.5 border border-border-low bg-surface-container-low text-on-surface">MEASURE</span>
                <span className="text-primary">&rarr;</span>
                <span className="px-3 py-1.5 border border-border-low bg-surface-container-low text-on-surface">LEARN</span>
                <span className="text-primary">&rarr;</span>
                <span className="px-3 py-1.5 border border-primary bg-primary/10 text-primary font-bold">OPTIMIZE NEXT ACTION</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/ledger')}
              className="w-full btn-primary border border-primary text-primary py-3.5 font-label-caps text-xs uppercase hover:bg-primary hover:text-background transition-all font-bold"
            >
              VIEW IMMUTABLE AUDIT TRAIL &rarr;
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
