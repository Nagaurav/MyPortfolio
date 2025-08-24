import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Building2, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Card3D, TechCard, GlassCard } from '../../components/ui/3d-card';
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
        <motion.div 
          className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-primary-300/30 to-accent-300/30 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-accent-300/30 to-primary-400/30 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="responsive-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-secondary-900">Professional </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-600 animate-gradient bg-[length:200%_auto]">
                Experience
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              A journey through my professional career and achievements
            </p>
          </motion.div>
        </div>
      </section>

      <div className="responsive-container pb-20">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card3D variant="tech" className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 bg-secondary-200/50 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-secondary-200/50 rounded w-1/4"></div>
                      <div className="h-4 bg-secondary-200/50 rounded w-1/2"></div>
                      <div className="h-4 bg-secondary-200/50 rounded w-3/4"></div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative"
          >
            {/* Enhanced Timeline line */}
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-primary-500 via-accent-600 to-primary-700 rounded-full shadow-lg"></div>

            <div className="space-y-12">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  variants={item}
                  className="relative pl-12"
                >
                  {/* Enhanced Timeline dot */}
                  <motion.div 
                    className="absolute left-0 top-8 w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-accent-600 shadow-lg transform -translate-x-1/2 border-4 border-white"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-500"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>

                  <Card3D variant="tech" className="p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div className="flex-1">
                        <motion.h3 
                          className="text-2xl font-bold text-secondary-900 dark:text-white mb-2"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {experience.title}
                        </motion.h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <motion.div 
                            className="flex items-center text-secondary-700 dark:text-secondary-300 p-3 rounded-lg bg-secondary-50 dark:bg-dark-700 border border-secondary-200 dark:border-dark-600"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgb(241, 245, 249)', borderColor: 'rgb(148, 163, 184)' }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Building2 size={18} className="mr-3 text-primary-600" />
                            <span className="font-medium">{experience.company}</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center text-secondary-700 dark:text-secondary-300 p-3 rounded-lg bg-secondary-50 dark:bg-dark-700 border border-secondary-200 dark:border-dark-600"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgb(241, 245, 249)', borderColor: 'rgb(148, 163, 184)' }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <MapPin size={18} className="mr-3 text-primary-600" />
                            <span className="font-medium">{experience.location}</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center text-secondary-700 dark:text-secondary-300 p-3 rounded-lg bg-secondary-50 dark:bg-dark-700 border border-secondary-200 dark:border-dark-600"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgb(241, 245, 249)', borderColor: 'rgb(148, 163, 184)' }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Clock size={18} className="mr-3 text-primary-600" />
                            <span className="font-medium">
                              {format(new Date(experience.start_date), 'MMM yyyy')} -{' '}
                              {experience.current
                                ? 'Present'
                                : format(new Date(experience.end_date!), 'MMM yyyy')}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                        <motion.span 
                          className="mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg border border-primary-500/20"
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {experience.type}
                        </motion.span>
                    </div>

                    <motion.div 
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                        Key Responsibilities & Achievements
                      </h4>
                      <div className="prose prose-secondary dark:prose-invert max-w-none">
                        <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-line leading-relaxed text-base">
                          {experience.description}
                        </p>
                      </div>
                    </motion.div>

                    {experience.technologies && experience.technologies.length > 0 && (
                      <div className="border-t border-white/20 pt-4">
                                                 <h4 className="text-sm font-medium text-secondary-700 mb-3 flex items-center">
                           <Award className="w-4 h-4 mr-2 text-primary-500" />
                           Technologies & Skills
                         </h4>
                        <div className="flex flex-wrap gap-2">
                          {experience.technologies.map((tech) => (
                                                         <motion.span
                               key={tech}
                               className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-secondary-700 border border-white/20 hover:bg-primary-500/20 hover:text-primary-600 transition-all duration-300"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                             >
                               {tech}
                             </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card3D>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}


      </div>
    </>
  );
}