import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordPolicy from '../components/PasswordPolicy';
import { useAuth } from '../context/AuthContext';

export default function ForceResetPassword() {
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword,       setNewPassword]       = useState('');
  const [confirmPassword,   setConfirmPassword]   = useState('');
  const [showTemporary,     setShowTemporary]     = useState(false);
  const [showNew,           setShowNew]           = useState(false);
  const [showConfirm,       setShowConfirm]       = useState(false);
  const [isLoading,         setIsLoading]         = useState(false);
  const [error,             setError]             = useState('');
  const [success,           setSuccess]           = useState(false);
  const navigate = useNavigate();
  const { firstLoginReset } = useAuth();

  const allRulesPassed = [
    newPassword.length >= 8,
    /[A-Z]/.test(newPassword),
    /[a-z]/.test(newPassword),
    /\d/.test(newPassword),
    /[^A-Za-z0-9]/.test(newPassword),
  ].every(Boolean);

  const passwordsMatch    = confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  const confirmBorderClass = passwordsMismatch
    ? 'border-red-300   focus:border-red-400   focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
    : passwordsMatch
    ? 'border-emerald-300 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
    : 'border-gray-200  focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!temporaryPassword) {
      setError('Please enter your temporary password.');
      return;
    }
    if (!allRulesPassed) {
      setError('Your password does not meet all the requirements below.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setIsLoading(true);
    try {
      await firstLoginReset(temporaryPassword, newPassword);
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your temporary password.');
      setIsLoading(false);
    }
  };

  const inputCls = 'w-full pl-[38px] pr-3.5 py-[10px] text-[13.5px] text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900/50 border-[1.5px] border-gray-200 dark:border-slate-700 rounded-[10px] outline-none transition-all duration-150 font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#118B95] focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_3px_rgba(17,139,149,0.12)]';

  return (
    <div className="flex min-h-screen font-sans bg-[#E6F5F6] dark:bg-slate-900 relative transition-colors duration-300">

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
            <h4 className="text-[14px] font-bold text-gray-900 tracking-tight mb-0.5">Password updated!</h4>
            <p className="text-[12.5px] text-gray-500 font-medium">Redirecting to sign in...</p>
          </div>
        </div>
      )}

      {/* ── Left indigo panel (desktop only) ───────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 flex-shrink-0 relative overflow-hidden px-12 py-12"
        style={{ background: 'linear-gradient(145deg,#1e1b4b 0%,#312e81 55%,#4338ca 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right,rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(99,102,241,0.07) 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect x="0"  y="0"  width="12" height="12" rx="3" fill="#6366f1"/>
            <rect x="16" y="0"  width="12" height="12" rx="3" fill="#818cf8" opacity="0.7"/>
            <rect x="0"  y="16" width="12" height="12" rx="3" fill="#818cf8" opacity="0.5"/>
            <rect x="16" y="16" width="12" height="12" rx="3" fill="#6366f1" opacity="0.9"/>
          </svg>
          <span className="text-[15px] font-semibold text-white tracking-tight">TaskFlow</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center pt-12">
          <h1 className="text-[clamp(34px,3.2vw,50px)] font-semibold text-indigo-100 leading-tight tracking-tight mb-4 animate-fadeUp">
            Keep your<br/>
            <span className="italic text-indigo-300" style={{fontFamily:"'Instrument Serif',serif"}}>
              account secure.
            </span>
          </h1>
          <p className="text-[14px] text-indigo-300 leading-relaxed max-w-[340px] mb-9 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            You're signing in with a temporary password. Set a strong new password to protect your account and access the platform.
          </p>

          <div className="flex flex-col gap-4 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: '🔒', text: 'Use a unique password not used elsewhere' },
              { icon: '🔡', text: 'Mix uppercase, numbers & special characters' },
              { icon: '🚫', text: 'Never share your password with anyone' },
            ].map((tip) => (
              <div key={tip.text} className="flex items-center gap-3.5">
                <span className="text-[16px]">{tip.icon}</span>
                <span className="text-[13.5px] text-indigo-200">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-full border border-indigo-400/25 self-start mt-8 animate-fadeUp" style={{ background: 'rgba(99,102,241,0.2)', animationDelay: '0.3s' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L14 4v4c0 3.5-2.5 6-6 7C2.5 14 0 11.5 0 8V4L8 1.5z" stroke="#a5b4fc" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5 8l2 2 4-4" stroke="#a5b4fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px] text-indigo-200">This session is encrypted and secure</span>
        </div>
      </div>

      {/* ── Right white form panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white dark:bg-slate-800 overflow-y-auto transition-colors duration-300">
        <div className="w-full max-w-[400px] animate-fadeUp" style={{animationDelay:'0.1s'}}>

          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="0"  y="0"  width="12" height="12" rx="3" fill="#6366f1"/>
              <rect x="16" y="0"  width="12" height="12" rx="3" fill="#818cf8" opacity="0.7"/>
              <rect x="0"  y="16" width="12" height="12" rx="3" fill="#818cf8" opacity="0.5"/>
              <rect x="16" y="16" width="12" height="12" rx="3" fill="#6366f1" opacity="0.9"/>
            </svg>
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight">TaskFlow</span>
          </div>

          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-800 font-medium mb-6 leading-snug">
            <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7.5" stroke="#d97706" />
              <path d="M8 4.5v4M8 10.5v1" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            You must set a new password before continuing.
          </div>

          <div className="mb-7">
            <h2 className="text-[26px] font-bold text-indigo-950 dark:text-white tracking-tight leading-tight mb-1.5">
              Set your password
            </h2>
            <p className="text-[13.5px] text-gray-500 font-medium">
              Choose a strong password to secure your account
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-800 font-medium mb-5" role="alert">
              <svg className="flex-shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="#dc2626"/>
                <path d="M8 4.5v4M8 10.5v1" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="temporaryPassword" className="text-[12.5px] font-semibold text-gray-700 dark:text-slate-300 tracking-wide">
                Temporary password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="temporaryPassword"
                  type={showTemporary ? 'text' : 'password'}
                  required
                  placeholder="Enter temporary password"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowTemporary(!showTemporary)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2AA7B3] p-1 rounded transition-colors"
                >
                  {showTemporary ? (
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-[12.5px] font-semibold text-gray-700 dark:text-slate-300 tracking-wide">
                New password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2AA7B3] p-1 rounded transition-colors"
                >
                  {showNew ? (
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
              <PasswordPolicy password={newPassword} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-[12.5px] font-semibold text-gray-700 dark:text-slate-300 tracking-wide">
                Confirm new password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L14 4v4c0 3.5-2.5 6-6 7C2.5 14 0 11.5 0 8V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-[38px] pr-24 py-[10px] text-[13.5px] text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900/50 border-[1.5px] rounded-[10px] outline-none transition-all duration-150 font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 ${confirmBorderClass}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2AA7B3] p-1 rounded transition-colors"
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

            <button
              type="submit"
              disabled={isLoading || success}
              className={`relative mt-2 w-full py-[11.5px] text-[14.5px] font-bold text-white rounded-[10px] border-none cursor-pointer tracking-tight transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed ${
                success 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_2px_12px_rgba(5,150,105,0.35)]' 
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[0_2px_12px_rgba(99,102,241,0.30)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.40)]'
              }`}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2.5">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"/>
                  Saving password…
                </span>
              ) : success ? (
                'Redirecting...'
              ) : (
                'Set new password'
              )}
            </button>
          </form>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeUp { animation: fadeUp 0.45s ease both; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #f9fafb inset !important; -webkit-text-fill-color: #111827 !important; }
      `}</style>
    </div>
  );
}