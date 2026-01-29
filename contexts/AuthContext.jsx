import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getToken();
      if (token) {
        const userData = await authService.getUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          const result = await authService.getCurrentUser();
          if (result.success) {
            setUser(result.data);
            setIsAuthenticated(true);
          } else {
            await authService.logout();
            setIsAuthenticated(false);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Check auth status error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (name, email, password) => {
    const result = await authService.register(name, email, password);
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
