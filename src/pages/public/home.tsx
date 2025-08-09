import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Github, ExternalLink, Mail, Linkedin, Send, Code, Zap, Palette, Target, Download } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { Card3D, TechCard, GlassCard } from '../../components/ui/3d-card';
import { TiltCard } from '../../components/ui/3d-tilt-card';
import { WordByWordText } from '../../components/ui/word-by-word-text';
import { 
  scrollAnimationVariants, 
  staggerContainerVariants, 
  fadeInUpVariants, 
  slideInLeftVariants, 
  slideInRightVariants,
  scaleInVariants,
  skillCardVariants,
  projectCardVariants
} from '../../lib/utils';
import type { Database } from '../../types/database.types';
import { Background3D } from '../../components/3d-background';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bioIndex, setBioIndex] = useState(0);
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [stats, setStats] = useState({
    projectCount: 0,
    experienceYears: 0,
    skillCount: 0,
    certificateCount: 0,
    skillCategories: {} as Record<string, number>
  });
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  
  const defaultBios = [
    "A passionate full-stack developer crafting beautiful and functional web experiences",
    "Turning innovative ideas into elegant digital solutions",
    "Building the future of web applications, one line of code at a time",
    "Creating seamless user experiences through modern web technologies",
    "Transforming complex problems into simple, beautiful solutions"
  ];

  const bios = profile?.bio ? [profile.bio] : defaultBios;

  const roles = [
    { title: "Full Stack Developer", icon: Code, color: "from-primary-500 to-accent-600" },
    { title: "AI Enthusiast", icon: Zap, color: "from-accent-500 to-primary-700" },
    { title: "UI/UX Designer", icon: Palette, color: "from-primary-400 to-accent-500" },
    { title: "Problem Solver", icon: Target, color: "from-accent-600 to-primary-800" }
  ];
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (profileError) throw profileError;
        if (profileData && profileData.length > 0) {
          setProfile(profileData[0]);
        }

        // Fetch featured projects and experiences
        const [featuredProjectsResult, experiencesListResult] = await Promise.all([
          supabase.from('projects').select('*').eq('featured', true).order('created_at', { ascending: false }).limit(3),
          supabase.from('experiences').select('*').order('start_date', { ascending: false }).limit(3)
        ]);

        setFeaturedProjects(featuredProjectsResult.data || []);
        setExperiences(experiencesListResult.data || []);

        // Fetch real statistics
        const [projectsResult, skillsResult, certificatesResult, experiencesResult] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact' }),
          supabase.from('skills').select('id, category', { count: 'exact' }),
          supabase.from('certificates').select('id', { count: 'exact' }),
          supabase.from('experiences').select('start_date, end_date, current')
        ]);

        // Calculate experience years
        let totalExperienceYears = 0;
        if (experiencesResult.data) {
          experiencesResult.data.forEach(exp => {
            const startDate = new Date(exp.start_date);
            const endDate = exp.current ? new Date() : new Date(exp.end_date || '');
            const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            totalExperienceYears += Math.max(0, years);
          });
        }

        // Calculate skill categories
        const skillCategories = skillsResult.data?.reduce((acc, skill) => {
          acc[skill.category] = (acc[skill.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        setStats({
          projectCount: projectsResult.count || 0,
          experienceYears: Math.round(totalExperienceYears * 10) / 10, // Round to 1 decimal
          skillCount: skillsResult.count || 0,
          certificateCount: certificatesResult.count || 0,
          skillCategories
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBioIndex((current) => (current + 1) % bios.length);
    }, 5000); // Change bio every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contacts').insert([
        {
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          read: false,
        },
      ]);

      if (error) throw error;

      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  const handleHeroAnimationComplete = () => {
    setHeroAnimationComplete(true);
  };

  const socialIconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    hover: {
      scale: 1.2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-secondary-100 dark:bg-gradient-to-br dark:from-[#0f1b27] dark:via-[#1a2a3a] dark:to-[#0f1b27]">
      {/* Animated 3D Background */}
      <Background3D variant="minimal" enabled={true} />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-white via-primary-50 to-secondary-100 dark:bg-gradient-to-br dark:from-[#0f1b27] dark:via-[#1a2a3a] dark:to-[#0f1b27]">
        <div className="responsive-container relative z-10">
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]"
          >
            {/* Expanded Content Container for Full Name */}
            <div className="flex flex-col items-center justify-center text-center w-full max-w-none">
              {/* Staggered Hero Animations */}
              {/* Enhanced Hero Text with Floating Animation */}
              <div className="text-center space-y-4 mb-6">
                {/* Greeting */}
                <motion.h1
                  variants={fadeInUpVariants}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                >
                  <span className="bg-gradient-to-r from-[#a65e46] via-[#d9aa90] to-[#f1d2b6] bg-clip-text text-transparent dark:bg-none dark:text-[#d9d9d9] dark:bg-clip-border">
                    Hello, I'm
                  </span>
                </motion.h1>

                {/* Floating Name */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  onAnimationComplete={() => setHeroAnimationComplete(true)}
                  className="relative min-h-[120px] flex items-center justify-center"
                >
                  <motion.h2
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight bg-gradient-to-r from-[#a65e46] via-[#d9aa90] to-[#f1d2b6] bg-clip-text text-transparent dark:bg-none dark:text-[#d9d9d9] dark:bg-clip-border drop-shadow-lg whitespace-nowrap"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                      willChange: 'transform'
                    }}
                  >
                    Gaurav Naik
                  </motion.h2>
                  
                  {/* Floating glow effect */}
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-[#a65e46]/20 via-[#d9aa90]/20 to-[#f1d2b6]/20 blur-xl -z-10 rounded-lg"
                  />
                </motion.div>
              </div>

              {/* Animated tagline with staggered fade-in */}
              <AnimatePresence>
                {heroAnimationComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl sm:text-2xl md:text-3xl text-secondary-600 dark:text-[#d9d9d9] mb-8 max-w-4xl mx-auto"
                  >
                    {bios[bioIndex]}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Tags Row */}
              <AnimatePresence>
                {heroAnimationComplete && (
                  <motion.div 
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap justify-center gap-4 mb-8"
                  >
                    {roles.map((role, i) => (
                      <motion.div
                        key={role.title}
                        variants={scaleInVariants}
                        whileHover={{
                          boxShadow: '0 0 16px 4px #60a5fa',
                          y: -5,
                          scale: 1.08,
                        }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${role.color} text-white font-semibold shadow-md cursor-pointer transition-all`}
                      >
                        <motion.span
                          className="mr-2"
                          whileHover={{ rotate: [0, 15, -15, 0], scale: 1.2 }}
                          transition={{ repeat: Infinity, duration: 0.7, repeatType: 'loop' }}
                        >
                          <role.icon size={20} />
                        </motion.span>
                        {role.title}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Buttons */}
              <AnimatePresence>
                {heroAnimationComplete && (
                  <motion.div 
                    variants={fadeInUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                  >
                    <Button 
                      variant="tech" 
                      size="lg" 
                      onClick={handleProjectsClick}
                      className="group"
                    >
                      View My Work
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                    <Button 
                      variant="gradient" 
                      size="lg"
                      className="group"
                      onClick={() => window.open('/resume.pdf', '_blank')}
                    >
                      <Download size={20} className="mr-2 group-hover:animate-bounce" />
                      Download Resume
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={handleContactClick}
                      className="group"
                    >
                      Get In Touch
                      <Mail className="ml-2 group-hover:scale-110 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social Links */}
              <AnimatePresence>
                {heroAnimationComplete && (
                  <motion.div 
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-center space-x-4"
                  >
                    {[
                      { icon: Github, href: profile?.github_url || '#', label: 'GitHub' },
                      { icon: Linkedin, href: profile?.linkedin_url || '#', label: 'LinkedIn' },
                      { icon: Mail, href: `mailto:${profile?.email || 'your@email.com'}`, label: 'Email' },
                    ].map((social, index) => (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-secondary-600 hover:text-[#a65e46] hover:bg-[#a65e46]/10 hover:border-[#a65e46]/30 transition-all duration-300 group dark:bg-[#0f1b27] dark:text-[#d9d9d9] dark:border-[#bfafaf] dark:hover:bg-[#bfafaf] dark:hover:text-[#0f1b27]"
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Photo with hover glow and scale */}
            <motion.div 
              className="hidden lg:flex items-center justify-center -mt-8"
              variants={slideInRightVariants}
              style={{ opacity }}
            >
              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md"
                whileHover={{ scale: 1.05, boxShadow: '0 0 32px 8px #60a5fa' }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ border: '4px solid transparent' }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="w-full h-[500px] object-cover object-center transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-secondary-100 flex items-center justify-center">
                    <p className="text-secondary-400 text-lg">Add your photo in profile settings</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 lg:py-24">
        <div className="responsive-container">
          <SectionHeader 
            title="About Me" 
            subtitle="Get to know me better and understand my passion for technology and innovation"
            variant="tech"
            centered
          />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={slideInLeftVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <TiltCard
                maxTilt={8}
                scale={1.01}
                speed={300}
                glare={true}
                glareColor="rgba(255, 255, 255, 0.15)"
                glarePosition="top"
                className="h-full"
              >
                <TechCard className="h-full">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent text-center">
                      {profile?.title || 'Passionate Developer & Innovator'}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed text-center">
                      {profile?.bio || "I'm a dedicated full-stack developer with a passion for creating innovative digital solutions. With expertise in modern web technologies, I specialize in building scalable applications that deliver exceptional user experiences."}
                    </p>
                    <motion.div 
                      variants={staggerContainerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="grid grid-cols-3 gap-4"
                    >
                      <motion.div 
                        variants={scaleInVariants}
                        className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20"
                      >
                        <div className="text-2xl font-bold text-cyan-600">
                          {loading ? '...' : `${stats.experienceYears}+`}
                        </div>
                        <div className="text-sm text-secondary-600">Years Experience</div>
                      </motion.div>
                      <motion.div 
                        variants={scaleInVariants}
                        className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20"
                      >
                        <div className="text-2xl font-bold text-purple-600">
                          {loading ? '...' : `${stats.projectCount}+`}
                        </div>
                        <div className="text-sm text-secondary-600">Projects Completed</div>
                      </motion.div>
                      <motion.div 
                        variants={scaleInVariants}
                        className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20"
                      >
                        <div className="text-2xl font-bold text-green-600">
                          {loading ? '...' : `${stats.skillCount}+`}
                        </div>
                        <div className="text-sm text-secondary-600">Skills Mastered</div>
                      </motion.div>
                    </motion.div>
                  </div>
                </TechCard>
              </TiltCard>
            </motion.div>

            <motion.div
              variants={slideInRightVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6"
            >
              <TiltCard
                maxTilt={6}
                scale={1.01}
                speed={250}
                glare={true}
                glareColor="rgba(255, 255, 255, 0.1)"
                glarePosition="top"
              >
                <GlassCard>
                  <h4 className="text-xl font-semibold mb-4 text-cyan-600">Technical Skills</h4>
                  <motion.div 
                    variants={staggerContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-3"
                  >
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 4 }).map((_, index) => (
                        <motion.div
                          key={index}
                          variants={fadeInUpVariants}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                        >
                          <div className="h-4 bg-secondary-200/50 rounded w-24 animate-pulse"></div>
                          <div className="w-20 h-2 bg-secondary-200 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary-200/50 rounded-full animate-pulse"></div>
                          </div>
                        </motion.div>
                      ))
                    ) : Object.keys(stats.skillCategories).length > 0 ? (
                      // Real skill categories with counts
                      Object.entries(stats.skillCategories).slice(0, 4).map(([category, count], index) => (
                        <motion.div
                          key={category}
                          variants={fadeInUpVariants}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                        >
                          <span className="text-secondary-700 dark:text-secondary-300">{category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-secondary-500">{count} skills</span>
                            <div className="w-20 h-2 bg-secondary-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.min(90, 60 + count * 5)}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                                viewport={{ once: true }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      // Fallback when no skills are available
                      ['Frontend Development', 'Backend Development', 'Database Design', 'DevOps & Cloud'].map((skill, index) => (
                        <motion.div
                          key={skill}
                          variants={fadeInUpVariants}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                        >
                          <span className="text-secondary-700 dark:text-secondary-300">{skill}</span>
                          <div className="w-20 h-2 bg-secondary-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${85 + Math.random() * 15}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              viewport={{ once: true }}
                            />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </GlassCard>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-secondary-50/50 dark:bg-secondary-900/50">
        <div className="responsive-container">
          <SectionHeader 
            title="Featured Projects" 
            subtitle="Explore some of my latest work and creative solutions"
            variant="tech"
            centered
          />

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={projectCardVariants}
                  className="group"
                >
                  <TiltCard
                    maxTilt={8}
                    scale={1.02}
                    speed={300}
                    glare={true}
                    glareColor="rgba(255, 255, 255, 0.1)"
                    glarePosition="top"
                    className="h-full"
                  >
                    <Card3D className="h-full overflow-hidden">
                      {/* Project Image */}
                      {project.image_url && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          
                          {/* Project Links */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {project.live_url && (
                              <a
                                href={project.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Project Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-secondary-600 dark:text-secondary-400 line-clamp-3">
                            {project.short_description || project.description}
                          </p>
                        </div>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.slice(0, 3).map((tech: string) => (
                              <span
                                key={tech}
                                className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm rounded-full font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-sm rounded-full">
                                +{project.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* View Project Link */}
                        <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                          <Link
                            to={`/projects/${project.id}`}
                            className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-medium"
                          >
                            View Project Details
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </Card3D>
                  </TiltCard>
                </motion.div>
              ))
            ) : (
              // Placeholder cards for when no projects are featured
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={projectCardVariants}
                  className="h-80 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl animate-pulse"
                />
              ))
            )}
          </motion.div>

          {/* View All Projects Button */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/projects')}
              className="group"
            >
              View All Projects
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="responsive-container">
          <SectionHeader 
            title="Professional Experience" 
            subtitle="My journey in building exceptional digital experiences"
            variant="gradient"
            centered
          />

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            {experiences.length > 0 ? (
              experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  variants={fadeInUpVariants}
                  className="group"
                >
                  <TiltCard
                    maxTilt={3}
                    scale={1.01}
                    speed={400}
                    className="w-full"
                  >
                    <TechCard className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Company Logo/Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {experience.company.charAt(0)}
                            </span>
                          </div>
                        </div>

                        {/* Experience Details */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {experience.position}
                              </h3>
                              <p className="text-lg text-cyan-600 dark:text-cyan-400 font-medium">
                                {experience.company}
                              </p>
                            </div>
                            <div className="text-sm text-secondary-600 dark:text-secondary-400">
                              {new Date(experience.start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })} - {experience.current ? 'Present' : new Date(experience.end_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-secondary-600 dark:text-secondary-400 line-clamp-3">
                            {experience.description}
                          </p>

                          {/* Key Achievements */}
                          {experience.key_achievements && experience.key_achievements.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                Key Achievements:
                              </h4>
                              <ul className="space-y-1">
                                {experience.key_achievements.slice(0, 2).map((achievement: string, achIndex: number) => (
                                  <li key={achIndex} className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                    <span className="w-1 h-1 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></span>
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Technologies */}
                          {experience.technologies && experience.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {experience.technologies.slice(0, 5).map((tech: string) => (
                                <span
                                  key={tech}
                                  className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-sm rounded-full font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                              {experience.technologies.length > 5 && (
                                <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-sm rounded-full">
                                  +{experience.technologies.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TechCard>
                  </TiltCard>
                </motion.div>
              ))
            ) : (
              // Placeholder for when no experiences are available
              Array.from({ length: 2 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUpVariants}
                  className="h-40 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl animate-pulse"
                />
              ))
            )}
          </motion.div>

          {/* View All Experience Button */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/experience')}
              className="group"
            >
              View Full Experience
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 lg:py-24">
        <div className="responsive-container">
          <SectionHeader 
            title="Get In Touch" 
            subtitle="Ready to start a project or just want to chat? I'd love to hear from you!"
            variant="gradient"
            centered
          />
          
          <motion.div 
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-2xl mx-auto"
          >
            <TiltCard
              maxTilt={5}
              scale={1.01}
              speed={200}
              glare={true}
              glareColor="rgba(255, 255, 255, 0.1)"
              glarePosition="top"
            >
              <Card3D variant="neon" className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Name
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="input w-full"
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Email
                      </label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className="input w-full"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Subject
                    </label>
                    <input
                      {...register('subject', { required: 'Subject is required' })}
                      className="input w-full"
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Message
                    </label>
                    <textarea
                      {...register('message', { required: 'Message is required' })}
                      rows={5}
                      className="input w-full resize-none"
                      placeholder="Tell me about your project..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="tech" 
                    size="lg" 
                    loading={isSubmitting}
                    className="w-full group"
                  >
                    <Send className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Send Message
                  </Button>
                </form>
              </Card3D>
            </TiltCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}