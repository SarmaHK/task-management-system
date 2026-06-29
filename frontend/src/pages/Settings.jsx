import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../utils/ToastContext';
import DashboardLayout from '../components/DashboardLayout';

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty.'); return; }
    try {
      setProfileSaving(true);
      await updateProfile(name);
      toast.success('Profile details updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile details.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) { toast.error('Current password is required.'); return; }
    if (!newPassword) { toast.error('New password is required.'); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match.'); return; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    try {
      setPasswordUpdating(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const roleLabel = user?.role ? user.role.toLowerCase().replace('_', ' ') : 'N/A';

  const InputField = ({ label, icon, type = 'text', ...props }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (show ? 'text' : 'password') : type;
    return (
      <div className="group">
        <label className="block text-xs font-bold text-[#3F3F46]/60 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</label>
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#118B95]/60 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            {...props}
            className={`w-full ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3 bg-[#F7F8F9] dark:bg-slate-900/50 border-2 border-transparent dark:border-slate-700 rounded-2xl text-sm text-[#3F3F46] dark:text-white font-medium placeholder:text-gray-300 dark:placeholder:text-slate-500 transition-all duration-200 outline-none
              focus:border-[#118B95] focus:bg-white dark:focus:bg-slate-800 focus:shadow-[0_0_0_4px_rgba(17,139,149,0.08)]
              disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#118B95] transition-colors cursor-pointer"
            >
              {show ? (
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
          )}
        </div>
      </div>
    );
  };

  const SpinnerButton = ({ saving, label, savingLabel, disabled }) => (
    <button
      type="submit"
      disabled={saving || disabled}
      className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer
        bg-gradient-to-r from-[#118B95] to-[#0D5A60]
        hover:from-[#0D5A60] hover:to-[#094246]
        hover:shadow-lg hover:shadow-[#118B95]/25 hover:-translate-y-0.5
        disabled:from-[#93CFD4] disabled:to-[#93CFD4] disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
    >
      {saving ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {savingLabel}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {label}
        </>
      )}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-fadeUp">

        {/* ── Profile Banner ─────────────────────────────────────── */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="h-36 bg-gradient-to-r from-[#0D5A60] via-[#118B95] to-[#2AA7B3] relative">
            {/* Decorative circles */}
            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute bottom-[-60px] right-[15%] w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute top-2 left-[40%] w-24 h-24 rounded-full bg-white/5" />
            {/* Dots pattern */}
            <div className="absolute top-4 right-8 grid grid-cols-6 gap-1.5 opacity-20">
              {Array.from({length: 24}).map((_,i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
              ))}
            </div>
          </div>

          {/* Avatar + Name Row */}
          <div className="bg-white dark:bg-slate-800 px-8 pb-5 pt-0 flex items-end gap-5 transition-colors duration-200">
            <div className="relative -mt-10 shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0D5A60] to-[#2AA7B3] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-[#118B95]/30 border-4 border-white">
                {getInitials(user?.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white" title="Active" />
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <h2 className="text-xl font-black text-[#0D5A60] dark:text-white truncate">{user?.name || 'User'}</h2>
              <p className="text-sm text-gray-400 dark:text-slate-400 font-medium truncate">{user?.email}</p>
            </div>
            <div className="pb-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F5F6] dark:bg-[#118B95]/10 text-[#0D5A60] dark:text-[#2AA7B3] text-xs font-black rounded-xl border border-[#93CFD4] dark:border-[#118B95]/30 uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Page Title ─────────────────────────────────────────── */}
        <div className="mb-6 px-1">
          <h1 className="text-2xl font-black text-[#0D5A60] dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-sm text-gray-400 dark:text-slate-400 mt-1 font-medium">Manage your personal information and change your password.</p>
        </div>

        {/* ── Two Column Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* Card 1: Personal Details */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:shadow-[#118B95]/5 transition-all duration-300">
            
            {/* Card header bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#118B95] to-[#2AA7B3]" />
            
            <div className="p-7 flex flex-col flex-1">
              {/* Section Title */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F5F6] flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-[#118B95]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#3F3F46] dark:text-white">Personal Details</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">Your personal identity info.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col gap-5">
                
                <InputField
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <InputField
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  placeholder="Email"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <div>
                  <label className="block text-xs font-bold text-[#3F3F46]/60 dark:text-slate-400 uppercase tracking-widest mb-2">System Role</label>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E6F5F6] dark:bg-[#118B95]/10 border-2 border-[#93CFD4]/40 dark:border-[#118B95]/30 text-[#0D5A60] dark:text-[#2AA7B3] text-sm font-black rounded-2xl capitalize">
                    <div className="w-2 h-2 rounded-full bg-[#118B95]" />
                    {roleLabel}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <SpinnerButton
                    saving={profileSaving}
                    disabled={name === user?.name}
                    label="Save Profile"
                    savingLabel="Saving..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Card 2: Security & Password */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300">
            
            {/* Card header bar */}
            <div className="h-1 w-full bg-gradient-to-r from-rose-400 to-orange-400" />
            
            <div className="p-7 flex flex-col flex-1">
              {/* Section Title */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#3F3F46] dark:text-white">Security & Password</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">Secure your system access.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="flex-1 flex flex-col gap-5">

                <InputField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  }
                />

                <InputField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <InputField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                />

                <div className="mt-auto pt-2">
                  <SpinnerButton
                    saving={passwordUpdating}
                    label="Save Password"
                    savingLabel="Saving..."
                  />
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
