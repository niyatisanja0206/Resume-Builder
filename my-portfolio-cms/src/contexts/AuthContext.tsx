import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  email: string;
  // Add other user properties as needed, for example:
  // name?: string;
  // id?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  currentUserEmail: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  // Removed unused loading state

  useEffect(() => {
    const cookieUser = Cookies.get('user') ? JSON.parse(Cookies.get('user')!) : null;
    if (cookieUser) {
      setUser(cookieUser);
      setCurrentUserEmail(cookieUser.email || null);
    }
    const cookieToken = Cookies.get('token') || null;
    setToken(cookieToken);
  }, []);

  const setAuth = (token: string, user: User) => {
    Cookies.set('token', token || '', { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    Cookies.set('currentUserEmail', user?.email || '', { expires: 7 });
    setToken(token);
    setUser(user);
    setCurrentUserEmail(user?.email || null);
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    Cookies.remove('currentUserEmail');
    setToken(null);
    setUser(null);
    setCurrentUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, currentUserEmail, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuthContext has been moved to a separate file for Fast Refresh compatibility.
