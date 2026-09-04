import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real-time password requirement evaluations
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasSpecialChar;

  // Real-time confirm password evaluations
  const hasStartedConfirm = confirmPassword.length > 0;
  const isConfirmMatch = hasStartedConfirm && password === confirmPassword;
  const isConfirmMismatch = hasStartedConfirm && password !== confirmPassword;

  // Disabled button calculation
  const isSubmitDisabled = loading ||
    !companyName.trim() ||
    !adminName.trim() ||
    !email.trim() ||
    !isPasswordValid ||
    !hasStartedConfirm ||
    !isConfirmMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!companyName.trim()) {
      setError("Company Name is required.");
      return;
    }
    if (!adminName.trim()) {
      setError("Admin Name is required.");
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError("A valid Email address is required.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password does not meet all required security constraints.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await register({
        company_name: companyName.trim(),
        admin_name: adminName.trim(),
        email: normalizedEmail,
        admin_email: normalizedEmail,
        company_email: normalizedEmail,
        password: password,
        confirm_password: confirmPassword
      });
      // Redirect directly to the dashboard
      navigate('/');
    } catch (err) {
      setError(err.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-12 select-none">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="font-display text-4xl font-bold tracking-tight flex items-center justify-center gap-2 mb-1">
          <span>REVGUARD</span>
          <span className="text-primary">AI</span>
        </div>
        <p className="text-muted-slate text-xs font-mono tracking-wider uppercase">
          Revenue Leakage Detection &amp; Recovery
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-xl bg-surface border border-border-low p-8 shadow-2xl relative">
        <div className="border-b border-border-low pb-4 mb-6">
          <h2 className="font-display text-2xl font-bold text-on-surface">
            REGISTER YOUR COMPANY
          </h2>
          <p className="font-mono text-xs text-muted-slate mt-1">
            Create your secure RevGuard workspace.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: COMPANY INFORMATION */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider border-b border-border-low/60 pb-1">
              COMPANY INFORMATION
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-slate uppercase mb-1 font-bold">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Technologies"
                className="w-full bg-surface-container-lowest border border-border-low px-3.5 py-2 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* SECTION 2: ADMIN ACCOUNT */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-secondary font-bold uppercase tracking-wider border-b border-border-low/60 pb-1">
              ADMIN ACCOUNT CREDENTIALS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted-slate uppercase mb-1 font-bold">
                  Admin Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Apex Admin"
                  className="w-full bg-surface-container-lowest border border-border-low px-3.5 py-2 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-slate uppercase mb-1 font-bold">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="apex@admin.com"
                  className="w-full bg-surface-container-lowest border border-border-low px-3.5 py-2 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-slate uppercase mb-1 font-bold">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-border-low pl-3.5 pr-10 py-2 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
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

              <div>
                <label className="block text-xs font-mono text-muted-slate uppercase mb-1 font-bold">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-surface-container-lowest border pl-3.5 pr-10 py-2 text-sm font-mono text-on-surface focus:outline-none transition-colors ${
                      isConfirmMismatch
                        ? 'border-red-500 focus:border-red-500'
                        : isConfirmMatch
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : 'border-border-low focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-slate hover:text-primary transition-colors p-1 flex items-center justify-center focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-lg select-none">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Inline Confirmation Feedback */}
                {isConfirmMismatch && (
                  <p className="text-xs font-mono text-red-400 mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">close</span>
                    <span>Passwords do not match</span>
                  </p>
                )}
                {isConfirmMatch && (
                  <p className="text-xs font-mono text-secondary mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>✓ Passwords match</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password Requirements Indicator */}
            <div className="bg-surface-container-lowest/80 border border-border-low p-3.5 space-y-2 font-mono text-xs mt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-slate font-bold">
                Password requirements:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${
                  password.length === 0 ? 'text-muted-slate' : (hasMinLength ? 'text-secondary' : 'text-red-400')
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {password.length === 0 ? 'radio_button_unchecked' : (hasMinLength ? 'check_circle' : 'cancel')}
                  </span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${
                  password.length === 0 ? 'text-muted-slate' : (hasNumber ? 'text-secondary' : 'text-red-400')
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {password.length === 0 ? 'radio_button_unchecked' : (hasNumber ? 'check_circle' : 'cancel')}
                  </span>
                  <span>Contains a number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${
                  password.length === 0 ? 'text-muted-slate' : (hasUppercase ? 'text-secondary' : 'text-red-400')
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {password.length === 0 ? 'radio_button_unchecked' : (hasUppercase ? 'check_circle' : 'cancel')}
                  </span>
                  <span>Contains an uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${
                  password.length === 0 ? 'text-muted-slate' : (hasSpecialChar ? 'text-secondary' : 'text-red-400')
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {password.length === 0 ? 'radio_button_unchecked' : (hasSpecialChar ? 'check_circle' : 'cancel')}
                  </span>
                  <span>Contains a special character</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full btn-primary bg-primary hover:bg-primary-container text-background font-mono text-xs font-bold py-3.5 uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(242,202,80,0.15)]"
          >
            {loading ? "CREATING COMPANY ACCOUNT..." : "CREATE COMPANY ACCOUNT"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 pt-6 border-t border-border-low text-center space-y-2">
          <p className="text-xs text-muted-slate font-mono">
            Already have an account?
          </p>
          <Link
            to="/login"
            className="inline-block text-xs font-mono font-bold text-primary hover:underline uppercase tracking-wider"
          >
            SIGN IN &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
