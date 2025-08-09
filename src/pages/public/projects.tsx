import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List, Github, ExternalLink, Search, ArrowRight, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { Card3D, TechCard, GlassCard } from '../../components/ui/3d-card';
import { TiltCard } from '../../components/ui/3d-tilt-card';
import { 
  staggerContainerVariants, 
  fadeInUpVariants, 
  scaleInVariants,
  projectCardVariants 
} from '../../lib/utils';
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

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
    <motion.div
      layout
      variants={projectCardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <TiltCard
        maxTilt={12}
        scale={1.02}
        speed={400}
        glare={true}
        glareColor="rgba(255, 255, 255, 0.3)"
        glarePosition="top"
        className="h-full"
      >
        <Card3D 
          variant="tech" 
          className={`group overflow-hidden h-full ${
            viewMode === 'list' ? 'flex' : ''
          }`}
        >
          {/* Project Image */}
          <div className={`relative overflow-hidden ${
            viewMode === 'list' ? 'w-1/3' : 'w-full'
          }`}>
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-cyan-500" />
              </div>
            )}
            
            {/* Featured Badge */}
            {project.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </div>
            )}
            
            {/* Project Links */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Project Content */}
          <div className={`p-6 flex-1 ${
            viewMode === 'list' ? 'w-2/3' : ''
          }`}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 line-clamp-3 mb-3">
                  {project.short_description || project.description}
                </p>
                
                {/* Problem Statement */}
                {project.challenge && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Challenge:</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                      {project.challenge}
                    </p>
                  </div>
                )}

                {/* Solution/Key Features */}
                {project.key_features && project.key_features.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Key Features:</h4>
                    <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
                      {project.key_features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Project Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-sm rounded-full">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Project Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center gap-3">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors btn-lift"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors btn-lift"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors btn-lift"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </Card3D>
      </TiltCard>
    </motion.div>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="responsive-container">
          <SectionHeader 
            title="Explore My Projects" 
            subtitle="Discover my latest work and creative solutions across various technologies"
            variant="tech"
            centered
          />

          {/* Search and Filter Controls */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col lg:flex-row gap-6 mb-8"
          >
            {/* Search Bar */}
            <motion.div 
              variants={fadeInUpVariants}
              className="flex-1 relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-secondary-700 dark:text-secondary-300 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </motion.div>

            {/* View Mode Toggle */}
            <motion.div 
              variants={fadeInUpVariants}
              className="flex items-center gap-2"
            >
              <Button
                variant={viewMode === 'grid' ? 'tech' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'tech' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </motion.div>

            {/* Sort Dropdown */}
            <motion.div 
              variants={fadeInUpVariants}
              className="relative"
            >
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="date">Latest First</option>
                <option value="featured">Featured First</option>
                <option value="title">Alphabetical</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4 pointer-events-none" />
            </motion.div>
          </motion.div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <motion.div 
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {allTags.map((tag, index) => (
                <motion.button
                  key={tag}
                  variants={scaleInVariants}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 text-secondary-700 hover:bg-white/20 dark:text-secondary-300'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Projects Grid */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={`grid gap-6 ${
              viewMode === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={projectCardVariants}
                  className="h-80 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl animate-pulse"
                />
              ))
            ) : (
              filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))
            )}
          </motion.div>

          {/* Empty State */}
          {!loading && filteredProjects.length === 0 && (
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                No projects found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your search criteria or filters."
                  : "No projects have been added yet."
                }
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}