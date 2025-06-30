import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Github, ExternalLink, Mail, Linkedin, Send } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

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
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  
  const bios = [
    "A passionate full-stack developer crafting beautiful and functional web experiences",
    "Turning innovative ideas into elegant digital solutions",
    "Building the future of web applications, one line of code at a time",
    "Creating seamless user experiences through modern web technologies",
    "Transforming complex problems into simple, beautiful solutions"
  ];

  const roles = [
    "Full Stack Developer",
    "AI Enthusiast", 
    "UI/UX Designer",
    "Problem Solver"
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
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setProfile(data[0]);
        }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
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

  const backgroundBlobVariants = {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 90, 180, 270, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden py-8 sm:py-12 lg:py-16">
        {/* Animated background blobs */}
        <motion.div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(to bottom right, #f8fafc, #f0f7f8)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-primary-200/30 dark:bg-primary-800/20 rounded-full mix-blend-multiply filter blur-3xl"
            variants={backgroundBlobVariants}
            animate="animate"
            style={{ x: parallaxY }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-primary-300/30 dark:bg-primary-700/20 rounded-full mix-blend-multiply filter blur-3xl"
            variants={backgroundBlobVariants}
            animate="animate"
            style={{ 
              x: useTransform(scrollYProgress, [0, 1], ['0%', '-50%']),
              y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']),
            }}
          />
        </motion.div>
        
        {/* Dark mode background overlay */}
        <div className="absolute inset-0 dark:block hidden" style={{
          background: 'linear-gradient(to bottom right, #041421, #042630)',
          opacity: 0.5
        }} />
        
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 relative z-10">
          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left side: Text content */}
            <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8 max-w-full lg:max-w-none">
              <motion.div
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-full border border-secondary-200 dark:border-dark-700 shadow-sm"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">Available for freelance work</span>
                <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                variants={itemVariants}
              >
                <span className="text-secondary-900 dark:text-white">Hi, I'm </span>
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 animate-gradient bg-[length:200%_auto]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {profile?.full_name || 'Your Name'}
                </motion.span>
              </motion.h1>

              {/* Role/Subtitle */}
              <motion.div
                className="flex flex-wrap gap-2 items-center justify-center lg:justify-start"
                variants={itemVariants}
              >
                {roles.map((role, index) => (
                  <motion.span
                    key={role}
                    className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm md:text-base font-medium text-secondary-600 dark:text-secondary-300 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-full border border-secondary-200 dark:border-dark-700"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    {role}
                    {index < roles.length - 1 && (
                      <span className="ml-2 text-secondary-400 dark:text-secondary-500">•</span>
                    )}
                  </motion.span>
                ))}
              </motion.div>
              
              <div className="h-[60px] sm:h-[80px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={bioIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-base sm:text-lg md:text-xl text-secondary-600 dark:text-secondary-300 max-w-xl mx-auto lg:mx-0 font-light"
                  >
                    {bios[bioIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    onClick={handleContactClick}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-300 focus:ring-4 focus:ring-primary-300"
                  >
                    Let's Talk
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    onClick={handleProjectsClick}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto group transition-all duration-300 focus:ring-4 focus:ring-secondary-300"
                    rightIcon={
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight size={16} />
                      </motion.span>
                    }
                  >
                    View Projects
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6"
                variants={itemVariants}
              >
                {profile?.github_url && (
                  <motion.a 
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-dark-800"
                    aria-label="GitHub Profile"
                    variants={socialIconVariants}
                    whileHover="hover"
                  >
                    <Github size={20} className="sm:w-6 sm:h-6" />
                  </motion.a>
                )}
                {profile?.linkedin_url && (
                  <motion.a 
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-dark-800"
                    aria-label="LinkedIn Profile"
                    variants={socialIconVariants}
                    whileHover="hover"
                  >
                    <Linkedin size={20} className="sm:w-6 sm:h-6" />
                  </motion.a>
                )}
                {profile?.email && (
                  <motion.a 
                    href={`mailto:${profile.email}`}
                    className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-dark-800"
                    aria-label="Send Email"
                    variants={socialIconVariants}
                    whileHover="hover"
                  >
                    <Mail size={20} className="sm:w-6 sm:h-6" />
                  </motion.a>
                )}
              </motion.div>
            </div>
            
            {/* Right side: Image */}
            <motion.div 
              className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-none lg:flex lg:justify-end"
              variants={itemVariants}
              style={{ opacity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl transform rotate-6 blur opacity-20"
                animate={{
                  rotate: [6, -6, 6],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div 
                className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs mx-auto lg:max-w-sm xl:max-w-md aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.full_name} - Professional headshot`}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary-100 dark:bg-dark-700 flex items-center justify-center">
                    <p className="text-secondary-400 dark:text-secondary-500 text-sm sm:text-base lg:text-lg px-4 text-center">Add your photo in profile settings</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        className="py-16 sm:py-20 bg-white dark:bg-dark-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
          <SectionHeader
            title="Get in Touch"
            subtitle="Have a question or want to work together? I'd love to hear from you."
            centered
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-secondary-50 dark:bg-dark-800 rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-start"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h4 className="text-base sm:text-lg font-medium">Email</h4>
                      <p className="text-secondary-600 dark:text-secondary-300 text-sm sm:text-base">{profile?.email || 'contact@example.com'}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Github className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h4 className="text-base sm:text-lg font-medium">GitHub</h4>
                      <a
                        href={profile?.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="ml-4">
                      <h4 className="text-base sm:text-lg font-medium">LinkedIn</h4>
                      <a
                        href={profile?.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors"
                      >
                        Connect with me
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 input"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 input"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="subject" className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="mt-1 input"
                    {...register('subject', { required: 'Subject is required' })}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="message" className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 input"
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    leftIcon={<Send size={16} />}
                    fullWidth
                  >
                    Send Message
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </>
  );
}