import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12 select-none">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="font-display text-4xl font-bold tracking-tight flex items-center justify-center gap-2 mb-1">
          <span>REVGUARD</span>
          <span className="text-primary">AI</span>
        </div>
        <p className="text-muted-slate text-xs font-mono tracking-wider uppercase">
          Autonomous Revenue Intelligence
        </p>
      </div>

      {/* Onboarding Confirmation Card */}
      <div className="w-full max-w-lg bg-surface border border-primary/40 p-8 md:p-10 shadow-2xl relative animate-fadeInUp">
        
        {/* Title */}
        <div className="text-center pb-6 border-b border-border-low">
          <span className="font-mono text-xs text-primary font-bold tracking-wider uppercase block mb-1">
            ONBOARDING CONFIRMED
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
            WELCOME TO REVGUARD AI
          </h1>
          <div className="font-mono text-base font-bold text-secondary mt-2">
            {user?.organization_name || "Your Company"}
          </div>
          <p className="font-mono text-xs text-muted-slate mt-1">
            Your secure revenue workspace has been created.
          </p>
        </div>

        {/* 4 Confirmation Checkpoints */}
        <div className="py-6 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-border-low">
            <span className="text-secondary font-bold text-base">✓</span>
            <span className="text-on-surface font-semibold">Company account created</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-border-low">
            <span className="text-secondary font-bold text-base">✓</span>
            <span className="text-on-surface font-semibold">Secure workspace created (ID: {user?.org_code || "ACTIVE"})</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-border-low">
            <span className="text-secondary font-bold text-base">✓</span>
            <span className="text-on-surface font-semibold">Revenue isolation enabled &amp; cryptographic barrier verified</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-border-low">
            <span className="text-secondary font-bold text-base">✓</span>
            <span className="text-on-surface font-semibold">Recovery policies &amp; safety guardrails configured</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full btn-primary bg-primary hover:bg-primary-container text-background font-mono text-xs font-bold py-3.5 uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)] flex items-center justify-center gap-2"
        >
          <span>GO TO DASHBOARD</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

      </div>

    </div>
  );
}
