import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import type { Database } from '../../types/database.types';

type Resume = Database['public']['Tables']['resumes']['Row'];

export function ResumePage() {
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveResume() {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        setActiveResume(data);
      } catch (error) {
        console.error('Error fetching resume:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveResume();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
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
            className="max-w-3xl mx-auto text-center px-4"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              <span className="text-secondary-900">My Professional </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]">
                Resume
              </span>
            </h1>
            <p className="text-lg md:text-xl text-secondary-600">
              Download my resume to learn more about my experience, skills, and qualifications
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-12 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-pulse">
              <div className="h-8 bg-secondary-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-secondary-200 rounded w-1/3 mb-6"></div>
              <div className="h-12 bg-secondary-200 rounded w-48"></div>
            </div>
          ) : activeResume ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-secondary-100"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-secondary-900">
                    {activeResume.title}
                  </h2>
                  <p className="text-secondary-600 mt-1">
                    Version {activeResume.version}
                  </p>
                </div>
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-secondary-600">
                  Last updated: {new Date(activeResume.created_at).toLocaleDateString()}
                </p>
              </div>

              <Button
                as="a"
                href={activeResume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="w-full sm:w-auto"
                leftIcon={<Download size={16} />}
              >
                Download Resume
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No resume available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}