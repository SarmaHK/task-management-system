import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import adminService from '../services/adminService';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  // Stats and logs state
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, pendingRequests: 0, totalLogs: 0 });
  const [nonAdminStats, setNonAdminStats] = useState({ assignedTasks: 0, dueToday: 0, projects: 0, unreadNotifications: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isAdmin) {
          const [statsRes, logsRes] = await Promise.all([
            adminService.getAdminStats(),
            adminService.getSystemLogs(),
          ]);
          if (statsRes.success) {
            setAdminStats(statsRes.data);
          }
          if (logsRes.success) {
            setLogs(logsRes.data);
          }
        } else {
          // Fetch non-admin dashboard stats
          const [projectsRes, tasksRes, notificationsRes] = await Promise.all([
            projectService.getAllProjects(),
            taskService.getAllTasks(),
            api.get('/notifications'),
          ]);

          const projectsList = projectsRes.data || projectsRes || [];
          const tasksList = tasksRes.data || tasksRes || [];
          const notificationsList = notificationsRes.data?.data || notificationsRes.data || [];

          // Assigned Tasks are tasks where the user is an assignee
          const assignedTasks = tasksList.filter(t => t.assignees?.some(a => a.userId === user?.id));
          
          // Tasks due today: pending tasks (TODO or IN_PROGRESS) where dueDate is today
          const nowStr = new Date().toISOString().split('T')[0];
          const dueToday = assignedTasks.filter(t => {
            if (t.status === 'COMPLETED' || !t.dueDate) return false;
            return t.dueDate.split('T')[0] === nowStr;
          }).length;

          // Unread notifications
          const unreadNotifications = notificationsList.filter(n => !n.isRead).length;

          setNonAdminStats({
            assignedTasks: assignedTasks.length,
            dueToday,
            projects: projectsList.length,
            unreadNotifications,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [isAdmin, user]);

  const getRoleBadgeColor = () => {
    const role = (user?.role || '').toUpperCase();
    if (role === 'ADMIN') {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (role === 'PROJECT_MANAGER') {
      return 'bg-violet-50 text-violet-800 border-violet-200';
    }
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  };

  const getStats = () => {
    if (isAdmin) {
      return [
        { label: 'Total Users', value: adminStats.totalUsers.toString(), icon: '👥', change: 'Registered users', path: '/admin/users?tab=users' },
        { label: 'Pending Requests', value: adminStats.pendingRequests.toString(), icon: '⏳', change: 'Awaiting approval', path: '/admin/users?tab=requests' },
        { label: 'System Logs', value: adminStats.totalLogs.toString(), icon: '📝', change: 'Activity logs', path: '#system-logs' },
      ];
    }
    return [
      { label: 'Assigned Tasks', value: nonAdminStats.assignedTasks.toString(), icon: '⏱️', change: `${nonAdminStats.dueToday} due today`, path: '/tasks' },
      { label: 'Projects', value: nonAdminStats.projects.toString(), icon: '📁', change: 'Active membership', path: '/projects' },
      { label: 'Notifications', value: nonAdminStats.unreadNotifications.toString(), icon: '🔔', change: 'Unread alerts', path: '/dashboard?notifications=open' },
    ];
  };

  const handleStatClick = (stat) => {
    if (!stat.path) return;
    if (stat.path.startsWith('#')) {
      const element = document.getElementById(stat.path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(stat.path);
    }
  };

  const getActionBadgeColor = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('REGISTER')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('DEACTIVATE') || act.includes('REJECT') || act.includes('DELETE')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (act.includes('UPDATE') || act.includes('RESET') || act.includes('CHANGE')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (act.includes('APPROVE')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
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
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="px-4 py-2.5 bg-white text-indigo-950 font-bold text-[13.5px] rounded-xl cursor-pointer shadow-sm transition-transform duration-100 hover:scale-[1.02]"
                >
                  👥 Manage Users
                </button>
              )}
            </div>
          </div>
        </section>
 
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {getStats().map((stat, i) => (
            <div
              key={stat.label}
              onClick={() => handleStatClick(stat)}
              className={`bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md animate-fadeUp ${stat.path ? 'cursor-pointer hover:border-indigo-300' : ''}`}
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
          
          <div className="w-full">
            <div className="bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-xl flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>
        </section>
 
        {/* System Activity Logs (Admin Only) */}
        {isAdmin && (
          <section id="system-logs" className="bg-white p-6 sm:p-8 rounded-2xl border border-indigo-100 shadow-sm animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[20px] font-bold text-indigo-950 tracking-tight flex items-center gap-2">
                📋 System Activity Logs
              </h2>
              <span className="text-[12px] text-gray-400 font-semibold uppercase tracking-wider">
                Last 10 events
              </span>
            </div>
 
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-[14px]">Loading activity logs...</div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[13.5px] p-4 rounded-xl font-medium">
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-[14px]">No system logs recorded yet.</div>
            ) : (
              <div className="overflow-hidden border border-gray-100 rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                        <th className="px-5 py-3">Timestamp</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-5 py-3.5 text-gray-500 text-[12.5px] font-medium whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'medium',
                            })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-indigo-950 text-[13px] font-medium leading-relaxed">
                            {log.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </DashboardLayout>
  );
}
