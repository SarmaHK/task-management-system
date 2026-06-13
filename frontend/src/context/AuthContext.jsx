import { createContext, useState, useEffect, useContext, useCallback } from 'react';

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

  // Fetch current user details using access token
  const fetchMe = useCallback(async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          firstLogin: u.firstLogin,
          role: typeof u.role === 'object' ? u.role.name : u.role,
        });
      } else {
        // If profile fetch fails, clear auth states
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  // Silent session refresh
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && data.data?.token) {
        const newToken = data.data.token;
        setAccessToken(newToken);
        persistToken(newToken);
        await fetchMe(newToken);
        return newToken;
      }
    } catch (error) {
      console.warn('Session refresh failed (no active session)');
    } finally {
      setLoading(false);
    }
    return null;
  }, [fetchMe]);

  // Initial session check on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Background token refresh interval (every 14 minutes)
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      refreshSession();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, refreshSession]);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
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
      setLoading(false);
      return resData.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Register action
  const register = async (name, email, password) => {
    setLoading(true);
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

      setLoading(false);
      return resData;
    } catch (error) {
      setLoading(false);
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

      // Update local user state: user is no longer firstLogin
      setUser(prev => prev ? { ...prev, firstLogin: false } : null);
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
