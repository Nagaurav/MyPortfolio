import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink, Eye, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { FileUpload } from '../../components/ui/file-upload';
import { Modal } from '../../components/ui/modal';
import type { Database } from '../../types/database.types';

type Certificate = Database['public']['Tables']['certificates']['Row'];

interface CertificateFormData {
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_url?: string;
  certificate_url?: string;
}

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<CertificateFormData>();

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Populate form when editing
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
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: CertificateFormData) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

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
          .insert([{ ...data, user_id: user.id }]);

        if (error) throw error;
        toast.success('Certificate added successfully');
      }

      setEditingCertificate(null);
      reset();
      fetchCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error('Failed to save certificate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

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

  const handleImageClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
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
            <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
              Leave empty if the certificate doesn't expire
            </p>
          </div>
          
          <div>
            <label htmlFor="credential_url" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Credential URL
            </label>
            <input
              type="url"
              id="credential_url"
              className="mt-1 input"
              placeholder="https://example.com/credential"
              {...register('credential_url')}
            />
          </div>
          
          <FileUpload
            onUpload={handleCertificateUpload}
            accept="image/*"
            bucket="certificates"
            folder="images"
            currentFile={editingCertificate?.certificate_url || ''}
            label="Certificate Image (JPEG, PNG, GIF, WebP)"
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Certificate Image Preview */}
                      {certificate.certificate_url ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer group" onClick={() => handleImageClick(certificate)}>
                          <img
                            src={certificate.certificate_url}
                            alt={certificate.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center">
                          <Award size={24} className="text-primary-600" />
                        </div>
                      )}
                      
                      {/* Certificate Details */}
                      <div className="flex-1">
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
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {certificate.credential_url && (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-secondary-400 hover:text-secondary-500 dark:text-secondary-500 dark:hover:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                          title="View Credential"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCertificate(certificate)}
                        className="hover:bg-secondary-100 dark:hover:bg-dark-700"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(certificate.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
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

      {/* Certificate Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedCertificate?.title}
      >
        {selectedCertificate && (
          <div className="space-y-6">
            {/* Certificate Image */}
            {selectedCertificate.certificate_url && (
              <div className="flex justify-center">
                <img
                  src={selectedCertificate.certificate_url}
                  alt={selectedCertificate.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            )}
            
            {/* Certificate Details */}
            <div className="bg-secondary-50 dark:bg-dark-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-secondary-700 dark:text-secondary-300">Issuer:</span>
                  <p className="text-secondary-900 dark:text-secondary-100">{selectedCertificate.issuer}</p>
                </div>
                <div>
                  <span className="font-medium text-secondary-700 dark:text-secondary-300">Issue Date:</span>
                  <p className="text-secondary-900 dark:text-secondary-100">
                    {new Date(selectedCertificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
                {selectedCertificate.expiry_date && (
                  <div>
                    <span className="font-medium text-secondary-700 dark:text-secondary-300">Expiry Date:</span>
                    <p className="text-secondary-900 dark:text-secondary-100">
                      {new Date(selectedCertificate.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {selectedCertificate.credential_url && (
                <a
                  href={selectedCertificate.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Verify Credential ↗
                  <ExternalLink size={18} className="ml-2" />
                </a>
              )}
              
              <button
                onClick={closeModal}
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 font-medium rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}