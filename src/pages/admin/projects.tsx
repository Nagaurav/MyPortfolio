import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { splitList, splitLines } from '../../lib/text';
import { Button } from '../../components/ui/button';
import { MultiImageUpload } from '../../components/ui/multi-image-upload';
import { SectionHeader } from '../../components/ui/section-header';

import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectFormData {
  title: string;
  description: string;
  short_description: string;
  role: string;
  /** One contribution per line; stored as a text[]. */
  contributions: string;
  category: string;
  tech_stack: string;
  github_url: string;
  live_url: string;
  featured: boolean;
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  // The gallery lives outside react-hook-form: it is an array the uploader
  // mutates, not a plain input value. image_urls[0] is mirrored into image_url
  // on save so existing project cards keep working unchanged.
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>();


  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  useEffect(() => {
    if (editingProject) {
      setValue('title', editingProject.title);
      setValue('description', editingProject.description || '');
      setValue('short_description', editingProject.short_description || '');
      setValue('role', editingProject.role || '');
      setValue('contributions', (editingProject.contributions || []).join('\n'));
      setValue('category', editingProject.category || '');
      setValue('tech_stack', editingProject.tech_stack?.join(', ') || '');

      setValue('github_url', editingProject.github_url || '');
      setValue('live_url', editingProject.live_url || '');
      setValue('featured', editingProject.featured ?? false);
      setImageUrls(
        editingProject.image_urls?.length
          ? editingProject.image_urls
          : editingProject.image_url
            ? [editingProject.image_url]
            : []
      );
    } else {
      setImageUrls([]);
    }
  }, [editingProject, setValue]);
  
  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }
  
  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log('Form data being submitted:', data);
      
      // Validate required fields
      if (!data.title || !data.description) {
        toast.error('Title and Description are required fields');
        return;
      }

      const projectData = {
        ...data,
        tech_stack: splitList(data.tech_stack),
        contributions: splitLines(data.contributions),
        image_urls: imageUrls,
        // Cover image: keeps the project cards (which read image_url) in sync
        // with whichever image the gallery has first.
        image_url: imageUrls[0] ?? null,
      };

      console.log('Processed project data:', projectData);
      
      if (editingProject) {
        console.log('Updating project with ID:', editingProject.id);
        const { data: updateResult, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)
          .select();
        
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        
        console.log('Update result:', updateResult);
        toast.success('Project updated successfully');
      } else {
        console.log('Creating new project');
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user?.id) {
          toast.error('User not authenticated');
          return;
        }

        const { data: insertResult, error } = await supabase
          .from('projects')
          .insert([{ ...projectData, user_id: userData.user.id }])
          .select();
        
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        
        console.log('Insert result:', insertResult);
        toast.success('Project created successfully');
      }
      
      reset();
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);

      // Postgres surfaces constraint violations as a `code`; narrow before use.
      const { code, message } = (error ?? {}) as { code?: string; message?: string };

      // Provide more specific error messages
      if (code === '23505') {
        toast.error('A project with this title already exists');
      } else if (code === '23502') {
        toast.error('Missing required fields. Please check your input.');
      } else if (code === '23503') {
        toast.error('Invalid user reference. Please try logging in again.');
      } else if (message) {
        toast.error(`Error: ${message}`);
      } else {
        toast.error('Failed to save project. Please check the console for details.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };


  
  return (
    <div>
      <SectionHeader
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        subtitle="Manage your portfolio projects"
      />
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 input"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Description
            </label>
            <textarea
              id="description"
              rows={8}
              className="mt-1 input resize-y"
              placeholder="Write a detailed description of your project, including technologies used, challenges faced, and key features implemented..."
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Provide a comprehensive description that showcases your project's technical details and achievements.
            </p>
          </div>
          
          <div>
            <label htmlFor="short_description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Short Description
            </label>
            <textarea
              id="short_description"
              rows={3}
              className="mt-1 input resize-y"
              placeholder="A brief summary of your project (2-3 sentences) that will appear in project cards and previews..."
              {...register('short_description')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Keep this concise but informative for project previews and summaries.
            </p>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              My Role
            </label>
            <input
              type="text"
              id="role"
              className="mt-1 input"
              placeholder="e.g. Solo developer, Frontend lead, Backend developer"
              {...register('role')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Optional: your part in the project. Worth filling in for team, client or freelance work.
            </p>
          </div>

          <div>
            <label htmlFor="contributions" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              What I Built (one per line)
            </label>
            <textarea
              id="contributions"
              rows={6}
              className="mt-1 input resize-y"
              placeholder={`Designed the Postgres schema and row-level security policies
Built the authenticated admin panel for every content type
Wired image uploads through Supabase Storage`}
              {...register('contributions')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Each line becomes a bullet on the project page. Say what you personally did, not what the project is.
            </p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Category
            </label>
            <input
              type="text"
              id="category"
              className="mt-1 input"
              placeholder="e.g. Web App, Mobile, AI/ML"
              {...register('category')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Optional: groups projects under a heading on the public projects page.
            </p>
          </div>

          <div>
            <label htmlFor="tech_stack" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              id="tech_stack"
              className="mt-1 input"
              placeholder="React, TypeScript, Tailwind CSS, Supabase"
              {...register('tech_stack')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Separate multiple technologies with commas. Tech stack helps showcase the technologies used in your project.
            </p>
          </div>
          
          {/* Project images -- ordered gallery, first entry is the cover */}
          <div>
            <MultiImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              bucket="projects"
              folder="images"
              label="Project Images"
            />
          </div>
          
          <div>
            <label htmlFor="github_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              GitHub URL
            </label>
            <input
              type="url"
              id="github_url"
              className="mt-1 input"
              placeholder="https://github.com/username/project-name"
              {...register('github_url')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Optional: Link to your project's GitHub repository
            </p>
          </div>
          
          <div>
            <label htmlFor="live_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Live URL
            </label>
            <input
              type="url"
              id="live_url"
              className="mt-1 input"
              placeholder="https://your-project.com"
              {...register('live_url')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Optional: Link to your live project demo
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              {...register('featured')}
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-200">
              Featured Project
            </label>
          </div>
          
          <div className="flex gap-4">
            <Button
              type="submit"
              loading={isSubmitting}
              leftIcon={editingProject ? <Pencil size={16} /> : <Plus size={16} />}
            >
              {editingProject ? 'Update Project' : 'Add Project'}
            </Button>
            
            {editingProject && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingProject(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Projects List</h3>
        </div>
        
        <div className="border-t border-secondary-200">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : projects.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {projects.map((project) => (
                <div key={project.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-secondary-900">
                        {project.title}
                        {project.featured && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Featured
                          </span>
                        )}
                      </h4>
                      {project.category && (
                        <p className="mt-1 text-xs font-mono uppercase tracking-wider text-secondary-500">
                          {project.category}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-secondary-500">
                        {project.short_description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.tech_stack?.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-400 hover:text-secondary-500"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-secondary-500">
              No projects found. Add your first project using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}