import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForceResetPassword from './pages/ForceResetPassword';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect base URL to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Auth Routes */}
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/setup-password" element={<ForceResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Project Manager', 'Collaborator']} />}>
            <Route path="/dashboard"  element={<Dashboard />} />
          </Route>

          {/* Catch-all — redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;