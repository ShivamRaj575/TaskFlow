import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('token', res.data.access_token);
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
  };

  const signup = async (data) => {
    await authAPI.signup(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
