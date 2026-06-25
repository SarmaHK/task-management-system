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
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
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
    setError('');
    setSuccess('');
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
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
    setError('');
    setSuccess('');
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-[1200px] h-[800px] max-h-[90vh] bg-white rounded-3xl overflow-hidden flex shadow-2xl relative">
        
        {/* Left Side: Immersive Image */}
        <div className="hidden lg:block w-1/2 relative">
          <img 
            src="/login-bg.png" 
            alt="Abstract dark landscape" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 p-10 flex flex-col justify-between">
            <div className="flex justify-between items-center text-white">
              <span className="font-bold tracking-wide">TaskFlow Workspace</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col h-full relative">
          
          <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="TaskFlow Logo" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="font-black text-xl tracking-tighter text-gray-900">TASKFLOW</span>
            </div>
            <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
              Back to Login
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center px-10 sm:px-16 md:px-24">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Forgot Password</h1>
              <p className="text-gray-500 font-medium">
                {step === 1 && "Enter your email to receive a reset code."}
                {step === 2 && "Enter the 6-digit code sent to your email."}
                {step === 3 && "Create a new strong password."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl text-center">
                {success}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors mt-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="6-Digit Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-gray-400 font-medium text-center tracking-[0.5em]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors mt-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <div className="text-center mt-2">
                  <button 
                    type="button" 
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors mt-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
