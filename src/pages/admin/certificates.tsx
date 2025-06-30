import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { FileUpload } from '../../components/ui/file-upload';
import type { Database } from '../../types/database.types';

type Certificate = Database['public']['Tables']['certificates']['Row'];

interface CertificateFormData {
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_url: string;
  certificate_url: string;
}

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CertificateFormData>();

  const certificateUrl = watch('certificate_url');
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  useEffect(() => {
    if (editingCertificate) {
      setValue('title', editingCertificate.title);
      setValue('issuer', editingCertificate.issuer);
      setValue('issue_date', editingCertificate.issue_date);
      setValue('expiry_date', editingCertificate.expiry_date || '');
      setValue('credential_url', editingCertificate.credential_url || '');
      setValue('certificate_url', editingCertificate.certificate_url || '');
    }
  }, [editingCertificate, setValue]);
  
  async function fetchCertificates() {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }
  
  const onSubmit = async (data: CertificateFormData) => {
    try {
      if (editingCertificate) {
        const { error } = await supabase
          .from('certificates')
          .update(data)
          .eq('id', editingCertificate.id);
        
        if (error) throw error;
        
        toast.success('Certificate updated successfully');
      } else {
        const { error } = await supabase
          .from('certificates')
          .insert([{ ...data, user_id: (await supabase.auth.getUser()).data.user?.id }]);
        
        if (error) throw error;
        
        toast.success('Certificate created successfully');
      }
      
      reset();
      setEditingCertificate(null);
      fetchCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error('Failed to save certificate');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Certificate deleted successfully');
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const handleCertificateUpload = (url: string) => {
    setValue('certificate_url', url);
  };
  
  return (
    <div>
      <SectionHeader
        title={editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
        subtitle="Manage your certifications and achievements"
      />
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Certificate Title
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 input"
              {...register('title', { required: 'Certificate title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="issuer" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Issuing Organization
            </label>
            <input
              type="text"
              id="issuer"
              className="mt-1 input"
              {...register('issuer', { required: 'Issuer is required' })}
            />
            {errors.issuer && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.issuer.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="issue_date" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Issue Date
            </label>
            <input
              type="date"
              id="issue_date"
              className="mt-1 input"
              {...register('issue_date', { required: 'Issue date is required' })}
            />
            {errors.issue_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.issue_date.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="expiry_date" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Expiry Date (optional)
            </label>
            <input
              type="date"
              id="expiry_date"
              className="mt-1 input"
              {...register('expiry_date')}
            />
          </div>
          
          <div>
            <label htmlFor="credential_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Credential URL
            </label>
            <input
              type="url"
              id="credential_url"
              className="mt-1 input"
              {...register('credential_url')}
            />
          </div>
          
          <FileUpload
            onUpload={handleCertificateUpload}
            accept="image/*"
            bucket="certificates"
            folder="images"
            currentFile={certificateUrl}
            label="Certificate Image"
          />
          
          <div className="flex gap-4">
            <Button
              type="submit"
              loading={isSubmitting}
              leftIcon={editingCertificate ? <Pencil size={16} /> : <Plus size={16} />}
            >
              {editingCertificate ? 'Update Certificate' : 'Add Certificate'}
            </Button>
            
            {editingCertificate && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingCertificate(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Certificates List</h3>
        </div>
        
        <div className="border-t border-secondary-200 dark:border-dark-600">
          {loading ? (
            <div className="p-6 text-center text-secondary-500 dark:text-secondary-400">Loading...</div>
          ) : certificates.length > 0 ? (
            <div className="divide-y divide-secondary-200 dark:divide-dark-600">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-secondary-900 dark:text-white">
                        {certificate.title}
                      </h4>
                      <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        {certificate.issuer}
                      </p>
                      <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        <span>Issued: {new Date(certificate.issue_date).toLocaleDateString()}</span>
                        {certificate.expiry_date && (
                          <span className="ml-4">
                            Expires: {new Date(certificate.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {certificate.credential_url && (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-400 hover:text-secondary-500 dark:text-secondary-500 dark:hover:text-secondary-400"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCertificate(certificate)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(certificate.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-secondary-500 dark:text-secondary-400">
              No certificates found. Add your first certificate using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}