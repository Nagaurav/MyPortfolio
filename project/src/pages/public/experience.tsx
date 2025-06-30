import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Experience = Database['public']['Tables']['experiences']['Row'];

export function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
                Experience
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              A journey through my professional career and achievements
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-8 bg-secondary-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-600 to-accent-500"></div>

            <div className="space-y-12">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  variants={item}
                  className="relative pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-8 w-4 h-4 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 shadow-lg transform -translate-x-1/2"></div>

                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-secondary-900">
                          {experience.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center text-secondary-600">
                            <Briefcase size={16} className="mr-2" />
                            {experience.company}
                          </div>
                          <div className="flex items-center text-secondary-600">
                            <MapPin size={16} className="mr-2" />
                            {experience.location}
                          </div>
                          <div className="flex items-center text-secondary-600">
                            <Calendar size={16} className="mr-2" />
                            {format(new Date(experience.start_date), 'MMM yyyy')} -{' '}
                            {experience.current
                              ? 'Present'
                              : format(new Date(experience.end_date!), 'MMM yyyy')}
                          </div>
                        </div>
                      </div>
                      <span className="mt-2 md:mt-0 px-4 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                        {experience.type}
                      </span>
                    </div>

                    <p className="text-secondary-600 whitespace-pre-line mb-4">
                      {experience.description}
                    </p>

                    {experience.technologies && experience.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {experience.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}