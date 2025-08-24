import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="responsive-container py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-secondary-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
            <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
            <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="responsive-container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Project Not Found</h2>
          <p className="text-secondary-600 mb-8">The project you're looking for doesn't exist.</p>
          <Button as={Link} to="/projects" leftIcon={<ArrowLeft size={16} />}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="responsive-container py-12"
    >
      <div className="mb-8">
        <Button
          as={Link}
          to="/projects"
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          className="mb-6"
        >
          Back to Projects
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-secondary-900">{project.title}</h1>
            {project.tech_stack && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tech_stack.map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {project.github_url && (
              <Button
                as="a"
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                leftIcon={<Github size={16} />}
              >
                View Code
              </Button>
            )}
            {project.live_url && (
              <Button
                as="a"
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<ExternalLink size={16} />}
              >
                Live Demo
              </Button>
            )}
          </div>
        </div>
      </div>

      {project.image_url && (
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-[400px] object-cover"
          />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 prose max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
            <p className="text-secondary-600 whitespace-pre-line">
              {project.description}
            </p>
          </section>

          {project.short_description && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Problem Statement</h2>
              <p className="text-secondary-600">
                {project.short_description}
              </p>
            </section>
          )}

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white text-secondary-700 rounded-full text-sm shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div>
          <div className="bg-secondary-50 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-secondary-500">Created</dt>
                <dd className="mt-1 text-sm text-secondary-900">
                  {new Date(project.created_at).toLocaleDateString()}
                </dd>
              </div>
              {project.github_url && (
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Repository</dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View on GitHub
                    </a>
                  </dd>
                </div>
              )}
              {project.live_url && (
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Live Demo</dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Visit Website
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  );
}