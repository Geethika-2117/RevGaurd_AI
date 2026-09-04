import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecovery } from '../context/RecoveryContext';

export default function RecoveryActions() {
  const navigate = useNavigate();
  const { actionQueues, cases, openCaseModal, executeRecoveryAction } = useRecovery();
  const [selectedQueueId, setSelectedQueueId] = useState(null);

  return (
    <div className="p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="mb-8 border-b border-border-low pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-sm">play_circle</span>
            <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest">
              AI OPERATIONS &bull; INTERVENTION CONTROLLER
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface uppercase">
            Recovery Action Center
          </h1>
          <p className="font-body-md text-sm text-muted-slate mt-1 max-w-2xl">
            Autonomous intervention engines actively deploying payment retries, customer reminders, dynamic payment links, and credential update workflows.
          </p>
        </div>

        <button 
          onClick={() => navigate('/performance')}
          className="border border-border-low bg-surface hover:border-primary text-on-surface hover:text-primary px-4 py-2 font-mono text-xs uppercase"
        >
          VIEW PERFORMANCE BENCHMARKS &rarr;
        </button>
      </div>

      {/* Action Queues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {actionQueues.map(queue => (
          <div 
            key={queue.id}
            className="border border-border-low bg-surface p-6 flex flex-col justify-between hover:border-primary transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-primary text-2xl p-2 border border-border-low bg-surface-container-lowest">
                  {queue.icon}
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 border border-secondary/40 text-secondary bg-secondary/10 font-bold uppercase">
                  {queue.policyStatus}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-primary transition-colors my-2">
                {queue.name}
              </h3>
              <p className="font-mono text-xs text-muted-slate mb-4">
                {queue.description}
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest p-3 border border-border-low/60 font-mono text-xs mb-4">
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">ACTIVE QUEUE</span>
                  <span className="font-metric text-lg font-bold text-primary">{queue.activeCount} Actions</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">RECOVERY RATE</span>
                  <span className="font-metric text-lg font-bold text-secondary">{queue.historicalRecoveryRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">RECOVERED</span>
                  <span className="font-metric text-base font-bold text-secondary">{queue.recoveredAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-slate uppercase block">PENDING VALUE</span>
                  <span className="font-metric text-base font-bold text-on-surface">{queue.pendingValue}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border-low/40">
              <button 
                onClick={() => navigate('/leakage-detection')}
                className="w-full border border-border-low hover:border-primary text-on-surface hover:text-primary py-2 font-mono text-xs uppercase transition-all"
              >
                VIEW CASES &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
