import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('quickservice_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('quickservice_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and validate token on application mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          localStorage.setItem('quickservice_user', JSON.stringify(userData));
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('quickservice_token', data.access_token);
    localStorage.setItem('quickservice_user', JSON.stringify(data.user));
    return data.user;
  };

  const registerCustomer = async (formData) => {
    const data = await authService.registerCustomer(formData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('quickservice_token', data.access_token);
    localStorage.setItem('quickservice_user', JSON.stringify(data.user));
    return data.user;
  };

  const registerProvider = async (formData) => {
    const data = await authService.registerProvider(formData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('quickservice_token', data.access_token);
    localStorage.setItem('quickservice_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('quickservice_token');
    localStorage.removeItem('quickservice_user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        localStorage.setItem('quickservice_user', JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        registerCustomer,
        registerProvider,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
