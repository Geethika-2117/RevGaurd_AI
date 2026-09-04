import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function AIActivity() {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      setLoading(true);
      try {
        const data = await api.get('/api/activity');
        setTimeline(data);
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [user]);

  return (
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto space-y-8 animate-fadeInUp select-none">
      
      {/* Header */}
      <div className="border-b border-border-low pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider mb-1">
            AUTONOMOUS OPERATIONS &bull; {user?.organization_name}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            AI Activity Timeline
          </h1>
          <p className="text-muted-slate text-sm mt-1">
            Chronological audit of what RevGuard AI has detected, analyzed, and recovered.
          </p>
        </div>

        <div className="font-mono text-xs text-secondary flex items-center gap-2 bg-surface border border-border-low px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>LIVE TELEMETRY STREAM</span>
        </div>
      </div>

      {/* Chronological Stream */}
      <div className="border border-border-low bg-surface p-6 md:p-8">
        {loading ? (
          <div className="py-8 text-center text-muted-slate font-mono text-xs">
            Loading activity stream...
          </div>
        ) : timeline.length === 0 ? (
          <div className="py-8 text-center text-muted-slate font-mono text-xs">
            No recent activity recorded for {user?.organization_name}.
          </div>
        ) : (
          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-6 border-b border-border-low/40 last:border-b-0 last:pb-0">
                
                {/* Timestamp */}
                <div className="font-mono text-xs text-muted-slate w-20 pt-1 shrink-0">
                  {item.time}
                </div>

                {/* Icon Marker */}
                <div className="pt-1">
                  <span className={`w-3 h-3 rounded-full block ${
                    item.status === 'RECOVERED' ? 'bg-secondary' :
                    item.status === 'RECOVERING' ? 'bg-primary' :
                    item.status === 'ESCALATED' ? 'bg-red-400' :
                    'bg-muted-slate'
                  }`}></span>
                </div>

                {/* Event Content */}
                <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {item.text}
                    </p>
                    <span className="font-mono text-xs text-muted-slate">
                      Tenant: {user?.organization_name} &bull; Event #{item.id}
                    </span>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
