import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  clearAuthSession,
  createAuthSession,
  loadAuthSession,
  saveAuthSession,
  type StoredAuthSession,
} from '../services/sessionService';

export type UserRole = 'CLIENTE' | 'MOTOBOY' | 'ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, email: string) => void;
  logout: () => void;
  updateProfile: (updates: { name?: string; phone?: string }) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function sessionToUser(session: StoredAuthSession): User {
  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
    phone: session.phone,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = loadAuthSession();
    if (session) {
      setUser(sessionToUser(session));
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole, email: string) => {
    const session = createAuthSession(role, email);
    saveAuthSession(session);
    setUser(sessionToUser(session));
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const updateProfile = (updates: { name?: string; phone?: string }) => {
    setUser((prev) => {
      if (!prev) return prev;
      const session = loadAuthSession();
      if (!session) return prev;

      const updatedSession: StoredAuthSession = {
        ...session,
        name: updates.name ?? session.name,
        phone: updates.phone ?? session.phone,
      };
      saveAuthSession(updatedSession);
      return sessionToUser(updatedSession);
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateProfile, isAuthenticated: !!user, isLoading }}
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
