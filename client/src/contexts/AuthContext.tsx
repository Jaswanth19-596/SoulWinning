import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthSession } from '../types';

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  isCaptain: boolean;
  login: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const stored = authService.getSession();
    if (stored) {
      setSession(stored);
    }
    setLoading(false);
  }, []);

  const login = async (code: string) => {
    const newSession = await authService.login(code);
    setSession(newSession);
  };

  const logout = () => {
    authService.logout();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAuthenticated: !!session,
        isCaptain: session?.role === 'captain',
        login,
        logout,
      }}
    >
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