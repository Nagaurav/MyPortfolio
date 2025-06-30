import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  email: string;
};

type Session = {
  user: User;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('auth-session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (error) {
        console.error('Error parsing saved session:', error);
        localStorage.removeItem('auth-session');
      }
    }
    setIsInitialized(true);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Simple mock authentication - accept any email/password for development
      // In production, this would validate against Supabase
      const mockUser: User = {
        id: 'dev-user-1',
        email: email,
      };
      
      const mockSession: Session = {
        user: mockUser,
      };

      // Save to localStorage
      localStorage.setItem('auth-session', JSON.stringify(mockSession));
      
      setSession(mockSession);
      setUser(mockUser);
      
      navigate('/admin');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Simple mock registration - create user for development
      const mockUser: User = {
        id: 'dev-user-' + Date.now(),
        email: email,
      };
      
      const mockSession: Session = {
        user: mockUser,
      };

      // Save to localStorage
      localStorage.setItem('auth-session', JSON.stringify(mockSession));
      
      setSession(mockSession);
      setUser(mockUser);
      
      navigate('/admin');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth-session');
    setSession(null);
    setUser(null);
    navigate('/admin/login');
  };

  const value = {
    session,
    user,
    isInitialized,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};