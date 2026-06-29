import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import adminService from '../services/adminService';
import taskService from '../services/taskService';
import projectService from '../services/projectService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  // State for task metrics (Users & PMs)
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    totalTasks: 0,
    recentTasks: [],
    upcomingDeadlines: [],
    allTasks: [],
  });
  
  // State for admin metrics
  const [adminMetrics, setAdminMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    recentUsers: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (isAdmin) {
          const [usersRes, projRes] = await Promise.all([
            adminService.getUsersList(),
            projectService.getProjects(),
          ]);
          
          if (usersRes.success && projRes.success) {
            const users = usersRes.data;
            const projects = projRes.data;
            
            const activeUsers = users.filter(u => u.isActive).length;
            const recentUsers = [...users].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

            setAdminMetrics({
              totalUsers: users.length,
              activeUsers,
              totalProjects: projects.length,
              recentUsers,
            });
          }
        } else {
          const [tasksRes, projRes] = await Promise.all([
            taskService.getAllTasks(),
            projectService.getAllProjects(),
          ]);

          if (tasksRes.success && projRes.success) {
            const tasks = tasksRes.data;
            const projects = projRes.data;
            
            const activeTasks = tasks.filter(t => t.status !== 'COMPLETED').length;
            const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
            const todoTasks = tasks.filter(t => t.status === 'TODO').length;
            const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
            const overdueTasks = tasks.filter(t => {
              if (t.status === 'COMPLETED') return false;
              return t.dueDate && new Date(t.dueDate) < new Date();
            }).length;

            const recentTasks = [...tasks].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);
            const upcomingDeadlines = [...tasks].filter(t => t.status !== 'COMPLETED' && t.dueDate).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4);

            setMetrics({
              totalProjects: projects.length,
              activeTasks,
              completedTasks,
              overdueTasks,
              todoTasks,
              inProgressTasks,
              totalTasks: tasks.length,
              recentTasks,
              upcomingDeadlines,
              allTasks: tasks,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  const MetricCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            ↑ {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{loading ? '-' : value}</p>
      </div>
    </div>
  );

  // ─── ADMIN DASHBOARD RENDER ──────────────────────────────────────────────
  if (isAdmin) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeUp">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">System Administration</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Overview of system health, users, and workspaces.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/admin/users')}
                className="bg-[#118B95] hover:bg-[#0D5A60] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Manage Users
              </button>
            </div>
          </div>

          {/* Admin Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard 
              title="Total System Users" 
              value={adminMetrics.totalUsers}
              color="bg-[#E6F5F6] text-[#118B95]"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <MetricCard 
              title="Active Accounts" 
              value={adminMetrics.activeUsers}
              color="bg-emerald-50 text-emerald-600"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <MetricCard 
              title="Total Workspaces" 
              value={adminMetrics.totalProjects}
              color="bg-[#E6F5F6] text-[#2AA7B3]"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
            />
          </div>

          {/* Recent Registrations */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added Users</h2>
              <button onClick={() => navigate('/admin/users')} className="text-sm font-semibold text-[#118B95] hover:text-[#0D5A60] dark:text-[#2AA7B3] dark:hover:text-white">View All Users</button>
            </div>
            
            {loading ? (
              <div className="text-sm text-gray-400 py-4">Loading...</div>
            ) : adminMetrics.recentUsers.length === 0 ? (
              <div className="text-sm text-gray-400 py-4">No users found.</div>
            ) : (
              <div className="space-y-4">
                {adminMetrics.recentUsers.map((u, i) => (
                  <div key={u.id || i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#E6F5F6] flex items-center justify-center text-sm font-bold text-[#118B95]">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#118B95] transition-colors">{u.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </DashboardLayout>
    );
  }

  // ─── REGULAR DASHBOARD RENDER ────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeUp">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Here's what's happening in your workspace today.</p>
          </div>
          <div className="flex gap-3">
            {user?.role !== 'COLLABORATOR' && (
              <button 
                onClick={() => navigate('/tasks/create')}
                className="bg-[#118B95] hover:bg-[#0D5A60] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Create Task
              </button>
            )}
          </div>
        </div>

        {/* 1. Top Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Projects" 
            value={metrics.totalProjects}
            color="bg-[#E6F5F6] text-[#118B95]"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
          />
          <MetricCard 
            title="Active Tasks" 
            value={metrics.activeTasks}
            color="bg-[#E6F5F6] text-[#2AA7B3]"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002 2m-6 9l2 2 4-4" /></svg>}
          />
          <MetricCard 
            title="Completed Tasks" 
            value={metrics.completedTasks}
            color="bg-green-50 text-green-600"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard 
            title="Overdue Tasks" 
            value={metrics.overdueTasks}
            color="bg-orange-50 text-orange-600"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* 2. Middle Section: Charts & Productivity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Task Volume */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Task Volume (Last 7 Days)</h2>
            </div>
            
            <div className="h-64 flex items-end gap-2 sm:gap-4 pt-4 border-b border-gray-100 pb-2 relative">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pb-2">
                <span>Total</span><span>Tasks</span>
              </div>
              <div className="ml-12 flex-1 flex items-end justify-between gap-2 h-full">
                {(() => {
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const data = [0, 0, 0, 0, 0, 0, 0];
                  const today = new Date();
                  metrics.allTasks?.forEach(t => {
                    const d = new Date(t.createdAt);
                    const diffTime = Math.abs(today - d);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    if (diffDays <= 7) {
                      data[d.getDay()]++;
                    }
                  });
                  
                  const max = Math.max(...data, 1);
                  const scaled = data.map(v => Math.round((v / max) * 100));
                  
                  return scaled.map((h, i) => (
                    <div key={i} className="w-full flex justify-center group flex-col items-center gap-1">
                      <span className="text-xs text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data[i]}</span>
                      <div 
                        className="w-full max-w-[40px] bg-[#BEE3E6] rounded-t-md relative overflow-hidden transition-all group-hover:bg-[#93CFD4]" 
                        style={{ height: `${Math.max(h, 2)}%` }}
                      >
                        <div className="absolute bottom-0 left-0 right-0 bg-[#118B95]" style={{ height: `100%` }}></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
            <div className="ml-12 mt-4 flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
          </div>

          {/* Task Completion Analytics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col transition-colors duration-200">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Task Completion</h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                {(() => {
                  const completedPct = metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0;
                  const inProgressPct = metrics.totalTasks > 0 ? Math.round((metrics.inProgressTasks / metrics.totalTasks) * 100) : 0;
                  const todoPct = metrics.totalTasks > 0 ? Math.round((metrics.todoTasks / metrics.totalTasks) * 100) : 0;
                  return (
                    <>
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path
                          className="text-gray-100"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="text-[#118B95]"
                          strokeDasharray={`${completedPct}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        <path
                          className="text-[#118B95]"
                          strokeDasharray={`${inProgressPct}, 100`}
                          strokeDashoffset={`-${completedPct}`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tighter">{completedPct}%</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Completed</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="mt-8 w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#118B95]"></div><span className="text-gray-600 dark:text-slate-300 font-medium">Done</span></div>
                  <span className="font-bold text-gray-900 dark:text-white">{metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2AA7B3]"></div><span className="text-gray-600 dark:text-slate-300 font-medium">In Progress</span></div>
                  <span className="font-bold text-gray-900 dark:text-white">{metrics.totalTasks > 0 ? Math.round((metrics.inProgressTasks / metrics.totalTasks) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-slate-700"></div><span className="text-gray-600 dark:text-slate-300 font-medium">Todo</span></div>
                  <span className="font-bold text-gray-900 dark:text-white">{metrics.totalTasks > 0 ? Math.round((metrics.todoTasks / metrics.totalTasks) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Section: Activities & Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activities */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tasks</h2>
              <button onClick={() => navigate('/tasks')} className="text-sm font-semibold text-[#118B95] hover:text-[#0D5A60] dark:text-[#2AA7B3] dark:hover:text-white cursor-pointer">View All</button>
            </div>
            <div className="space-y-6">
              {metrics.recentTasks?.length === 0 ? (
                <div className="text-sm text-gray-400">No recent tasks.</div>
              ) : (
                metrics.recentTasks?.map((task, i) => {
                  const isNew = task.createdAt === task.updatedAt;
                  const action = isNew ? 'created task' : 'updated task';
                  const time = new Date(task.updatedAt).toLocaleDateString();
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-[#E6F5F6] flex items-center justify-center text-xs font-bold text-[#118B95] z-10 relative border-2 border-white dark:border-slate-800">
                          {task.creator?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {i !== metrics.recentTasks.length - 1 && <div className="absolute top-8 bottom-[-24px] left-1/2 w-px bg-gray-100 dark:bg-slate-700 -translate-x-1/2"></div>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-bold">{task.creator?.name || 'Someone'}</span> <span className="text-gray-500 dark:text-slate-400">{action}</span> <span className="font-bold">{task.title}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
              <button onClick={() => navigate('/calendar')} className="text-sm font-semibold text-[#118B95] hover:text-[#0D5A60] dark:text-[#2AA7B3] dark:hover:text-white cursor-pointer">View Calendar</button>
            </div>
            <div className="space-y-4">
              {metrics.upcomingDeadlines?.length === 0 ? (
                <div className="text-sm text-gray-400">No upcoming deadlines.</div>
              ) : (
                metrics.upcomingDeadlines?.map((task, i) => (
                  <div key={i} onClick={() => navigate(`/tasks/${task.id}`)} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#118B95] dark:group-hover:text-[#2AA7B3] transition-colors">{task.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{task.project?.name || 'No Project'}</p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold px-2.5 py-1 bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-slate-300 rounded-lg border border-gray-200 dark:border-slate-700">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
