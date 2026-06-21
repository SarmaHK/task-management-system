import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleBadgeColor = () => {
    const role = (user?.role || '').toLowerCase();
    if (role === 'administrator' || role === 'admin') {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (role === 'project manager') {
      return 'bg-violet-50 text-violet-800 border-violet-200';
    }
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  };

  const getStats = () => {
    const role = (user?.role || '').toLowerCase();
    if (role === 'administrator' || role === 'admin') {
      return [
        { label: 'Total Users', value: '24', icon: '👤', change: '+2 this week' },
        { label: 'Active Projects', value: '8', icon: '📁', change: 'All healthy' },
        { label: 'System Logs', value: '142', icon: '📝', change: 'Normal status' },
      ];
    }
    return [
      { label: 'Assigned Tasks', value: '5', icon: '⏱️', change: '2 due today' },
      { label: 'Projects', value: '3', icon: '📁', change: 'Active membership' },
      { label: 'Notifications', value: '4', icon: '🔔', change: 'Unread alerts' },
    ];
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        
        {/* Welcome Header Banner */}
        <section className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md animate-fadeUp">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 320 120" fill="none" preserveAspectRatio="none">
            <circle cx="280" cy="60" r="100" stroke="#fff" strokeWidth="1" />
            <circle cx="280" cy="60" r="70" stroke="#fff" strokeWidth="1" />
            <circle cx="280" cy="60" r="40" stroke="#fff" strokeWidth="1" />
          </svg>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[12px] font-bold uppercase tracking-wider bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/30">
                  Dashboard
                </span>
                <span className={`text-[11px] font-semibold tracking-wide border px-2.5 py-0.5 rounded-full ${getRoleBadgeColor()}`}>
                  {user?.role}
                </span>
              </div>
              <h1 className="text-[28px] font-bold tracking-tight mb-1.5">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-[14px] text-indigo-200/80 font-medium max-w-xl">
                Ready to manage your workspace? Here is a quick snapshot of what is happening across your projects today.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              
              {/* TARGET 1: Hide the top New Task button from Collaborators */}
              {user?.role !== 'Collaborator' && (
                <button
                  onClick={() => navigate('/tasks/create')}
                  className="px-4 py-2.5 bg-white text-indigo-950 font-bold text-[13.5px] rounded-xl cursor-pointer shadow-sm transition-transform duration-100 hover:scale-[1.02]"
                >
                  🆕 New Task
                </button>
              )}

              <button
                onClick={() => navigate('/tasks')}
                className="px-4 py-2.5 bg-indigo-700/50 border border-indigo-500/40 text-white font-bold text-[13.5px] rounded-xl cursor-pointer transition-transform duration-100 hover:scale-[1.02]"
              >
                📋 My Tasks
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {getStats().map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-md animate-fadeUp"
              style={{ animationDelay: `${0.05 * (i + 1)}s` }}
            >
              <div>
                <span className="text-gray-400 font-semibold text-[13px] tracking-wide uppercase">{stat.label}</span>
                <p className="text-[28px] font-extrabold text-indigo-950 tracking-tight mt-1 mb-0.5">{stat.value}</p>
                <span className="text-[11.5px] text-emerald-600 font-semibold">{stat.change}</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-2xl flex items-center justify-center rounded-xl">
                {stat.icon}
              </div>
            </div>
          ))}
        </section>

        {/* Profile Card & Details */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-indigo-100 shadow-sm animate-fadeUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-[20px] font-bold text-indigo-950 tracking-tight mb-5 flex items-center gap-2">
            🔐 Account & Security Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</span>
                <span className="text-[14.5px] font-bold text-indigo-950">{user?.name}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-[14.5px] font-bold text-indigo-950">{user?.email}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Access Role</span>
                <span className="text-[14.5px] font-bold text-indigo-950">{user?.role}</span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-4 border border-gray-100 rounded-xl">
              <div>
                <h4 className="text-[14px] font-bold text-indigo-950 mb-1">Quick Actions</h4>
                <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                  Authentication is fully configured with JWT. Refresh tokens are secured via HTTP-Only cookies.
                </p>
              </div>
              
              <div className="mt-4 pt-3.5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => navigate('/tasks')}
                  className="px-3.5 py-2 bg-indigo-600 text-white font-bold text-[12px] rounded-lg cursor-pointer transition-colors hover:bg-indigo-500 shadow-sm"
                >
                  View All Tasks
                </button>

                {/* TARGET 2: Hide the bottom New Task button from Collaborators */}
                {user?.role !== 'Collaborator' && (
                  <button
                    onClick={() => navigate('/tasks/create')}
                    className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[12px] rounded-lg cursor-pointer transition-colors hover:bg-indigo-100"
                  >
                    + New Task
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

