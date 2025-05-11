import { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, TrendingUp, Users, Eye, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../../components/ui/section-header';

interface AnalyticsSummary {
  totalProjects: number;
  totalSkills: number;
  totalCertificates: number;
  totalContacts: number;
  recentProjects: {
    title: string;
    views: number;
    type: string;
  }[];
  recentActivity: {
    action: string;
    description: string;
    timestamp: string;
  }[];
}

export function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalProjects: 0,
    totalSkills: 0,
    totalCertificates: 0,
    totalContacts: 0,
    recentProjects: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch counts
        const [
          { count: projectsCount },
          { count: skillsCount },
          { count: certificatesCount },
          { count: contactsCount },
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('skills').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
        ]);

        // Fetch recent projects
        const { data: recentProjectsData } = await supabase
          .from('projects')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent contacts
        const { data: recentContactsData } = await supabase
          .from('contacts')
          .select('name, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent certificates
        const { data: recentCertificatesData } = await supabase
          .from('certificates')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Combine recent activity
        const recentActivity = [
          ...(recentProjectsData?.map(p => ({
            action: 'Project Added',
            description: p.title,
            timestamp: p.created_at,
          })) || []),
          ...(recentContactsData?.map(c => ({
            action: 'New Contact',
            description: `From: ${c.name} - ${c.subject}`,
            timestamp: c.created_at,
          })) || []),
          ...(recentCertificatesData?.map(c => ({
            action: 'Certificate Added',
            description: c.title,
            timestamp: c.created_at,
          })) || []),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
         .slice(0, 5);

        setSummary({
          totalProjects: projectsCount || 0,
          totalSkills: skillsCount || 0,
          totalCertificates: certificatesCount || 0,
          totalContacts: contactsCount || 0,
          recentProjects: recentProjectsData?.map(p => ({
            title: p.title,
            views: 0, // Views would need a separate tracking system
            type: 'Project',
          })) || [],
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const stats = [
    {
      name: 'Total Projects',
      value: summary.totalProjects,
      icon: BarChartIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Skills',
      value: summary.totalSkills,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Certificates',
      value: summary.totalCertificates,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Contacts',
      value: summary.totalContacts,
      icon: Eye,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Analytics Dashboard"
        subtitle="Track and analyze your portfolio statistics"
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-secondary-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-secondary-500">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {summary.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex items-center h-6">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  {index !== summary.recentActivity.length - 1 && (
                    <div className="flex-1 w-px h-full bg-secondary-200 mx-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-secondary-500">{activity.description}</p>
                  <p className="text-xs text-secondary-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Recent Projects</h3>
          <div className="space-y-4">
            {summary.recentProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{project.title}</p>
                  <p className="text-xs text-secondary-500">{project.type}</p>
                </div>
                <div className="flex items-center text-secondary-500">
                  <Eye size={16} className="mr-1" />
                  <span className="text-sm">{project.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future Analytics Features Notice */}
      <div className="mt-8 bg-secondary-50 rounded-lg p-6 text-center">
        <Clock className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          More Analytics Coming Soon
        </h3>
        <p className="text-secondary-600 max-w-md mx-auto">
          We're working on adding more detailed analytics features, including visitor tracking,
          engagement metrics, and custom reports.
        </p>
      </div>
    </div>
  );
}