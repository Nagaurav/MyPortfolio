import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Resume = Database['public']['Tables']['resumes']['Row'];

interface ResumeFormData {
  title: string;
  version: string;
  file_url: string;
  is_active: boolean;
}

export function AdminResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResumeFormData>();
  
  useEffect(() => {
    fetchResumes();
  }, []);
  
  useEffect(() => {
    if (editingResume) {
      setValue('title', editingResume.title);
      setValue('version', editingResume.version);
      setValue('file_url', editingResume.file_url);
      setValue('is_active', editingResume.is_active);
    }
  }, [editingResume, setValue]);
  
  async function fetchResumes() {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }
  
  const onSubmit = async (data: ResumeFormData) => {
    try {
      if (data.is_active) {
        // Deactivate all other resumes
        await supabase
          .from('resumes')
          .update({ is_active: false })
          .neq('id', editingResume?.id || '');
      }
      
      if (editingResume) {
        const { error } = await supabase
          .from('resumes')
          .update(data)
          .eq('id', editingResume.id);
        
        if (error) throw error;
        
        toast.success('Resume updated successfully');
      } else {
        const { error } = await supabase
          .from('resumes')
          .insert([{ ...data, user_id: (await supabase.auth.getUser()).data.user?.id }]);
        
        if (error) throw error;
        
        toast.success('Resume created successfully');
      }
      
      reset();
      setEditingResume(null);
      fetchResumes();
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };
  
  return (
    <div>
      <SectionHeader
        title={editingResume ? 'Edit Resume' : 'Add New Resume'}
        subtitle="Manage your resume versions"
      />
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
              Resume Title
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 input"
              {...register('title', { required: 'Resume title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-secondary-700">
              Version
            </label>
            <input
              type="text"
              id="version"
              className="mt-1 input"
              {...register('version', { required: 'Version is required' })}
            />
            {errors.version && (
              <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="file_url" className="block text-sm font-medium text-secondary-700">
              Resume File URL
            </label>
            <input
              type="url"
              id="file_url"
              className="mt-1 input"
              {...register('file_url', { required: 'File URL is required' })}
            />
            {errors.file_url && (
              <p className="mt-1 text-sm text-red-600">{errors.file_url.message}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              {...register('is_active')}
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-secondary-700">
              Set as Active Resume
            </label>
          </div>
          
          <div className="flex gap-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={editingResume ? <Pencil size={16} /> : <Plus size={16} />}
            >
              {editingResume ? 'Update Resume' : 'Add Resume'}
            </Button>
            
            {editingResume && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingResume(null);
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
          <h3 className="text-lg font-medium text-secondary-900">Resume Versions</h3>
        </div>
        
        <div className="border-t border-secondary-200">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : resumes.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-secondary-900">
                        {resume.title}
                        {resume.is_active && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="mt-1 text-sm text-secondary-500">
                        Version: {resume.version}
                      </p>
                      <p className="mt-1 text-sm text-secondary-500">
                        Added: {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={resume.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-400 hover:text-secondary-500"
                      >
                        <Download size={20} />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingResume(resume)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resume.id)}
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
              No resumes found. Add your first resume using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}