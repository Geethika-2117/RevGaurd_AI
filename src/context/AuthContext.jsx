import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('revguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('revguard_token'));
  const [loading, setLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const profile = await api.get('/api/auth/me');
          setUser(profile);
          localStorage.setItem('revguard_user', JSON.stringify(profile));
        } catch (err) {
          console.warn("Session check failed, clearing credentials:", err);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    setToken(data.access_token);
    const userInfo = {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
      organization_id: data.organization_id,
      organization_name: data.organization_name,
      merchant_id: data.merchant_id,
      org_code: data.org_code
    };
    setUser(userInfo);
    localStorage.setItem('revguard_token', data.access_token);
    localStorage.setItem('revguard_user', JSON.stringify(userInfo));
    return userInfo;
  };

  const register = async (formData) => {
    const data = await api.post('/api/auth/register', formData);
    setToken(data.access_token);
    const userInfo = {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
      organization_id: data.organization_id,
      organization_name: data.organization_name,
      merchant_id: data.merchant_id,
      org_code: data.org_code
    };
    setUser(userInfo);
    localStorage.setItem('revguard_token', data.access_token);
    localStorage.setItem('revguard_user', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/api/auth/logout', {});
      }
    } catch (err) {
      console.warn("Logout backend notification failed (ignoring):", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('revguard_token');
      localStorage.removeItem('revguard_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
