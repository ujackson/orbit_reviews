import { createContext, useContext, ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import type { User } from '@/types';

interface AuthRoutes {
  login: string;
  logout: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  routes: AuthRoutes;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const page = usePage<{ currentUser?: User; authRoutes?: AuthRoutes }>();
  const user = page.props.currentUser ?? null;
  const routes = page.props.authRoutes ?? { login: '/login', logout: '/logout' };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    routes,
    login: () => router.visit(routes.login),
    logout: () => router.visit(routes.logout),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
