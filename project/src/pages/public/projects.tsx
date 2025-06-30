import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List, Github, ExternalLink, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'featured' | 'title';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [sortBy]);

  async function fetchProjects() {
    try {
      let query = supabase.from('projects').select('*');

      switch (sortBy) {
        case 'featured':
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setProjects(data || []);
      
      const tags = data?.reduce((acc: string[], project) => {
        project.tags?.forEach(tag => {
          if (!acc.includes(tag)) {
            acc.push(tag);
          }
        });
        return acc.sort();
      }, []) || [];
      
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesTags = selectedTags.length === 0 || 
      project.tags?.some(tag => selectedTags.includes(tag));
    
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTags && matchesSearch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-64' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-300"></div>
        <img
          src={project.image_url || "https://images.pexels.com/photos/5483071/pexels-photo-5483071.jpeg"}
          alt={project.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {project.featured && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-medium rounded-full shadow-lg">
            Featured
          </div>
        )}
      </div>
      <div className="p-6 flex-1">
        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-accent-600 transition-all">
          {project.title}
        </h3>
        <p className="text-secondary-600 mb-4 line-clamp-2">
          {project.short_description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags?.map(tag => (
            <button
              key={tag}
              onClick={(e) => {
                e.preventDefault();
                toggleTag(tag);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                selectedTags.includes(tag)
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group/link"
          >
            View Details
            <ArrowRight size={16} className="ml-1 transform transition-transform group-hover/link:translate-x-1" />
          </Link>
          <div className="flex space-x-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-900 transition-colors"
                aria-label="View on GitHub"
              >
                <Github size={20} />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-900 transition-colors"
                aria-label="View live site"
              >
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-[0.2]"></div>
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-secondary-900">Explore My </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]">
                Projects
              </span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              Discover a collection of my work that showcases innovation, creativity, and technical expertise
            </p>

            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <motion.button
                key={tag}
                onClick={() => toggleTag(tag)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md'
                    : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200'
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-secondary-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            >
              <option value="date">Most Recent</option>
              <option value="featured">Featured First</option>
              <option value="title">Alphabetical</option>
            </select>

            <div className="flex bg-white border border-secondary-200 rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-primary-600' : 'text-secondary-400 hover:text-secondary-600'}`}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'text-primary-600' : 'text-secondary-400 hover:text-secondary-600'}`}
                aria-label="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-secondary-200 rounded-t-xl" />
                <div className="p-6 bg-white rounded-b-xl space-y-4">
                  <div className="h-6 bg-secondary-200 rounded w-3/4" />
                  <div className="h-4 bg-secondary-200 rounded w-full" />
                  <div className="h-4 bg-secondary-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              <motion.div
                layout
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p className="text-secondary-600 text-lg mb-4">
                  No projects found matching your criteria.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}