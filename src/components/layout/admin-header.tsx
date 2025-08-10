import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export function AdminHeader() {
  const { signOut, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  return (
    <header className="bg-white dark:bg-secondary-800 border-b border-secondary-100 dark:border-secondary-700 py-4 px-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="flex items-center">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">GN</span>
            <span className="ml-2 text-xl font-bold text-secondary-900 dark:text-white">Admin</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2"
              onClick={toggleProfile}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <User size={18} />
              </div>
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200 hidden md:block">
                {user?.email}
              </span>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-50 border border-secondary-200 dark:border-secondary-700">
                <div className="py-1">
                  <Link 
                    to="/" 
                    className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    View Site
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                  <button 
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    onClick={signOut}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}