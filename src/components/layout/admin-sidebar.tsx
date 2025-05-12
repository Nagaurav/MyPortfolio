import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Award, 
  FileText, 
  Mail, 
  Lightbulb, 
  Settings, 
  BarChart
} from 'lucide-react';

export function AdminSidebar() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? 'bg-primary-100 text-primary-600' 
        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
    }`;
  
  return (
    <div className="w-64 bg-white border-r border-secondary-200 hidden md:block">
      <div className="h-full flex flex-col">
        <div className="px-4 py-6 border-b border-secondary-200">
          <Link to="/admin" className="flex items-center">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">GN</span>
            <span className="ml-2 text-xl font-bold text-secondary-900">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin" end className={navLinkClasses}>
            <LayoutDashboard size={18} className="mr-3" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/projects" className={navLinkClasses}>
            <FolderKanban size={18} className="mr-3" />
            Projects
          </NavLink>
          <NavLink to="/admin/skills" className={navLinkClasses}>
            <Lightbulb size={18} className="mr-3" />
            Skills
          </NavLink>
          <NavLink to="/admin/certificates" className={navLinkClasses}>
            <Award size={18} className="mr-3" />
            Certificates
          </NavLink>
          <NavLink to="/admin/resume" className={navLinkClasses}>
            <FileText size={18} className="mr-3" />
            Resume
          </NavLink>
          <NavLink to="/admin/contact" className={navLinkClasses}>
            <Mail size={18} className="mr-3" />
            Contact
          </NavLink>
          
          <div className="pt-4 mt-4 border-t border-secondary-200">
            <NavLink to="/admin/settings" className={navLinkClasses}>
              <Settings size={18} className="mr-3" />
              Settings
            </NavLink>
            <NavLink to="/admin/analytics" className={navLinkClasses}>
              <BarChart size={18} className="mr-3" />
              Analytics
            </NavLink>
          </div>
        </nav>
        
        <div className="p-4 border-t border-secondary-200">
          <NavLink 
            to="/" 
            className="flex items-center text-sm font-medium text-secondary-600 hover:text-secondary-900"
          >
            View Site
          </NavLink>
        </div>
      </div>
    </div>
  );
}