import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, User, Session } from '@supabase/supabase-js';

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
  const location = useLocation();

  // The auth subscription below must be set up exactly once. Reading navigate and
  // the current pathname through refs keeps them out of the effect's deps —
  // otherwise every route change tore down the subscription and re-ran getSession().
  const navigateRef = useRef(navigate);
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    navigateRef.current = navigate;
    pathnameRef.current = location.pathname;
  });

  useEffect(() => {

    // Get initial session from Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only redirect if we're on admin pages and not authenticated
        if (event === 'SIGNED_OUT' && pathnameRef.current.startsWith('/admin')) {
          navigateRef.current('/admin/login');
        }
        // Don't automatically redirect on sign in - let the login page handle it
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Signed in successfully:', data.user?.id);
      // Only redirect to admin dashboard if we're on the login page
      if (location.pathname === '/admin/login') {
        navigate('/admin/dashboard');
      }
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Signed up successfully:', data.user?.id);
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      // Redirect to home page after sign out
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
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