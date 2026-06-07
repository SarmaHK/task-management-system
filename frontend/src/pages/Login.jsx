import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);
  const shineRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const runShine = () => {
    if (!shineRef.current) return;
    shineRef.current.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (shineRef.current) shineRef.current.style.transform = 'translateX(-100%)';
    }, 420);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    // 1. Bulletproof frontend validation: Block empty emails
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    runShine();

    try {
      const data = await login(email, password);
      setSuccess(true);
      
      setTimeout(() => {
        if (data.user?.firstLogin) {
          navigate('/setup-password');
        } else {
          navigate('/dashboard');
        }
      }, 900);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen font-sans bg-indigo-50">

      {/* ── Left indigo panel (desktop only) ───────────────────── */}
      <div
        data-brand
        className="hidden lg:flex flex-col justify-between w-[44%] flex-shrink-0 relative overflow-hidden px-10 py-9"
        style={{ background: 'linear-gradient(160deg,#3730a3 0%,#4f46e5 45%,#6366f1 100%)' }}
      >
        {/* Geometric SVG texture — can't do this in Tailwind */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 600" fill="none" preserveAspectRatio="xMidYMid slice">
          <line x1="0"   y1="100" x2="320" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="0"   y1="200" x2="320" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="0"   y1="300" x2="320" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="0"   y1="400" x2="320" y2="400" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="0"   y1="500" x2="320" y2="500" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="80"  y1="0"   x2="80"  y2="600" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="160" y1="0"   x2="160" y2="600" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="240" y1="0"   x2="240" y2="600" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <circle cx="160" cy="300" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"/>
          <circle cx="160" cy="300" r="80"  stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
          <circle cx="160" cy="300" r="40"  stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none"/>
          <path d="M0 0 L60 0 L60 2 L2 2 L2 60 L0 60 Z"                    fill="rgba(255,255,255,0.12)"/>
          <path d="M320 600 L260 600 L260 598 L318 598 L318 540 L320 540 Z" fill="rgba(255,255,255,0.12)"/>
        </svg>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-[3px] w-[22px] h-[22px] flex-shrink-0">
            <span className="rounded-[3px] bg-white block"/>
            <span className="rounded-[3px] block" style={{background:'rgba(255,255,255,.55)'}}/>
            <span className="rounded-[3px] block" style={{background:'rgba(255,255,255,.38)'}}/>
            <span className="rounded-[3px] block" style={{background:'rgba(255,255,255,.75)'}}/>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">TaskFlow</span>
        </div>

        {/* Floating Kanban illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-6">
          <div className="animate-float">
            <svg width="220" height="210" viewBox="0 0 220 210" fill="none">
              <rect x="20" y="20" width="180" height="170" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
              <rect x="32" y="34" width="46" height="14" rx="4" fill="rgba(255,255,255,0.20)"/>
              <rect x="87" y="34" width="46" height="14" rx="4" fill="rgba(255,255,255,0.15)"/>
              <rect x="142" y="34" width="46" height="14" rx="4" fill="rgba(255,255,255,0.12)"/>
              <line x1="32" y1="55" x2="188" y2="55" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
              <rect x="32"  y="62"  width="46" height="32" rx="6" fill="rgba(255,255,255,0.18)"/>
              <rect x="37"  y="68"  width="28" height="4"  rx="2" fill="rgba(255,255,255,0.5)"/>
              <rect x="37"  y="76"  width="20" height="3"  rx="1.5" fill="rgba(255,255,255,0.3)"/>
              <rect x="32"  y="100" width="46" height="32" rx="6" fill="rgba(255,255,255,0.13)"/>
              <rect x="37"  y="106" width="22" height="4"  rx="2" fill="rgba(255,255,255,0.4)"/>
              <rect x="37"  y="114" width="16" height="3"  rx="1.5" fill="rgba(255,255,255,0.25)"/>
              <rect x="32"  y="138" width="46" height="32" rx="6" fill="rgba(255,255,255,0.10)"/>
              <rect x="37"  y="144" width="30" height="4"  rx="2" fill="rgba(255,255,255,0.35)"/>
              <rect x="87"  y="62"  width="46" height="32" rx="6" fill="rgba(255,255,255,0.22)"/>
              <rect x="92"  y="68"  width="24" height="4"  rx="2" fill="rgba(255,255,255,0.6)"/>
              <rect x="92"  y="76"  width="18" height="3"  rx="1.5" fill="rgba(255,255,255,0.35)"/>
              <circle cx="120" cy="72" r="5" fill="rgba(255,255,255,0.25)"/>
              <path d="M117.5 72 L119.5 74 L122.5 70" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="87"  y="100" width="46" height="32" rx="6" fill="rgba(255,255,255,0.14)"/>
              <rect x="92"  y="106" width="26" height="4"  rx="2" fill="rgba(255,255,255,0.45)"/>
              <rect x="142" y="62"  width="46" height="32" rx="6" fill="rgba(255,255,255,0.10)"/>
              <rect x="147" y="68"  width="20" height="4"  rx="2" fill="rgba(255,255,255,0.3)"/>
              <rect x="130" y="155" width="60" height="22" rx="8" fill="#fff" opacity="0.95"/>
              <circle cx="143" cy="166" r="5" fill="#4f46e5"/>
              <rect x="151" y="163" width="32" height="3"   rx="1.5"  fill="#4f46e5" opacity="0.6"/>
              <rect x="151" y="168" width="22" height="2.5" rx="1.25" fill="#6366f1" opacity="0.4"/>
              <circle cx="143" cy="166" r="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          
          {/* 1. Heading fades up immediately */}
          <h2 
            className="text-2xl font-semibold text-white leading-snug mb-2.5 tracking-tight italic animate-fadeUp" 
            style={{ fontFamily: "'Fraunces',serif" }}
          >
            Every task in its<br/>right place.
          </h2>
          
          {/* 2. Subtext fades up 0.1s later */}
          <p 
            className="text-[13px] text-white/55 leading-relaxed font-medium max-w-[220px] animate-fadeUp"
            style={{ animationDelay: '0.1s' }}
          >
            High-performance task management for teams who ship.
          </p>
          
          {/* 3. Trust row fades up 0.2s later */}
          <div 
            className="flex items-center gap-2.5 mt-5 pt-[18px] border-t border-white/10 animate-fadeUp"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex">
              {['A','B','C'].map((l, i) => (
                <div
                  key={l}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2"
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(79,70,229,0.6)',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 3 - i,
                    position: 'relative',
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="text-[12px] text-white/60 font-medium">2,400+ teams trust TaskFlow</span>
          </div>
        </div>
      </div>

      {/* ── Right white form panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[390px] animate-fadeUp" style={{animationDelay:'0.1s'}}>

          {/* Mobile logo — hidden on lg+ */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="grid grid-cols-2 gap-[3px] w-[22px] h-[22px]">
              <span className="rounded-[3px] bg-indigo-600 block"/>
              <span className="rounded-[3px] bg-indigo-400 block"/>
              <span className="rounded-[3px] bg-indigo-300 block"/>
              <span className="rounded-[3px] bg-indigo-500 block"/>
            </div>
            <span className="text-[15px] font-bold text-indigo-900 tracking-tight">TaskFlow</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <span className="inline-block text-[12px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 tracking-wide">
              👋 Welcome back
            </span>
            <h2 className="text-[26px] font-bold text-indigo-950 tracking-tight leading-tight mb-1.5">
              Sign in to TaskFlow
            </h2>
            <p className="text-[13.5px] text-gray-500 font-medium leading-snug">
              Enter your credentials to access your workspace.
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

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-800 font-medium mb-5 animate-fadeUp">
              <svg className="flex-shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="#059669"/>
                <path d="M5 8l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Redirecting to password setup…
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-[12.5px] font-semibold text-gray-700 tracking-wide">
                Email address
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors duration-150" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-[38px] pr-3.5 py-[11px] text-[13.5px] text-gray-900 bg-gray-50 border-[1.5px] border-gray-200 rounded-[10px] outline-none transition-all duration-150 font-medium placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="login-pw" className="text-[12.5px] font-semibold text-gray-700 tracking-wide">
                  Password
                </label>
                <a href="#" className="text-[12px] font-semibold text-indigo-600 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors duration-150" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="login-pw"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-[38px] pr-10 py-[11px] text-[13.5px] text-gray-900 bg-gray-50 border-[1.5px] border-gray-200 rounded-[10px] outline-none transition-all duration-150 font-medium placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 p-1 rounded transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.7 6.8A2 2 0 0011 9.3M5 4.6C3 5.8 1.5 7.7 1.5 8s2.3 4 6.5 4c1.3 0 2.5-.4 3.5-1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                      <path d="M13.2 10.7C14.3 9.6 14.5 8.3 14.5 8c0-.3-2.3-4-6.5-4-.8 0-1.5.1-2.2.3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 4C3.8 4 1.5 7.7 1.5 8s2.3 4 6.5 4 6.5-3.7 6.5-4-2.3-4-6.5-4z" stroke="currentColor" strokeWidth="1.25"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Dev: type{' '}
                <code className="bg-gray-100 border border-gray-200 rounded px-1 py-px text-[10.5px] text-gray-600 font-mono">
                  admin123
                </code>{' '}
                to test reset redirect
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || success}
              onMouseEnter={runShine}
              className={`
                relative mt-1 w-full py-[12.5px] text-[14.5px] font-bold text-white rounded-[10px]
                border-none cursor-pointer overflow-hidden tracking-tight
                transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed
                ${success
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_2px_12px_rgba(5,150,105,0.35)]'
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[0_2px_12px_rgba(99,102,241,0.30),0_1px_3px_rgba(99,102,241,0.20)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.40)]'
                }
              `}
            >
              {/* Shine sweep — inline style needed for JS-controlled transform */}
              <span
                ref={shineRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform .42s ease',
                }}
                aria-hidden="true"
              />
              {isLoading && !success && (
                <span className="inline-flex items-center gap-2.5">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"/>
                  Signing in…
                </span>
              )}
              {success  && '↗ Redirecting…'}
              {!isLoading && !success && 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-[22px]">
            <span className="flex-1 h-px bg-gray-100"/>
            <span className="text-[11.5px] text-gray-300 font-medium">or</span>
            <span className="flex-1 h-px bg-gray-100"/>
          </div>

          {/* Register prompt */}
          <p className="text-center text-[13px] text-gray-500 font-medium">
            No account yet?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline ml-0.5">
              Create one free →
            </Link>
          </p>

          {/* Role badges */}
          <div className="flex justify-center gap-1.5 mt-5 flex-wrap">
            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">admin</span>
            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-900">project_manager</span>
            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900">collaborator</span>
          </div>

        </div>
      </div>

      {/* Global keyframes — only things Tailwind can't handle */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-9px); }
        }

        .animate-fadeUp  { animation: fadeUp  0.45s ease both; }
        .animate-float   { animation: float   4s ease-in-out infinite; }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 40px #f9fafb inset !important;
          -webkit-text-fill-color: #111827 !important;
        }
      `}</style>
    </div>
  );
}