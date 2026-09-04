import React from 'react';

export default function MetricCard({ title, value, icon, change, isGold, subLabel, badgeText, badgeColor = "secondary" }) {
  return (
    <div className={`bg-surface border border-border-low p-6 relative group hover:translate-y-[-4px] transition-all duration-300 ${isGold ? 'border-t-2 border-t-primary' : ''}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity">
        <span className="material-symbols-outlined text-primary text-4xl select-none">
          {icon}
        </span>
      </div>
      <p className="font-label-caps text-[11px] text-muted-slate mb-2 select-none tracking-wider uppercase font-semibold">{title}</p>
      <p className="font-metric text-3xl md:text-4xl text-on-surface font-bold tracking-tight">{value}</p>
      
      <div className="mt-4 flex items-center justify-between gap-2 select-none">
        {change ? (
          <div className="flex items-center gap-1.5">
            <span className="text-secondary flex items-center font-label-caps text-[11px] font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span> 
              {change}
            </span>
            <span className="text-muted-slate text-[10px] font-mono uppercase">{subLabel || 'vs previous period'}</span>
          </div>
        ) : subLabel ? (
          <span className="text-muted-slate text-[10px] font-mono uppercase">{subLabel}</span>
        ) : null}

        {badgeText && (
          <span className={`font-label-caps text-[10px] px-2 py-0.5 border ${
            badgeColor === 'secondary' ? 'text-secondary border-secondary/40 bg-secondary/10' :
            badgeColor === 'primary' ? 'text-primary border-primary/40 bg-primary/10' :
            'text-error-red border-error-red/40 bg-error-red/10'
          }`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
