import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code2, Database, Server, Smartphone, Wrench, Brain } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../../components/ui/section-header';

type Skill = Database['public']['Tables']['skills']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface SkillWithProjects extends Skill {
  relatedProjects?: Project[];
}

const CATEGORY_ICONS = {
  'Frontend Development': Code2,
  'Backend Development': Server,
  'Mobile Development': Smartphone,
  'Database': Database,
  'DevOps': Wrench,
  'Soft Skills': Brain,
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
              <span className="text-secondary-900">My Technical </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]">
                Expertise
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              Explore my professional skills and competencies across various technologies and domains
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <motion.button
            onClick={() => setSelectedCategory(null)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200 shadow-sm'
            }`}
          >
            All Skills
          </motion.button>
          {categories.map(category => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                  : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200 shadow-sm'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-12 w-12 bg-secondary-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-secondary-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-secondary-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-secondary-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredSkills.map(skill => {
              const IconComponent = CATEGORY_ICONS[skill.category as keyof typeof CATEGORY_ICONS] || Code2;
              
              return (
                <motion.div
                  key={skill.id}
                  variants={item}
                  className="relative group"
                  onMouseEnter={() => setHoveredSkill(skill.id)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-secondary-100/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {skill.name}
                          </h3>
                          <p className="text-sm text-secondary-500">
                            {skill.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500">
                        {skill.proficiency * 20}%
                      </span>
                    </div>

                    <div className="relative">
                      <div className="h-2 w-full bg-secondary-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.proficiency * 20}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                        />
                      </div>
                    </div>

                    {/* Hover Card with Related Projects */}
                    {hoveredSkill === skill.id && skill.relatedProjects && skill.relatedProjects.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl p-4 z-10 border border-secondary-100/50 backdrop-blur-sm"
                      >
                        <h4 className="text-sm font-semibold mb-3 text-secondary-900">
                          Projects using {skill.name}:
                        </h4>
                        <ul className="space-y-2">
                          {skill.relatedProjects.map(project => (
                            <li 
                              key={project.id} 
                              className="flex items-center justify-between bg-secondary-50 rounded-lg p-2"
                            >
                              <span className="text-sm text-secondary-700">{project.title}</span>
                              {project.live_url && (
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}