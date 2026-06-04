import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForceResetPassword from './pages/ForceResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect base URL to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Phase 1 — Auth UI Routes */}
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/setup-password" element={<ForceResetPassword />} />

        {/*
         * ─── PHASE 2 ROUTES (uncomment when backend is ready) ───────────
         *
         * import ProtectedRoute from './components/ProtectedRoute';
         * import Dashboard      from './pages/Dashboard';
         * import TaskList       from './pages/tasks/TaskList';
         * import KanbanBoard    from './pages/tasks/KanbanBoard';
         * import AdminUsers     from './pages/admin/AdminUsers';
         *
         * <Route element={<ProtectedRoute allowedRoles={['admin','project_manager','collaborator']} />}>
         *   <Route path="/dashboard"  element={<Dashboard />} />
         *   <Route path="/tasks"      element={<TaskList />} />
         *   <Route path="/kanban"     element={<KanbanBoard />} />
         * </Route>
         *
         * <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
         *   <Route path="/admin/users" element={<AdminUsers />} />
         * </Route>
         * ────────────────────────────────────────────────────────────────
        */}

        {/* Catch-all — redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;