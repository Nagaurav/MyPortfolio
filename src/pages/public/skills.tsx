import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code2, Database as DatabaseIcon, Server, Smartphone, Wrench, Brain } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card3D } from '../../components/ui/3d-card';
import type { Database } from '../../types/database.types';


type Skill = Database['public']['Tables']['skills']['Row'];

const CATEGORY_ICONS = {
  'Frontend Development': Code2,
  'Backend Development': Server,
  'Mobile Development': Smartphone,
  'Database': DatabaseIcon,
  'DevOps': Wrench,
  'Tools & Technologies': Wrench,
  'Soft Skills': Brain,
};

const CATEGORY_COLORS = {
  'Frontend Development': 'from-cyan-500 to-blue-600',
  'Backend Development': 'from-purple-500 to-pink-600',
  'Mobile Development': 'from-green-500 to-emerald-600',
  'Database': 'from-orange-500 to-red-600',
  'DevOps': 'from-indigo-500 to-purple-600',
  'Tools & Technologies': 'from-yellow-500 to-orange-600',
  'Soft Skills': 'from-teal-500 to-cyan-600',
};

export function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .order('category')
          .order('proficiency', { ascending: false });

        if (skillsError) {
          console.error('Skills fetch error:', skillsError);
          throw skillsError;
        }

        setSkills(skillsData || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

  const categories = useMemo(() => 
    Array.from(new Set(skills.map(skill => skill.category))), 
    [skills]
  );

  const filteredSkills = useMemo(() => 
    selectedCategory
      ? skills.filter(skill => skill.category === selectedCategory)
      : skills,
    [skills, selectedCategory]
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  function renderStars(value: number) {
    const clamped = Math.max(0, Math.min(5, value));
    const widthPercent = `${(clamped / 5) * 100}%`;
    return (
      <div className="relative inline-block align-middle" aria-label={`${clamped} out of 5`}>
        <span className="text-secondary-300 dark:text-secondary-600 select-none tracking-[2px]">★★★★★</span>
        <span
          className="absolute left-0 top-0 overflow-hidden text-yellow-400 dark:text-yellow-300 select-none tracking-[2px]"
          style={{ width: widthPercent }}
        >
          ★★★★★
        </span>
      </div>
    );
  }

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
              <span className="text-secondary-900">My </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-600 animate-gradient bg-[length:200%_auto]">
                Technical Expertise
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              A comprehensive overview of my skills and technologies I work with
            </p>
          </motion.div>
        </div>
      </section>

      <div className="responsive-container pb-20">
        {/* Category Filter Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-4 mb-12"
        >
          <motion.button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-lg'
                : 'bg-white hover:bg-secondary-50 text-secondary-700 border border-secondary-200 hover:border-secondary-300'
            }`}
          >
            All Skills
          </motion.button>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-lg'
                    : 'bg-white hover:bg-secondary-50 text-secondary-700 border border-secondary-200 hover:border-secondary-300'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skills Grid */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 6 }).map((_, i) => (
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                variants={item}
                className="group"
              >
                <Card3D variant="tech" className="p-6 hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${CATEGORY_COLORS[skill.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-gray-600'}`}>
                          {CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_ICONS] && 
                            React.createElement(CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_ICONS], {
                              className: "w-6 h-6 text-white"
                            })
                          }
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 text-lg">
                            {skill.name}
                          </h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            {skill.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(skill.proficiency)}
                      </div>
                    </div>
                    
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Skills Found */}
        {!loading && filteredSkills.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <Card3D variant="tech" className="max-w-2xl mx-auto p-16">
              <div className="text-8xl mb-8">🔧</div>
              <h3 className="text-3xl font-semibold text-secondary-700 dark:text-secondary-300 mb-6">
                No skills found
              </h3>
              <p className="text-xl text-secondary-600 dark:text-secondary-400">
                {selectedCategory 
                  ? `No skills found in the "${selectedCategory}" category.`
                  : "No skills have been added yet."}
              </p>

            </Card3D>
          </motion.div>
        )}
      </div>
    </>
  );
}