import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Lightbulb, Award, FileText, Mail, BarChart, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

interface DashboardCounts {
  projects: number;
  skills: number;
  certificates: number;
  resumes: number;
  unreadMessages: number;
}

export function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    projects: 0,
    skills: 0,
    certificates: 0,
    resumes: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCounts() {
      try {
        setError(null);
        
        // Check if Supabase is properly configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          // Show sample data for development
          setCounts({
            projects: 5,
            skills: 12,
            certificates: 8,
            resumes: 3,
            unreadMessages: 2,
          });
          setLoading(false);
          return;
        }

        const [
          { count: projectsCount },
          { count: skillsCount },
          { count: certificatesCount },
          { count: resumesCount },
          { count: unreadMessagesCount },
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('skills').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
          supabase.from('resumes').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('read', false),
        ]);
  
        setCounts({
          projects: projectsCount || 0,
          skills: skillsCount || 0,
          certificates: certificatesCount || 0,
          resumes: resumesCount || 0,
          unreadMessages: unreadMessagesCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data. Using sample data instead.');
        // Fallback to sample data
        setCounts({
          projects: 5,
          skills: 12,
          certificates: 8,
          resumes: 3,
          unreadMessages: 2,
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchCounts();
  }, []);
  
  const statCards = [
    {
      title: 'Projects',
      count: counts.projects,
      icon: <FolderKanban size={24} className="text-indigo-500" />,
      link: '/admin/projects',
      bgColor: 'bg-indigo-50',
      description: 'Manage your portfolio projects'
    },
    {
      title: 'Skills',
      count: counts.skills,
      icon: <Lightbulb size={24} className="text-yellow-500" />,
      link: '/admin/skills',
      bgColor: 'bg-yellow-50',
      description: 'Update your technical skills'
    },
    {
      title: 'Certificates',
      count: counts.certificates,
      icon: <Award size={24} className="text-green-500" />,
      link: '/admin/certificates',
      bgColor: 'bg-green-50',
      description: 'Manage your certifications'
    },
    {
      title: 'Resumes',
      count: counts.resumes,
      icon: <FileText size={24} className="text-blue-500" />,
      link: '/admin/resume',
      bgColor: 'bg-blue-50',
      description: 'Upload and manage resumes'
    },
    {
      title: 'Unread Messages',
      count: counts.unreadMessages,
      icon: <Mail size={24} className="text-purple-500" />,
      link: '/admin/contact',
      bgColor: 'bg-purple-50',
      description: 'View contact form submissions'
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6 border border-secondary-200 dark:border-secondary-700">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Welcome to Your Portfolio Dashboard</h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-300">
          Manage your portfolio content and keep track of important statistics.
        </p>
        
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
              To connect to your database, create a .env file with your Supabase credentials.
            </p>
          </div>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(5).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 animate-pulse h-32"
            >
              <div className="h-6 bg-secondary-200 dark:bg-secondary-600 rounded mb-4"></div>
              <div className="h-8 bg-secondary-200 dark:bg-secondary-600 rounded"></div>
            </div>
          ))
        ) : (
          statCards.map((card) => (
            <Link 
              key={card.title} 
              to={card.link}
              className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 transition-all hover:shadow-md hover:border-secondary-300 dark:hover:border-secondary-600 group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-full ${card.bgColor} group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-secondary-900 dark:text-white">{card.count}</p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">{card.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-300">{card.description}</p>
            </Link>
          ))
        )}
      </div>
      
      {/* Quick Actions and Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Quick Actions</h2>
            <Plus size={20} className="text-secondary-400 dark:text-secondary-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              as={Link} 
              to="/admin/projects"
              variant="outline"
              className="h-12 justify-start"
            >
              <FolderKanban size={16} className="mr-2" />
              Manage Projects
            </Button>
            <Button 
              as={Link} 
              to="/admin/skills"
              variant="outline"
              className="h-12 justify-start"
            >
              <Lightbulb size={16} className="mr-2" />
              Manage Skills
            </Button>
            <Button 
              as={Link} 
              to="/admin/certificates"
              variant="outline"
              className="h-12 justify-start"
            >
              <Award size={16} className="mr-2" />
              Manage Certificates
            </Button>
            <Button 
              as={Link} 
              to="/admin/resume"
              variant="outline"
              className="h-12 justify-start"
            >
              <FileText size={16} className="mr-2" />
              Manage Resumes
            </Button>
          </div>
        </div>
        
        {/* Analytics Overview */}
        <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Analytics Overview</h2>
            <Button 
              variant="ghost" 
              size="sm"
              as={Link}
              to="/admin/analytics"
              className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white"
            >
              <BarChart size={16} className="mr-2" />
              View Details
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">Portfolio Views</span>
              <span className="text-lg font-semibold text-secondary-900 dark:text-white">1,234</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">Contact Submissions</span>
              <span className="text-lg font-semibold text-secondary-900 dark:text-white">56</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">Download Rate</span>
              <span className="text-lg font-semibold text-secondary-900 dark:text-white">23%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}