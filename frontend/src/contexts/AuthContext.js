import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a stored user
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        // Verify with server
        const response = await authAPI.me();
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Clear invalid auth
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token } = response.data;
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user: userData, token } = response.data;
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    return userData;
  };

  const googleLogin = async (sessionId) => {
    const response = await authAPI.googleAuth(sessionId);
    const { user: userData, token } = response.data;
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    return userData;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors during logout
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
