import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecoveryProvider } from './context/RecoveryContext';
import AppShell from './components/AppShell';

import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import PaymentVerification from './pages/PaymentVerification';
import FindLeakage from './pages/FindLeakage';
import Approvals from './pages/Approvals';
import Recovery from './pages/Recovery';
import AIActivity from './pages/AIActivity';
import AuditTrail from './pages/AuditTrail';
import DataSources from './pages/DataSources';
import Settings from './pages/Settings';

function AuthenticatedOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2 text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>INITIALIZING REVGUARD SECURE SESSION...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2 text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>INITIALIZING REVGUARD SECURE SESSION...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RecoveryProvider>
      <AppShell>
        {children}
      </AppShell>
    </RecoveryProvider>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Onboarding Route (Authenticated, dedicated layout) */}
          <Route 
            path="/onboarding" 
            element={
              <AuthenticatedOnly>
                <Onboarding />
              </AuthenticatedOnly>
            } 
          />

          {/* Protected Enterprise Routes */}
          <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/verify" element={<ProtectedLayout><PaymentVerification /></ProtectedLayout>} />
          <Route path="/leakage" element={<ProtectedLayout><FindLeakage /></ProtectedLayout>} />
          <Route path="/approvals" element={<ProtectedLayout><Approvals /></ProtectedLayout>} />
          <Route path="/recovery" element={<ProtectedLayout><Recovery /></ProtectedLayout>} />
          <Route path="/activity" element={<ProtectedLayout><AIActivity /></ProtectedLayout>} />
          <Route path="/audit" element={<ProtectedLayout><AuditTrail /></ProtectedLayout>} />
          <Route path="/data-sources" element={<ProtectedLayout><DataSources /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

          {/* Backward-Compatible Redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/command-center" element={<Navigate to="/" replace />} />
          <Route path="/leakage-detection" element={<Navigate to="/leakage" replace />} />
          <Route path="/opportunities" element={<Navigate to="/leakage" replace />} />
          <Route path="/customer-risk" element={<Navigate to="/leakage" replace />} />
          <Route path="/ai-agent" element={<Navigate to="/activity" replace />} />
          <Route path="/recovery-actions" element={<Navigate to="/recovery" replace />} />
          <Route path="/human-escalations" element={<Navigate to="/leakage" replace />} />
          <Route path="/performance" element={<Navigate to="/recovery" replace />} />
          <Route path="/strategy-intelligence" element={<Navigate to="/activity" replace />} />
          <Route path="/policy-engine" element={<Navigate to="/settings" replace />} />
          <Route path="/audit-trail" element={<Navigate to="/audit" replace />} />
          <Route path="/recovery-loop" element={<Navigate to="/" replace />} />
          <Route path="/recovery-gallery" element={<Navigate to="/leakage" replace />} />
          <Route path="/ledger" element={<Navigate to="/audit" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/payment-verification" element={<Navigate to="/verify" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
