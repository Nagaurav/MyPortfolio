import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { FileUpload } from '../../components/ui/file-upload';
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
  const [uploading, setUploading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResumeFormData>();

  const fileUrl = watch('file_url');
  
  useEffect(() => {
    fetchResumes();
  }, []);
  
  useEffect(() => {
    if (editingResume) {
      setValue('title', editingResume.title);
      setValue('version', editingResume.version);
      setValue('file_url', editingResume.file_url || '');
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

  const handleFileUpload = (url: string) => {
    setValue('file_url', url);
  };
  
  return (
    <div className="space-y-8">
      <SectionHeader
        title={editingResume ? 'Edit Resume' : 'Add New Resume'}
        subtitle="Manage your resume versions"
      />
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Resume Title
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 input"
              {...register('title', { required: 'Resume title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Version
            </label>
            <input
              type="text"
              id="version"
              className="mt-1 input"
              {...register('version', { required: 'Version is required' })}
            />
            {errors.version && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.version.message}</p>
            )}
          </div>
          
          <FileUpload
            onUpload={handleFileUpload}
            accept=".pdf,.doc,.docx"
            maxSize={10 * 1024 * 1024} // 10MB for resumes
            bucket="resumes"
            folder="files"
            currentFile={fileUrl}
            label="Resume File"
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              {...register('is_active')}
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-200">
              Set as Active Resume
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              loading={isSubmitting || uploading}
              leftIcon={editingResume ? <Pencil size={16} /> : <Plus size={16} />}
              className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 md:p-6">
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Resume Versions</h3>
        </div>
        
        <div className="border-t border-secondary-200 dark:border-dark-600">
          {loading ? (
            <div className="p-4 md:p-6 text-center text-secondary-500 dark:text-secondary-400">Loading...</div>
          ) : resumes.length > 0 ? (
            <div className="divide-y divide-secondary-200 dark:divide-dark-600">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-medium text-secondary-900 dark:text-white flex items-center gap-2">
                        {resume.title}
                        {resume.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        Version: {resume.version}
                      </p>
                      <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        Added: {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Button
                        as="a"
                        href={resume.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Download size={16} />}
                      >
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingResume(resume)}
                        leftIcon={<Pencil size={16} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resume.id)}
                        leftIcon={<Trash2 size={16} />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 md:p-6 text-center text-secondary-500 dark:text-secondary-400">
              No resumes found. Add your first resume using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}