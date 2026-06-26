import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import api from '../services/api';

const AuthContext = createContext(null);

/** Persist token to sessionStorage so Axios interceptor can read it */
const persistToken = (token) => {
  if (token) sessionStorage.setItem('accessToken', token);
  else sessionStorage.removeItem('accessToken');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Helper to get authorization headers
  const getAuthHeaders = useCallback((customToken) => {
    const activeToken = customToken || accessToken;
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {}),
    };
  }, [accessToken]);

  // Fetch current user details
  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      if (data.success && data.data?.user) {
        const u = data.data.user;
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          mustChangePassword: u.mustChangePassword,
          role: typeof u.role === 'object' ? u.role.name : u.role,
        });
      } else {
        setUser(null);
        setAccessToken(null);
        persistToken(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      setAccessToken(null);
      persistToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial session check on mount
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Manage WebSocket connection lifecycle
  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken]);

  // Login action
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Login failed');
      }

      const { token, user: loggedUser } = resData.data;
      setAccessToken(token);
      persistToken(token);
      setUser(loggedUser);
      return resData.data;
    } catch (error) {
      throw error;
    }
  };

  // Register action
  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Registration failed');
      }

      return resData;
    } catch (error) {
      throw error;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      setAccessToken(null);
      persistToken(null);
      setUser(null);
    }
  };

  // First login password setup
  const firstLoginReset = async (temporaryPassword, newPassword) => {
    if (!accessToken) throw new Error('Unauthenticated');
    try {
      const response = await fetch('/api/auth/first-login-reset', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ temporaryPassword, newPassword }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Password update failed');
      }

      // Update local user state: user is no longer required to change password
      setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
      return resData;
    } catch (error) {
      throw error;
    }
  };

  // Update user profile name
  const updateProfile = async (name) => {
    if (!accessToken) throw new Error('Unauthenticated');
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Profile update failed');
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, name: resData.data.user.name } : null);
      return resData;
    } catch (error) {
      throw error;
    }
  };

  // Change user password
  const changePassword = async (currentPassword, newPassword) => {
    if (!accessToken) throw new Error('Unauthenticated');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Password update failed');
      }
      return resData;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    firstLoginReset,
    updateProfile,
    changePassword,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
