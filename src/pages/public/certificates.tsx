import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Certificate = Database['public']['Tables']['certificates']['Row'];

export function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-[0.2]"></div>
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-secondary-900">Professional </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]">
                Certifications
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              Explore my professional certifications and achievements that demonstrate expertise and continuous learning
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(3).fill(null).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-48 bg-secondary-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-secondary-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
              </div>
            ))
          ) : certificates.length > 0 ? (
            certificates.map((certificate) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {certificate.certificate_url ? (
                  <div className="relative h-48">
                    <img
                      src={certificate.certificate_url}
                      alt={certificate.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                    <Award className="w-16 h-16 text-primary-600" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {certificate.title}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Issued by {certificate.issuer}
                  </p>
                  <div className="text-sm text-secondary-500 mb-4">
                    <p>Issued: {new Date(certificate.issue_date).toLocaleDateString()}</p>
                    {certificate.expiry_date && (
                      <p>Expires: {new Date(certificate.expiry_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  {certificate.credential_url && (
                    <a
                      href={certificate.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View Credential
                      <ExternalLink size={16} className="ml-2" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No certificates found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}