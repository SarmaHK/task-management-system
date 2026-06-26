import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import api from '../services/api';
import { subscribeToNotifications, getSocket } from '../services/socket';
import projectService from '../services/projectService';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'Tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/tasks/kanban',
    label: 'Kanban Board',
    excludeRoles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    to: '/admin/users', // Reusing User Management page for Team Members
    label: 'Team Members',
    adminOnly: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    excludeRoles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/messages',
    label: 'Messages',
    excludeRoles: ['ADMIN'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },

  {
<<<<<<< HEAD
    to: '#reports',
    label: 'Reports',
    excludeRoles: ['COLLABORATOR', 'PROJECT_MANAGER'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '#settings', // Placeholder
=======
    to: '/settings',
>>>>>>> f9b1ce8e8fd2292944cfe997d2abd7af02f93996
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (location.pathname === '/messages') {
      setHasNewMessage(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const unsubscribe = subscribeToNotifications((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    const socket = getSocket();
    if (socket) {
      const setupGlobalMessaging = async () => {
        try {
          const res = await projectService.getAllProjects();
          if (res.success) {
            res.data.forEach(p => socket.emit('joinProject', p.id));
          }
        } catch (err) {
          console.error('Failed to setup global messaging:', err);
        }
      };
      setupGlobalMessaging();

      const handleGlobalMessage = (msg) => {
        // If the message is from the current user, don't show the dot
        if (msg.sender?.id === user.id) return;
        if (location.pathname !== '/messages') {
          setHasNewMessage(true);
        }
      };
      socket.on('receiveMessage', handleGlobalMessage);

      return () => {
        unsubscribe();
        socket.off('receiveMessage', handleGlobalMessage);
      };
    }

    return () => unsubscribe();
  }, [user, location.pathname]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const NavLink = ({ item }) => {
    const userRole = user?.role;

    if (item.adminOnly && userRole !== 'ADMIN') {
      return null;
    }
    
    if (item.excludeRoles && item.excludeRoles.includes(userRole)) {
      return null;
    }

    let active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
    if (item.to === '/tasks' && (location.pathname.startsWith('/tasks/kanban') || location.pathname.startsWith('/tasks/create'))) {
      active = false;
    }
    
    // Default active for exact matches
    if (location.pathname === item.to) active = true;

    return (
      <button
        onClick={() => { if(!item.to.startsWith('#')) navigate(item.to); setSidebarOpen(false); }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
          active
            ? 'bg-blue-600/10 text-blue-500'
            : 'text-gray-400 hover:bg-slate-800 hover:text-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={active ? 'text-blue-500' : 'text-gray-400'}>{item.icon}</span>
          {item.label}
        </div>
        {item.label === 'Messages' && hasNewMessage && (
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative font-sans">
      
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] fixed top-0 left-0 h-full z-30 border-r border-slate-800">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <img src="/favicon.png" alt="TaskFlow Logo" className="w-9 h-9 shadow-lg shadow-blue-500/20 rounded-xl" />
          <span className="text-xl font-bold text-white tracking-tight">TaskFlow</span>
        </div>

        {/* User Workspace Info */}
        <div className="px-4 mb-4">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role === 'ADMIN' ? 'Administrator' : 'Workspace Member'}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          <div className="text-xs font-semibold text-slate-500 mb-2 mt-2 px-2 uppercase tracking-wider">Main</div>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 py-4 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between">
          
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-800 cursor-pointer">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Global Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search tasks, projects, or people..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-1 justify-end items-center gap-4">
            
            {/* Quick Create Task (Desktop) */}
            {(user?.role !== 'COLLABORATOR' && user?.role !== 'ADMIN') && (
              <button 
                onClick={() => navigate('/tasks/create')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create
              </button>
            )}

            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>

            {/* Notification Bell Button */}
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="relative text-gray-500 hover:text-gray-800 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Topbar Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer border border-blue-600/20">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}