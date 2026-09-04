import React from 'react';
import { useRecovery } from '../context/RecoveryContext';

export default function AlertsDropdown() {
  const { alerts, alertsDropdownOpen, setAlertsDropdownOpen, openCaseModal } = useRecovery();

  if (!alertsDropdownOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-80 sm:w-96 bg-surface border border-border-low shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-fadeInUp select-none">
      <div className="p-3.5 border-b border-border-low bg-surface-dim flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-[11px] text-primary font-bold uppercase tracking-wider">
            INTELLIGENT REVENUE ALERTS
          </span>
        </div>
        <button 
          onClick={() => setAlertsDropdownOpen(false)}
          className="text-muted-slate hover:text-on-surface text-xs font-mono"
        >
          [CLOSE]
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border-low/40">
        {alerts.map(alert => {
          let badgeColor = "border-primary text-primary bg-primary/10";
          if (alert.severity === "CRITICAL" || alert.severity === "HIGH") {
            badgeColor = "border-error-red text-error-red bg-error-red/10";
          } else if (alert.severity === "RECOVERED") {
            badgeColor = "border-secondary text-secondary bg-secondary/10";
          }

          return (
            <div 
              key={alert.id}
              onClick={() => {
                setAlertsDropdownOpen(false);
                if (alert.title.includes("48,000")) openCaseModal("REC-10482");
                else if (alert.title.includes("5L")) openCaseModal("REC-10488");
                else openCaseModal("REC-10483");
              }}
              className="p-3.5 hover:bg-surface-container-lowest transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-mono text-[9px] px-1.5 py-0.5 border font-bold uppercase ${badgeColor}`}>
                  {alert.severity}
                </span>
                <span className="font-mono text-[10px] text-muted-slate">{alert.time}</span>
              </div>
              <div className="font-bold text-xs text-on-surface mb-0.5">
                {alert.title}
              </div>
              <p className="font-mono text-[10px] text-muted-slate leading-relaxed">
                {alert.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 border-t border-border-low bg-surface-dim text-center">
        <span className="font-mono text-[9px] text-muted-slate tracking-widest uppercase">
          REVGUARD AI &bull; AUTONOMOUS NOTIFICATION ENGINE
        </span>
      </div>
    </div>
  );
}
