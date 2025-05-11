import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectFormData {
  title: string;
  description: string;
  short_description: string;
  tags: string;
  image_url: string;
  github_url: string;
  live_url: string;
  featured: boolean;
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
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
      setValue('description', editingProject.description);
      setValue('short_description', editingProject.short_description || '');
      setValue('tags', editingProject.tags?.join(', ') || '');
      setValue('image_url', editingProject.image_url || '');
      setValue('github_url', editingProject.github_url || '');
      setValue('live_url', editingProject.live_url || '');
      setValue('featured', editingProject.featured);
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
      const projectData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
        
        if (error) throw error;
        
        toast.success('Project updated successfully');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{ ...projectData, user_id: (await supabase.auth.getUser()).data.user?.id }]);
        
        if (error) throw error;
        
        toast.success('Project created successfully');
      }
      
      reset();
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
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
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 input"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 input"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="short_description" className="block text-sm font-medium text-secondary-700">
              Short Description
            </label>
            <input
              type="text"
              id="short_description"
              className="mt-1 input"
              {...register('short_description')}
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-secondary-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="mt-1 input"
              {...register('tags')}
            />
          </div>
          
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-secondary-700">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              className="mt-1 input"
              {...register('image_url')}
            />
          </div>
          
          <div>
            <label htmlFor="github_url" className="block text-sm font-medium text-secondary-700">
              GitHub URL
            </label>
            <input
              type="url"
              id="github_url"
              className="mt-1 input"
              {...register('github_url')}
            />
          </div>
          
          <div>
            <label htmlFor="live_url" className="block text-sm font-medium text-secondary-700">
              Live URL
            </label>
            <input
              type="url"
              id="live_url"
              className="mt-1 input"
              {...register('live_url')}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              {...register('featured')}
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-secondary-700">
              Featured Project
            </label>
          </div>
          
          <div className="flex gap-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
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
                      <p className="mt-1 text-sm text-secondary-500">
                        {project.short_description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                          >
                            {tag}
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