import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { leadSentences, splitList, splitLines } from '../../lib/text';
import {
  SHIPPING_META,
  SHIPPING_STATUSES,
  toShippingStatus,
  type ShippingStatus,
} from '../../lib/shipping-status';
import { Button } from '../../components/ui/button';
import { MultiImageUpload } from '../../components/ui/multi-image-upload';
import { SectionHeader } from '../../components/ui/section-header';

import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

/**
 * The form follows a fixed template -- the six questions a reader actually has
 * about a project -- rather than one field per idea.
 *
 * `short_description`, `role`, `outcome` and `category` still exist on the table
 * and still hold content on older rows; they are simply no longer edited here.
 */
interface ProjectFormData {
  title: string;
  /** What it does. */
  description: string;
  /** Who uses it. */
  audience: string;
  /** Stack -- comma-separated; stored as a text[]. */
  tech_stack: string;
  /** What I personally built -- one per line; stored as a text[]. */
  contributions: string;
  /** The hardest technical problem and how I solved it. */
  hardest_problem: string;
  /** What's shipped vs still local: the badge value, then the detail. */
  shipping_status: ShippingStatus | '';
  shipping_note: string;
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>();


  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  useEffect(() => {
    if (editingProject) {
      setValue('title', editingProject.title);
      setValue('description', editingProject.description || '');
      setValue('audience', editingProject.audience || '');
      setValue('tech_stack', editingProject.tech_stack?.join(', ') || '');
      setValue('contributions', (editingProject.contributions || []).join('\n'));
      setValue('hardest_problem', editingProject.hardest_problem || '');
      // An unrecognised stored value (hand-edited row) falls back to unanswered
      // rather than selecting an option the badge cannot render.
      setValue('shipping_status', toShippingStatus(editingProject.shipping_status) ?? '');
      setValue('shipping_note', editingProject.shipping_note || '');

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
        // The column is nullable under a check constraint that does not allow
        // '', so "not stated" has to go in as null.
        shipping_status: data.shipping_status || null,
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


  
  // Drives the hint under the select, so each option explains itself at the
  // moment it is chosen instead of in a paragraph listing all three.
  const shippingStatus = toShippingStatus(watch('shipping_status'));

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
              What it does
            </label>
            <textarea
              id="description"
              rows={6}
              className="mt-1 input resize-y"
              placeholder="What problem does it solve, and what does someone actually do with it?"
              {...register('description', { required: 'Say what the project does' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Plain sentences. The first two also stand in as the card summary.
            </p>
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Who uses it
            </label>
            <textarea
              id="audience"
              rows={2}
              className="mt-1 input resize-y"
              placeholder="e.g. Chakki owners across Maharashtra — about 40 shops as of last month"
              {...register('audience')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Real users, a client, your team, or just you so far. Rough numbers if you have them; leave blank rather than guessing.
            </p>
          </div>

          <div>
            <label htmlFor="tech_stack" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Stack (comma-separated)
            </label>
            <input
              type="text"
              id="tech_stack"
              className="mt-1 input"
              placeholder="React, TypeScript, Tailwind CSS, Supabase"
              {...register('tech_stack')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Languages, frameworks, database, hosting. Each becomes a chip.
            </p>
          </div>

          <div>
            <label htmlFor="contributions" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              What I personally built (one per line)
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
              Each line becomes a bullet. Say what you did, not what the project is — this is the field that matters most on team or client work.
            </p>
          </div>

          <div>
            <label htmlFor="hardest_problem" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              The hardest technical problem, and how I solved it
            </label>
            <textarea
              id="hardest_problem"
              rows={6}
              className="mt-1 input resize-y"
              placeholder="What broke, wouldn't scale, or had no obvious answer — then what you actually did about it."
              {...register('hardest_problem')}
            />
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              The specific version. "Optimised performance" says nothing; "N+1 query on the dashboard, folded into one aggregate" does.
            </p>
          </div>

          {/* Shipped vs local: a fixed status drives the badge, the note carries
              the nuance that never fits three options. */}
          <div className="grid gap-4 sm:grid-cols-[minmax(0,15rem)_1fr]">
            <div>
              <label htmlFor="shipping_status" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Shipped or still local
              </label>
              <select
                id="shipping_status"
                className="mt-1 input"
                {...register('shipping_status')}
              >
                <option value="">Not stated</option>
                {SHIPPING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {SHIPPING_META[status].label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                {shippingStatus
                  ? SHIPPING_META[shippingStatus].hint
                  : 'No badge is shown until you pick one.'}
              </p>
            </div>

            <div>
              <label htmlFor="shipping_note" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                What's shipped, what isn't
              </label>
              <textarea
                id="shipping_note"
                rows={3}
                className="mt-1 input resize-y"
                placeholder="e.g. Web app and admin are live; the WhatsApp notification worker still runs locally."
                {...register('shipping_note')}
              />
              <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                Optional detail under the badge. Honest beats impressive.
              </p>
            </div>
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
                      {toShippingStatus(project.shipping_status) && (
                        <p className="mt-1 text-xs font-mono uppercase tracking-wider text-secondary-500">
                          {SHIPPING_META[toShippingStatus(project.shipping_status)!].label}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-secondary-500">
                        {project.description && leadSentences(project.description, 1)}
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