import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ritsino_token');
    if (token) {
      authAPI.me()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('ritsino_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('ritsino_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password, universityId) => {
    const data = await authAPI.register({ username, email, password, universityId });
    localStorage.setItem('ritsino_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ritsino_token');
    setUser(null);
  };

  const updatePoints = (newPoints) => {
    setUser(prev => prev ? { ...prev, points: newPoints } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
