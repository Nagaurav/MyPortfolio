import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary-100 hover:bg-secondary-200 dark:bg-dark-800 dark:hover:bg-dark-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-secondary-200 dark:border-dark-700"
      style={{ '--tw-ring-offset-color': theme === 'dark' ? '#041421' : undefined } as React.CSSProperties}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <Moon size={20} className="text-secondary-600 dark:text-secondary-300" />
        ) : (
          <Sun size={20} className="text-primary-400" />
        )}
      </motion.div>
    </motion.button>
  );
} 