import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (isLoading) return;
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError(''); setSuccess('');
    if (!otp || otp.length !== 6) { setError('Please enter a valid 6-digit code.'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('Code verified successfully.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError(''); setSuccess('');
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step info
  const stepInfo = {
    1: { heading: 'Forgot Password', sub: 'Enter your email to receive a reset code.' },
    2: { heading: 'Verify Code',     sub: 'Enter the 6-digit code sent to your email.' },
    3: { heading: 'New Password',    sub: 'Create a new strong password.' },
  };

  const PrimaryButton = ({ loading, loadingLabel, label, disabled }) => (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-300
        bg-gradient-to-r from-[#118B95] to-[#0D5A60]
        hover:from-[#0D5A60] hover:to-[#094246]
        hover:shadow-xl hover:shadow-[#118B95]/25 hover:-translate-y-0.5
        disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
        flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingLabel}
        </>
      ) : label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F5] dark:bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* ── Background Decorations ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#BEE3E6] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#93CFD4] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-[#118B95] rounded-full mix-blend-multiply filter blur-[130px] opacity-30 animate-blob animation-delay-4000" />

      <div className="w-full max-w-[1100px] bg-white dark:bg-slate-800 rounded-3xl overflow-hidden flex shadow-2xl shadow-[#0D5A60]/10 dark:shadow-black/40 relative z-10 transition-colors duration-300">

        {/* ══ LEFT SIDE — Image Panel ══════════════════════════════ */}
        <div className="hidden lg:flex relative w-[52%] flex-shrink-0 bg-[#0D5A60] overflow-hidden" style={{ minHeight: '600px' }}>
          <img
            src="/Logincard.png"
            alt="TaskFlow Dashboard Preview"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D5A60]/70 via-transparent to-[#0D5A60]/80" />
          <div className="absolute top-6 left-6 z-10">
            <span className="text-white font-bold text-base tracking-wide drop-shadow-md">TaskFlow Workspace</span>
          </div>
        </div>

        {/* ══ RIGHT SIDE — Form ════════════════════════════════════ */}
        <div className="flex-1 relative bg-white dark:bg-slate-800 flex flex-col justify-center px-10 sm:px-14 py-12 overflow-hidden transition-colors duration-300">

          {/* Dotted pattern — top right */}
          <div className="absolute top-8 right-8 grid grid-cols-7 gap-[6px] opacity-30 pointer-events-none">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="w-[4px] h-[4px] rounded-full bg-[#118B95]" />
            ))}
          </div>

          {/* Decorative circles */}
          <div className="absolute bottom-[-60px] right-[-60px] w-44 h-44 rounded-full bg-[#E6F5F6] opacity-60 pointer-events-none" />
          <div className="absolute top-[38%] right-[-20px] w-14 h-14 rounded-full bg-[#BEE3E6] opacity-40 pointer-events-none" />

          {/* ── Logo + Back to Login ── */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-[3px]">
                <div className="w-4 h-4 rounded-sm bg-[#118B95]" />
                <div className="w-4 h-4 rounded-sm bg-[#2AA7B3]" />
                <div className="w-4 h-4 rounded-sm bg-[#2AA7B3]" />
                <div className="w-4 h-4 rounded-sm bg-[#0D5A60]" />
              </div>
              <span className="text-xl font-black text-[#0D5A60] tracking-widest uppercase">TaskFlow</span>
            </div>
            <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-[#118B95] transition-colors">
              Back to Login
            </Link>
          </div>

          {/* ── Step Progress Dots ── */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'bg-[#118B95] w-8' : s < step ? 'bg-[#2AA7B3] w-4' : 'bg-gray-200 w-4'}`} />
            ))}
          </div>

          {/* ── Heading ── */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{stepInfo[step].heading}</h1>
            <p className="text-gray-400 font-medium text-sm">{stepInfo[step].sub}</p>
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl text-center">
              {success}
            </div>
          )}

          {/* ══ STEP 1: Send Email ══ */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-800 dark:text-white font-medium bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#118B95] focus:ring-2 focus:ring-[#118B95]/10 transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500"
                />
              </div>
              <PrimaryButton loading={isLoading} loadingLabel="Sending..." label="Send Verification Code" />
            </form>
          )}

          {/* ══ STEP 2: Enter OTP ══ */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="6-Digit Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-800 dark:text-white font-medium bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#118B95] focus:ring-2 focus:ring-[#118B95]/10 transition-all text-center tracking-[0.5em] placeholder:tracking-normal placeholder:text-gray-300 dark:placeholder:text-slate-500"
                />
              </div>
              <PrimaryButton loading={isLoading} loadingLabel="Verifying..." label="Verify Code" disabled={otp.length !== 6} />
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="text-sm font-semibold text-gray-400 hover:text-[#118B95] transition-colors cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* ══ STEP 3: New Password ══ */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-800 dark:text-white font-medium bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#118B95] focus:ring-2 focus:ring-[#118B95]/10 transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#118B95] transition-colors cursor-pointer"
                >
                  {showNewPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-800 dark:text-white font-medium bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#118B95] focus:ring-2 focus:ring-[#118B95]/10 transition-all placeholder:text-gray-300 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#118B95] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <PrimaryButton loading={isLoading} loadingLabel="Resetting..." label="Reset Password" />
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
