import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink, Code2, Database as DatabaseIcon, Server, Smartphone, Wrench, Brain, Zap, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../../components/ui/section-header';
import { Card3D, TechCard, GlassCard } from '../../components/ui/3d-card';
import { TiltCard } from '../../components/ui/3d-tilt-card';
import { SkillLogo, skillCategories, type SkillCategory } from '../../components/ui/skill-logo';
import { 
  staggerContainerVariants, 
  fadeInUpVariants, 
  scaleInVariants,
  skillCardVariants 
} from '../../lib/utils';
import type { Database } from '../../types/database.types';

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
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .order('category')
          .order('proficiency', { ascending: false });

        if (skillsError) throw skillsError;

        const skillsWithProjects = await Promise.all(
          (skillsData || []).map(async (skill) => {
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

        setSkills(skillsWithProjects);
      } catch (error) {
        console.error('Error fetching skills:', error);
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
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="responsive-container">
          <SectionHeader 
            title="My Technical Expertise" 
            subtitle="A comprehensive overview of my skills and technologies I work with"
            variant="tech"
            centered
          />
          
          {/* Category Filter */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <motion.button
              variants={scaleInVariants}
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-secondary-700 hover:bg-white/20 dark:text-secondary-300'
              }`}
            >
              All Skills
            </motion.button>
            {categories.map((category, index) => (
              <motion.button
                key={category}
                variants={scaleInVariants}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-secondary-700 hover:bg-white/20 dark:text-secondary-300'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Skills Grid */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={skillCardVariants}
                  className="h-48 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl animate-pulse"
                />
              ))
            ) : (
              filteredSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  variants={skillCardVariants}
                  onHoverStart={() => setHoveredSkill(skill.id)}
                  onHoverEnd={() => setHoveredSkill(null)}
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
                                                          {CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_ICONS] && 
                              React.createElement(CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_ICONS], {
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
                              {skill.proficiency}%
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary-600 dark:text-secondary-400">Proficiency</span>
                            <span className="text-secondary-700 dark:text-secondary-300">{skill.proficiency}%</span>
                          </div>
                          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${CATEGORY_COLORS[skill.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-gray-600'} rounded-full`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.proficiency}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              viewport={{ once: true }}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        {skill.description && (
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                            {skill.description}
                          </p>
                        )}

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

                        {/* Experience Level */}
                        {skill.experience_years && (
                          <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <Target className="w-4 h-4" />
                            <span>{skill.experience_years} years experience</span>
                          </div>
                        )}
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
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                No skills found
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {selectedCategory 
                  ? `No skills found in the "${selectedCategory}" category.`
                  : "No skills have been added yet."
                }
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Professional Skills Grid */}
      <section className="py-16 bg-secondary-50/50 dark:bg-secondary-900/50">
        <div className="responsive-container">
          <SectionHeader 
            title="Professional Skills" 
            subtitle="Technologies I work with daily to create exceptional digital experiences"
            variant="gradient"
            centered
          />

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {Object.entries(skillCategories).map(([category, skills]) => (
              <motion.div
                key={category}
                variants={skillCardVariants}
                className="space-y-6"
              >
                <TiltCard
                  maxTilt={5}
                  scale={1.02}
                  speed={300}
                  className="h-full"
                >
                  <TechCard className="h-full">
                    <div className="space-y-4">
                      {/* Category Header */}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                          {category === 'Frontend' && <Code2 className="w-6 h-6 text-white" />}
                          {category === 'Backend' && <Server className="w-6 h-6 text-white" />}
                          {category === 'Database' && <DatabaseIcon className="w-6 h-6 text-white" />}
                          {category === 'Tools & DevOps' && <Wrench className="w-6 h-6 text-white" />}
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                          {category}
                        </h3>
                      </div>

                      {/* Skills List */}
                      <div className="space-y-3">
                        {skills.map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-secondary-800/50 hover:bg-white/80 dark:hover:bg-secondary-700/50 transition-all duration-200 skill-tag"
                          >
                            <SkillLogo skill={skill} className="w-6 h-6 flex-shrink-0" />
                            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                              {skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TechCard>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Skills Summary */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-12 text-center"
          >
            <TiltCard maxTilt={3} scale={1.01} speed={400}>
              <GlassCard className="max-w-3xl mx-auto p-8">
                <div className="flex items-center justify-center gap-8 flex-wrap">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      {Object.values(skillCategories).flat().length}+
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Technologies
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      {Object.keys(skillCategories).length}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Specializations
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      5+
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      Years Experience
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TiltCard>
          </motion.div>
        </div>
      </section>
    </>
  );
}