import React from 'react';

export default function StatusBadge({ status }) {
  const norm = (status || '').toUpperCase().trim();

  if (norm === 'RECOVERED') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-secondary text-secondary px-2.5 py-0.5 text-xs font-mono font-bold bg-secondary/10">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
        RECOVERED
      </span>
    );
  }

  if (norm === 'RECOVERING') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-primary text-primary px-2.5 py-0.5 text-xs font-mono font-bold bg-primary/10">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        RECOVERING
      </span>
    );
  }

  if (norm === 'ESCALATED') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-error-red text-error-red px-2.5 py-0.5 text-xs font-mono font-bold bg-error-red/10">
        <span className="w-1.5 h-1.5 rounded-full bg-error-red"></span>
        ESCALATED
      </span>
    );
  }

  if (norm === 'STOPPED') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-border-low text-muted-slate px-2.5 py-0.5 text-xs font-mono bg-surface-container-high">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-slate"></span>
        STOPPED
      </span>
    );
  }

  // Default: FOUND or ANALYZING
  return (
    <span className="inline-flex items-center gap-1.5 border border-border-low text-on-surface px-2.5 py-0.5 text-xs font-mono bg-surface-container-high">
      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
      {norm || 'FOUND'}
    </span>
  );
}
