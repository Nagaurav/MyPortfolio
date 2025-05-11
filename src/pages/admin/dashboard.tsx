import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Lightbulb, Award, FileText, Mail, BarChart } from 'lucide-react';
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
  
  useEffect(() => {
    async function fetchCounts() {
      try {
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
    },
    {
      title: 'Skills',
      count: counts.skills,
      icon: <Lightbulb size={24} className="text-yellow-500" />,
      link: '/admin/skills',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Certificates',
      count: counts.certificates,
      icon: <Award size={24} className="text-green-500" />,
      link: '/admin/certificates',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Resumes',
      count: counts.resumes,
      icon: <FileText size={24} className="text-blue-500" />,
      link: '/admin/resume',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Unread Messages',
      count: counts.unreadMessages,
      icon: <Mail size={24} className="text-purple-500" />,
      link: '/admin/contact',
      bgColor: 'bg-purple-50',
    },
  ];
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome to Your Portfolio Dashboard</h1>
        <p className="mt-2 text-secondary-600">
          Manage your portfolio content and keep track of important statistics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(5).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow animate-pulse h-32"
            ></div>
          ))
        ) : (
          statCards.map((card) => (
            <Link 
              key={card.title} 
              to={card.link}
              className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-md"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  {card.icon}
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-secondary-500">
                    {card.title}
                  </p>
                  <p className="text-3xl font-semibold">{card.count}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              as={Link} 
              to="/admin/projects/new"
              leftIcon={<FolderKanban size={16} />}
            >
              Add New Project
            </Button>
            <Button 
              as={Link} 
              to="/admin/skills/new"
              leftIcon={<Lightbulb size={16} />}
            >
              Add New Skill
            </Button>
            <Button 
              as={Link} 
              to="/admin/certificates/new"
              leftIcon={<Award size={16} />}
            >
              Add New Certificate
            </Button>
            <Button 
              as={Link} 
              to="/admin/resume/new"
              leftIcon={<FileText size={16} />}
            >
              Upload New Resume
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Analytics Overview</h2>
            <Button 
              variant="ghost" 
              size="sm"
              as={Link}
              to="/admin/analytics"
              rightIcon={<BarChart size={16} />}
            >
              View Details
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-secondary-500">Analytics functionality will be added soon.</p>
            <p className="text-sm text-secondary-400 mt-2">Track portfolio views and engagement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}