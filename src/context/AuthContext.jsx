import React, { useState, useEffect } from 'react';
import { executeAction } from '../services/apiClient';
import { AuthContext } from './AuthContextCore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('erp_admin_user');
    const savedToken = localStorage.getItem('erp_admin_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await executeAction('AUTH.LOGIN', {
        username,
        password
      });

      console.log('Login Response:', response);

      if (response && response.success) {
        const userData = response.data?.user;
        const sessionToken = response.data?.token;

        if (!userData || !sessionToken) {
          console.error('Login Data Error: Missing user or token in successful response', response);
          return { success: false, message: 'Invalid session data received from server.' };
        }

        setUser(userData);
        setToken(sessionToken);

        localStorage.setItem('erp_admin_user', JSON.stringify(userData));
        localStorage.setItem('erp_admin_token', sessionToken);

        return { success: true };
      } else {
        // Standardized error handling from auth.md
        const errorMessage = response?.error?.message || response?.message || 'Invalid credentials.';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login Context Error:', error);
      return { success: false, message: error.message || 'Server error. Please try again later.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Send logout action to server as per auth.md
        await executeAction('AUTH.LOGOUT', {}, token);
      }
    } catch (error) {
      console.error('Logout API Error:', error);
    } finally {
      // Immediate cleanup regardless of API success
      setUser(null);
      setToken(null);
      localStorage.removeItem('erp_admin_user');
      localStorage.removeItem('erp_admin_token');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      logout, 
      isAuthenticated: !!user && !!token, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
