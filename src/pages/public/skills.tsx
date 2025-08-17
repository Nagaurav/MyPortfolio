import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code2, Database as DatabaseIcon, Server, Smartphone, Wrench, Brain } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TechCard, GlassCard } from '../../components/ui/3d-card';
import { TiltCard } from '../../components/ui/3d-tilt-card';

import { 
  staggerContainerVariants, 
  fadeInUpVariants, 
  scaleInVariants,
  skillCardVariants 
} from '../../lib/utils';
import type { Database } from '../../types/database.types';
import { Background3D } from '../../components/3d-background';

type Skill = Database['public']['Tables']['skills']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface SkillWithProjects extends Skill {
  relatedProjects?: Project[];
}

const CATEGORY_ICONS = {
  'Frontend Development': Code2,
  'Backend Development': Server,
  'Mobile Development': Smartphone,
  'Database': DatabaseIcon,
  'DevOps': Wrench,
  'Soft Skills': Brain,
};

const CATEGORY_COLORS = {
  'Frontend Development': 'from-cyan-500 to-blue-600',
  'Backend Development': 'from-purple-500 to-pink-600',
  'Mobile Development': 'from-green-500 to-emerald-600',
  'Database': 'from-orange-500 to-red-600',
  'DevOps': 'from-indigo-500 to-purple-600',
  'Soft Skills': 'from-teal-500 to-cyan-600',
};

export function SkillsPage() {
  const [skills, setSkills] = useState<SkillWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        // For portfolio display, we'll show all skills (assuming they're all yours)
        // If you want to restrict to specific user, you can add .eq('user_id', 'your-user-id')
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .order('category')
          .order('proficiency', { ascending: false });

        if (skillsError) throw skillsError;

        console.log('Fetched skills data:', skillsData); // Debug log

        const skillsWithProjects = await Promise.all(
          (skillsData || []).map(async (skill: Skill) => {
            const { data: projects } = await supabase
              .from('projects')
              .select('*')
              .contains('tags', [skill.name])
              .limit(3);

            return {
              ...skill,
              relatedProjects: projects || [],
            };
          })
        );

        console.log('Skills with projects:', skillsWithProjects); // Debug log
        setSkills(skillsWithProjects);
      } catch (error) {
        console.error('Error fetching skills:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

  const categories = Array.from(new Set(skills.map(skill => skill.category)));

  const filteredSkills = selectedCategory
    ? skills.filter(skill => skill.category === selectedCategory)
    : skills;

  return (
    <>
      {/* Animated 3D Background */}
      <Background3D variant="minimal" enabled={true} />
      
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
          className="absolute bottom-20 left-20 w-72 h-72 bg-accent-300/30 to-primary-400/30 rounded-full mix-blend-multiply filter blur-xl"
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
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-secondary-900">My </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-600 animate-gradient bg-[length:200%_auto]">
                Technical Expertise
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              A comprehensive overview of my skills and technologies I work with
            </p>
          </motion.div>
          
          {/* Category Filter */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center gap-4 mb-12"
          >
            <motion.button
              variants={scaleInVariants}
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 dark:bg-secondary-800/50 backdrop-blur-sm border border-white/20 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-white/20 dark:hover:bg-secondary-700 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-600/20'
              }`}
            >
              All Skills
            </motion.button>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  variants={scaleInVariants}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 dark:bg-secondary-800/50 backdrop-blur-sm border border-white/20 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-white/20 dark:hover:bg-secondary-700 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-600/20'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Skills Grid */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={skillCardVariants}
                  className="h-48 bg-white/10 dark:bg-secondary-800/50 backdrop-blur-sm border border-white/20 dark:border-secondary-600 rounded-xl animate-pulse"
                />
              ))
            ) : (
              filteredSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  variants={skillCardVariants}
                  className="group"
                >
                  <TiltCard
                    maxTilt={10}
                    scale={1.02}
                    speed={300}
                    glare={true}
                    glareColor="rgba(255, 255, 255, 0.2)"
                    glarePosition="top"
                    className="h-full"
                  >
                    <TechCard className="h-full">
                      <div className="space-y-4">
                        {/* Skill Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${CATEGORY_COLORS[skill.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-gray-600'}`}>
                              {CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_COLORS] && 
                                React.createElement(CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_COLORS], {
                                  className: "w-5 h-5 text-white"
                                })
                              }
                            </div>
                            <div>
                              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                                {skill.name}
                              </h3>
                              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                {skill.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-600">
                              {Math.round((skill.proficiency / 5) * 100)}%
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary-600 dark:text-secondary-400">Proficiency</span>
                            <span className="text-secondary-700 dark:text-secondary-300">{Math.round((skill.proficiency / 5) * 100)}%</span>
                          </div>
                          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${CATEGORY_COLORS[skill.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-gray-600'} rounded-full`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(skill.proficiency / 5) * 100}%` }}
                              transition={{ duration: 1 }}
                              viewport={{ once: true }}
                            />
                          </div>
                        </div>

                        {/* Description - Removed as it's not in the database schema */}

                        {/* Related Projects */}
                        {skill.relatedProjects && skill.relatedProjects.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                              Related Projects
                            </h4>
                            <div className="space-y-1">
                              {skill.relatedProjects.slice(0, 2).map((project) => (
                                <div
                                  key={project.id}
                                  className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {project.title}
                                </div>
                              ))}
                              {skill.relatedProjects.length > 2 && (
                                <div className="text-xs text-secondary-500 dark:text-secondary-500">
                                  +{skill.relatedProjects.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Experience Level - Removed as it's not in the database schema */}
                      </div>
                    </TechCard>
                  </TiltCard>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Empty State */}
          {!loading && filteredSkills.length === 0 && (
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center py-20"
            >
              <TiltCard maxTilt={3} scale={1.01} speed={400}>
                <GlassCard className="max-w-2xl mx-auto p-16">
                  <div className="text-8xl mb-8">🔧</div>
                  <h3 className="text-3xl font-semibold text-secondary-700 dark:text-secondary-300 mb-6">
                    No skills found
                  </h3>
                  <p className="text-xl text-secondary-600 dark:text-secondary-400">
                    {selectedCategory 
                      ? `No skills found in the "${selectedCategory}" category.`
                      : "No skills have been added yet."
                    }
                  </p>
                </GlassCard>
              </TiltCard>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}