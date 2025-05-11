import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', theme);

    // Update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // If user is authenticated, save preference to Supabase
    const saveThemePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({ 
            user_id: user.id,
            theme: theme
          }, { 
            onConflict: 'user_id' 
          });
      }
    };

    saveThemePreference();
  }, [theme]);

  // Load theme preference from Supabase when user logs in
  useEffect(() => {
    const loadThemePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', user.id)
          .single();

        if (data?.theme) {
          setTheme(data.theme as Theme);
        }
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};