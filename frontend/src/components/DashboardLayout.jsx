import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import api from '../services/api';
import { subscribeToNotifications } from '../services/socket';


const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'Tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/tasks/kanban',
    label: 'Kanban Board',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'User Management',
    adminOnly: true, // Only Admins can see this link
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

  // Intercept notifications=open query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('notifications') === 'open') {
      setIsNotificationOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  // Fetch notifications and subscribe to Socket events
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

    return () => unsubscribe();
  }, [user]);

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

  const getRoleBadge = () => {
    const role = (user?.role || '').toUpperCase();
    if (role === 'ADMIN') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (role === 'PROJECT_MANAGER') return 'bg-violet-100 text-violet-700 border-violet-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const NavLink = ({ item }) => {
    const userRole = user?.role;

    // Filter sidebar navigation items by role
    if (userRole === 'ADMIN') {
      // Admin has access to Dashboard (with logs), User Management, Projects (read-only)
      if (item.to === '/tasks' || item.to === '/tasks/kanban' || item.to === '/tasks/create') return null;
    } else if (userRole === 'PROJECT_MANAGER') {
      // PM has access to everything except User Management
      if (item.to === '/admin/users') return null;
    } else if (userRole === 'COLLABORATOR') {
      // Collaborator has access to tasks/projects, but not task creation or User Management
      if (item.to === '/tasks/create' || item.to === '/admin/users') return null;
    }

    let active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
    if (item.to === '/tasks' && (location.pathname.startsWith('/tasks/kanban') || location.pathname.startsWith('/tasks/create'))) {
      active = false;
    }
    return (
      <button
        onClick={() => { navigate(item.to); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150 cursor-pointer text-left ${
          active
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-400/20'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        <span className={active ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
        {item.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex relative">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-[3px] w-[22px] h-[22px]">
            <span className="rounded-[3px] bg-indigo-600 block" />
            <span className="rounded-[3px] bg-indigo-400 block" />
            <span className="rounded-[3px] bg-indigo-300 block" />
            <span className="rounded-[3px] bg-indigo-500 block" />
          </div>
          <span className="text-[17px] font-extrabold text-indigo-950 tracking-tight">TaskFlow</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>

        {/* User card + Notifications + Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          
          {/* Notification Bell Button (Desktop) */}
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-[14px] font-semibold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer text-left"
          >
            <span className="relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Red dot indicating unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </span>
            Notifications
          </button>

          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-900 truncate">{user?.name}</p>
              <span className={`text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-full ${getRoleBadge()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-800 cursor-pointer">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-extrabold text-indigo-950">TaskFlow</span>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Notification Bell Button (Mobile) */}
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="relative text-gray-500 hover:text-indigo-600 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-[13px]">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* 4. Render the Notification Panel */}
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