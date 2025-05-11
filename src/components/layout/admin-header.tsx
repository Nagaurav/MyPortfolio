import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export function AdminHeader() {
  const { signOut, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  return (
    <header className="bg-white border-b border-secondary-100 py-4 px-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="flex items-center">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">GN</span>
            <span className="ml-2 text-xl font-bold text-secondary-900">Admin</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-secondary-500 hover:text-secondary-700 transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2"
              onClick={toggleProfile}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <User size={18} />
              </div>
              <span className="text-sm font-medium text-secondary-700 hidden md:block">
                {user?.email}
              </span>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Link 
                    to="/" 
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    View Site
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                  <button 
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
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