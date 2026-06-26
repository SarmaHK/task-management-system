import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);
      setSuccess(true);
      
      setTimeout(() => {
        if (data.user?.mustChangePassword) {
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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* Main Container */}
      <div className="w-full max-w-[1200px] h-[800px] max-h-[90vh] bg-white rounded-3xl overflow-hidden flex shadow-2xl relative">
        
        {/* Left Side: Immersive Image (Hidden on smaller screens) */}
        <div className="hidden lg:block w-1/2 relative">
          <img 
            src="/login-bg.png" 
            alt="Abstract dark landscape" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay content on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 p-10 flex flex-col justify-between">
            <div className="flex justify-between items-center text-white">
              <span className="font-bold tracking-wide">TaskFlow Workspace</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 overflow-hidden border-2 border-white/20">
                <img src="https://ui-avatars.com/api/?name=Admin&background=2563EB&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">System Admin</p>
                <p className="text-white/70 text-sm">Task Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col h-full relative">
          
          {/* Top Header */}
          <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="TaskFlow Logo" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="font-black text-xl tracking-tighter text-gray-900">TASKFLOW</span>
            </div>

          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center px-10 sm:px-16 md:px-24">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome</h1>
              <p className="text-gray-500 font-medium">Welcome to TaskFlow Workspace</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl text-center">
                Login successful! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="flex flex-col">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-gray-400 font-medium"
                  required
                />
              </div>

              <div className="flex flex-col">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-gray-400 font-medium"
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-xs text-red-500 hover:text-red-600 font-medium">Forgot password ?</Link>
                </div>
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors mt-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}