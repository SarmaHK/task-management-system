import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordPolicy from '../components/PasswordPolicy';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false); // Added success state
  const navigate = useNavigate();
  const { register } = useAuth();

  const passwordsMatch    = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const confirmBorderClass = passwordsMismatch
    ? 'border-red-300   focus:border-red-400   focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
    : passwordsMatch
    ? 'border-emerald-300 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
    : 'border-gray-200  focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double-clicks
    setError('');

    // 1. Strict Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g., name@company.com).');
      return;
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    // 3. Check strict password policy
    const passed = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;

    if (passed < 5) {
      setError('Please ensure your password meets all security requirements.');
      return;
    }

    // 4. Submit form
    setIsLoading(true);
    try {
      await register(name, email, password);
      setIsLoading(false);
      
      // 5. Trigger Success Toast & Redirect
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  /* shared input class */
  const inputCls = 'w-full pl-[38px] pr-3.5 py-[10px] text-[13.5px] text-gray-900 bg-gray-50 border-[1.5px] border-gray-200 rounded-[10px] outline-none transition-all duration-150 font-medium placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]';

  return (
    // Added 'relative' here so the absolute Toast notification aligns correctly
    <div className="flex min-h-screen font-sans bg-indigo-50 relative">

      {/* ── Floating Success Toast Notification ── */}
      {success && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 bg-white border border-emerald-200 shadow-xl rounded-xl p-4 animate-fadeUp">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
              <path d="M7 12l3 3 7-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900 tracking-tight mb-0.5">Account Created!</h4>
            <p className="text-[12.5px] text-gray-500 font-medium">Redirecting to sign in...</p>
          </div>
        </div>
      )}

      {/* ── Left indigo panel (desktop only) ───────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 flex-shrink-0 relative overflow-hidden px-12 py-12"
        style={{ background: 'linear-gradient(145deg,#1e1b4b 0%,#312e81 55%,#4338ca 100%)' }}
      >
        {/* Grid overlay texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right,rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(99,102,241,0.07) 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect x="0"  y="0"  width="12" height="12" rx="3" fill="#6366f1"/>
            <rect x="16" y="0"  width="12" height="12" rx="3" fill="#818cf8" opacity="0.7"/>
            <rect x="0"  y="16" width="12" height="12" rx="3" fill="#818cf8" opacity="0.5"/>
            <rect x="16" y="16" width="12" height="12" rx="3" fill="#6366f1" opacity="0.9"/>
          </svg>
          <span className="text-[15px] font-semibold text-white tracking-tight">TaskFlow</span>
        </div>

        {/* Heading + steps */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pt-12">
          
          {/* 1. Heading fades up immediately */}
          <h1 className="text-[clamp(34px,3.2vw,50px)] font-semibold text-indigo-100 leading-tight tracking-tight mb-4 animate-fadeUp">
            Start shipping<br/>
            <span className="italic text-indigo-300" style={{fontFamily:"'Instrument Serif',serif"}}>
              from day one.
            </span>
          </h1>
          
          {/* 2. Subtext fades up 0.1s later */}
          <p 
            className="text-[14px] text-indigo-300 leading-relaxed max-w-[340px] mb-9 animate-fadeUp" 
            style={{ animationDelay: '0.1s' }}
          >
            Join thousands of teams already using TaskFlow to plan sprints, hit deadlines, and stay in sync.
          </p>

          {/* 3. The whole steps list fades up 0.2s later */}
          <div 
            className="flex flex-col gap-4 animate-fadeUp" 
            style={{ animationDelay: '0.2s' }}
          >
            {[
              { num: '01', text: 'Create your free account' },
              { num: '02', text: 'Invite your teammates' },
              { num: '03', text: 'Start managing tasks' },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-indigo-300 tracking-widest border border-indigo-400/40" style={{background:'rgba(99,102,241,0.3)'}}>
                  {step.num}
                </div>
                <span className="text-[13.5px] text-indigo-200">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Trust badges fade up 0.3s later (Bonus UI polish!) */}
        <div 
          className="relative z-10 flex flex-wrap gap-2.5 pt-8 border-t border-indigo-300/20 animate-fadeUp" 
          style={{ animationDelay: '0.3s' }}
        >
          {[
            { icon: (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L10 6h4.5L11 9l1.5 4.5L8 11l-4.5 2.5L5 9 1.5 6H6L8 1.5z" stroke="#a5b4fc" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              ), label: 'Free forever plan' },
            { icon: (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#a5b4fc" strokeWidth="1.2"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="#a5b4fc" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              ), label: 'SOC 2 compliant' },
            { icon: (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#a5b4fc" strokeWidth="1.2"/>
                  <path d="M5.5 8l2 2 3-3" stroke="#a5b4fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ), label: 'No credit card' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] text-indigo-200 border border-indigo-400/25" style={{background:'rgba(99,102,241,0.2)'}}>
              {b.icon}
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right white form panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px] animate-fadeUp" style={{animationDelay:'0.1s'}}>

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="0"  y="0"  width="12" height="12" rx="3" fill="#6366f1"/>
              <rect x="16" y="0"  width="12" height="12" rx="3" fill="#818cf8" opacity="0.7"/>
              <rect x="0"  y="16" width="12" height="12" rx="3" fill="#818cf8" opacity="0.5"/>
              <rect x="16" y="16" width="12" height="12" rx="3" fill="#6366f1" opacity="0.9"/>
            </svg>
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight">TaskFlow</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <span className="inline-block text-[12px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 tracking-wide">
              🚀 Get started free
            </span>
            <h2 className="text-[26px] font-bold text-indigo-950 tracking-tight leading-tight mb-1.5">
              Create your account
            </h2>
            <p className="text-[13.5px] text-gray-500 font-medium">
              Get started free — no credit card required
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-800 font-medium mb-5 animate-fadeUp" role="alert">
              <svg className="flex-shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="#dc2626"/>
                <path d="M8 4.5v4M8 10.5v1" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-name" className="text-[12.5px] font-semibold text-gray-700 tracking-wide">
                Full name
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M2 13.5c0-2.5 2.7-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-[12.5px] font-semibold text-gray-700 tracking-wide">
                Email address
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-[12.5px] font-semibold text-gray-700 tracking-wide">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 p-1 rounded transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.7 6.8A2 2 0 0011 9.3M5 4.6C3 5.8 1.5 7.7 1.5 8s2.3 4 6.5 4c1.3 0 2.5-.4 3.5-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M13.2 10.7C14.3 9.6 14.5 8.3 14.5 8c0-.3-2.3-4-6.5-4-.8 0-1.5.1-2.2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M8 4C3.8 4 1.5 7.7 1.5 8s2.3 4 6.5 4 6.5-3.7 6.5-4-2.3-4-6.5-4z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                </button>
              </div>
              <PasswordPolicy password={password} />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-confirm" className="text-[12.5px] font-semibold text-gray-700 tracking-wide">
                Confirm password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-[38px] pr-24 py-[10px] text-[13.5px] text-gray-900 bg-gray-50 border-[1.5px] rounded-[10px] outline-none transition-all duration-150 font-medium placeholder:text-gray-400 ${confirmBorderClass}`}
                />
                {/* Eye button */}
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 p-1 rounded transition-colors duration-150"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.7 6.8A2 2 0 0011 9.3M5 4.6C3 5.8 1.5 7.7 1.5 8s2.3 4 6.5 4c1.3 0 2.5-.4 3.5-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M13.2 10.7C14.3 9.6 14.5 8.3 14.5 8c0-.3-2.3-4-6.5-4-.8 0-1.5.1-2.2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M8 4C3.8 4 1.5 7.7 1.5 8s2.3 4 6.5 4 6.5-3.7 6.5-4-2.3-4-6.5-4z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                </button>
                {/* Match badge */}
                {confirmPassword && (
                  <span
                    className="absolute right-9 top-1/2 -translate-y-1/2 text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap pointer-events-none"
                    style={{
                      background:   passwordsMatch ? '#f0fdf4' : '#fef2f2',
                      color:        passwordsMatch ? '#16a34a' : '#dc2626',
                      borderColor:  passwordsMatch ? '#86efac' : '#fca5a5',
                    }}
                  >
                    {passwordsMatch ? '✓ Match' : '✗ No match'}
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={`relative mt-1 w-full py-[11.5px] text-[14.5px] font-bold text-white rounded-[10px] border-none cursor-pointer tracking-tight transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed ${
                success 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_2px_12px_rgba(5,150,105,0.35)]' 
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[0_2px_12px_rgba(99,102,241,0.30)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.40)]'
              }`}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2.5">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"/>
                  Creating account…
                </span>
              ) : success ? (
                'Redirecting...'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-[12px] text-gray-400 text-center leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-indigo-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-gray-100"/>
            <span className="text-[11.5px] text-gray-300 font-medium">or</span>
            <span className="flex-1 h-px bg-gray-100"/>
          </div>

          {/* Sign in prompt */}
          <p className="text-center text-[13.5px] text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline ml-0.5">
              Sign in
            </Link>
          </p>

        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.45s ease both; }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 40px #f9fafb inset !important;
          -webkit-text-fill-color: #111827 !important;
        }
      `}</style>
    </div>
  );
}