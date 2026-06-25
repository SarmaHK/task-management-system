/**
 * AppRoutes.jsx — Centralised routing with protected route guards
 */

import AdminUsers from '../pages/AdminUsers';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


// Auth pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForceResetPassword from '../pages/ForceResetPassword';

// Protected pages
import Dashboard from '../pages/Dashboard';
import TaskList from '../pages/tasks/TaskList';
import CreateTask from '../pages/tasks/CreateTask';
import EditTask from '../pages/tasks/EditTask';
import KanbanBoard from '../pages/tasks/KanbanBoard';
import TaskDetails from '../pages/tasks/TaskDetails';
import Projects from '../pages/projects/Projects';
import ProjectDetails from '../pages/projects/ProjectDetails';
import Messages from '../pages/Messages';
import Calendar from '../pages/Calendar';
import Settings from '../pages/Settings';

// ── Auth guard wrapper ────────────────────────────────────────────────────
function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-[14px] text-indigo-800 font-semibold tracking-wide">Verifying session…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/setup-password" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toUpperCase();
    const hasRole = allowedRoles.some((r) => r.toUpperCase() === userRole);
    if (!hasRole) {
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin/users" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ── Redirect if already logged in ─────────────────────────────────────────
function PublicOnly({ children }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const forceLogin = new URLSearchParams(location.search).get('forceLogin');

  useEffect(() => {
    if (forceLogin && user) {
      logout();
    }
  }, [forceLogin, user, logout]);

  if (loading) return null;
  
  if (user && !user.firstLogin && !forceLogin) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/users" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

const ALL_ROLES = ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'];
const NON_ADMIN_ROLES = ['PROJECT_MANAGER', 'COLLABORATOR'];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Base redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public auth routes */}
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/setup-password" element={<ForceResetPassword />} />

      {/* ── Protected routes ── */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth allowedRoles={ALL_ROLES}>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Task routes */}
      <Route
        path="/tasks"
        element={
          <RequireAuth allowedRoles={ALL_ROLES}>
            <TaskList />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/create"
        element={
          <RequireAuth allowedRoles={['PROJECT_MANAGER']}>
            <CreateTask />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/kanban"
        element={
          <RequireAuth allowedRoles={NON_ADMIN_ROLES}>
            <KanbanBoard />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/edit/:id"
        element={
          <RequireAuth allowedRoles={['PROJECT_MANAGER']}>
            <EditTask />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <RequireAuth allowedRoles={ALL_ROLES}>
            <TaskDetails />
          </RequireAuth>
        }
      />

      {/* 🟢 Admin Management Route (Locked to Admins ONLY) */}
      <Route 
        path="/admin/users" 
        element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AdminUsers />
          </RequireAuth>
        } 
      />

      {/* Project routes */}
      <Route
        path="/projects"
        element={
          <RequireAuth allowedRoles={ALL_ROLES}>
            <Projects />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <RequireAuth allowedRoles={ALL_ROLES}>
            <ProjectDetails />
          </RequireAuth>
        }
      />

      {/* Messages */}
      <Route
        path="/messages"
        element={
          <RequireAuth allowedRoles={NON_ADMIN_ROLES}>
            <Messages />
          </RequireAuth>
        }
      />

      {/* Calendar */}
      <Route
        path="/calendar"
        element={
          <RequireAuth allowedRoles={NON_ADMIN_ROLES}>
            <Calendar />
          </RequireAuth>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <RequireAuth allowedRoles={ALL_ROLES}>
            <Settings />
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
