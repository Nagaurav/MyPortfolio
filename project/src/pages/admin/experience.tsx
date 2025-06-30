import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Experience = Database['public']['Tables']['experiences']['Row'];

interface ExperienceFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
  technologies: string;
}

const EXPERIENCE_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
];

export function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormData>();

  const currentPosition = watch('current');

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    if (editingExperience) {
      setValue('title', editingExperience.title);
      setValue('company', editingExperience.company);
      setValue('location', editingExperience.location);
      setValue('type', editingExperience.type);
      setValue('start_date', editingExperience.start_date);
      setValue('end_date', editingExperience.end_date || '');
      setValue('current', editingExperience.current);
      setValue('description', editingExperience.description);
      setValue('technologies', editingExperience.technologies?.join(', ') || '');
    }
  }, [editingExperience, setValue]);

  async function fetchExperiences() {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      const experienceData = {
        ...data,
        technologies: data.technologies.split(',').map(tech => tech.trim()).filter(Boolean),
        end_date: data.current ? null : data.end_date,
      };

      if (editingExperience) {
        const { error } = await supabase
          .from('experiences')
          .update(experienceData)
          .eq('id', editingExperience.id);

        if (error) throw error;
        toast.success('Experience updated successfully');
      } else {
        const { error } = await supabase
          .from('experiences')
          .insert([{
            ...experienceData,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          }]);

        if (error) throw error;
        toast.success('Experience added successfully');
      }

      reset();
      setEditingExperience(null);
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience:', error);
      toast.error('Failed to save experience');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Experience deleted successfully');
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
    }
  };

  return (
    <div>
      <SectionHeader
        title={editingExperience ? 'Edit Experience' : 'Add New Experience'}
        subtitle="Manage your professional experience"
      />

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 input"
                {...register('title', { required: 'Job title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-secondary-700">
                Company
              </label>
              <input
                type="text"
                id="company"
                className="mt-1 input"
                {...register('company', { required: 'Company is required' })}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-secondary-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="mt-1 input"
                {...register('location', { required: 'Location is required' })}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-secondary-700">
                Employment Type
              </label>
              <select
                id="type"
                className="mt-1 input"
                {...register('type', { required: 'Employment type is required' })}
              >
                <option value="">Select type</option>
                {EXPERIENCE_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-secondary-700">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                className="mt-1 input"
                {...register('start_date', { required: 'Start date is required' })}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-secondary-700">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                className="mt-1 input"
                disabled={currentPosition}
                {...register('end_date', {
                  required: !currentPosition ? 'End date is required' : false,
                })}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="current"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              {...register('current')}
            />
            <label htmlFor="current" className="ml-2 block text-sm text-secondary-700">
              I currently work here
            </label>
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
            <label htmlFor="technologies" className="block text-sm font-medium text-secondary-700">
              Technologies Used (comma-separated)
            </label>
            <input
              type="text"
              id="technologies"
              className="mt-1 input"
              {...register('technologies')}
              placeholder="React, TypeScript, Node.js"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={editingExperience ? <Pencil size={16} /> : <Plus size={16} />}
            >
              {editingExperience ? 'Update Experience' : 'Add Experience'}
            </Button>

            {editingExperience && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingExperience(null);
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
          <h3 className="text-lg font-medium text-secondary-900">Experience List</h3>
        </div>

        <div className="border-t border-secondary-200">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : experiences.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {experiences.map((experience) => (
                <div key={experience.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-secondary-900">
                          {experience.title}
                        </h4>
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          {experience.type}
                        </span>
                      </div>
                      <p className="mt-1 text-secondary-600">
                        {experience.company} • {experience.location}
                      </p>
                      <p className="mt-1 text-sm text-secondary-500">
                        {format(new Date(experience.start_date), 'MMM yyyy')} -{' '}
                        {experience.current
                          ? 'Present'
                          : format(new Date(experience.end_date!), 'MMM yyyy')}
                      </p>
                      <p className="mt-2 text-secondary-600 whitespace-pre-line">
                        {experience.description}
                      </p>
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {experience.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingExperience(experience)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(experience.id)}
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
              No experiences found. Add your first experience using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}