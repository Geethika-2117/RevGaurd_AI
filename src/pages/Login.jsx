import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12 select-none">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="font-display text-4xl font-bold tracking-tight flex items-center justify-center gap-2 mb-1">
          <span>REVGUARD</span>
          <span className="text-primary">AI</span>
        </div>
        <p className="text-muted-slate text-xs font-mono tracking-wider uppercase">
          Revenue Leakage Detection &amp; Recovery
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface border border-border-low p-8 shadow-2xl relative">
        <div className="border-b border-border-low pb-4 mb-6">
          <h2 className="font-display text-xl font-bold text-on-surface">
            Welcome back
          </h2>
          <p className="font-mono text-xs text-muted-slate mt-1">
            Sign in to access your company's revenue recovery workspace.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-slate uppercase mb-1.5 font-bold">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className="w-full bg-surface-container-lowest border border-border-low px-3.5 py-2.5 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-slate uppercase mb-1.5 font-bold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-lowest border border-border-low pl-3.5 pr-10 py-2.5 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-slate hover:text-primary transition-colors p-1 flex items-center justify-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg select-none">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary bg-primary hover:bg-primary-container text-background font-mono text-xs font-bold py-3 uppercase tracking-wider transition-all disabled:opacity-50 mt-2 shadow-[0_0_15px_rgba(242,202,80,0.15)]"
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-6 pt-6 border-t border-border-low text-center space-y-2">
          <p className="text-xs text-muted-slate font-mono">
            Don't have a company account?
          </p>
          <Link
            to="/register"
            className="inline-block text-xs font-mono font-bold text-primary hover:underline uppercase tracking-wider"
          >
            REGISTER YOUR COMPANY &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
