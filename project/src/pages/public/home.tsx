import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Github, Mail, Linkedin, Send } from 'lucide-react';
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
  const [, setLoading] = useState(true);
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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-primary-50 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary-200/30 rounded-full mix-blend-multiply filter blur-3xl"
            variants={backgroundBlobVariants}
            animate="animate"
            style={{ x: parallaxY }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-200/30 rounded-full mix-blend-multiply filter blur-3xl"
            variants={backgroundBlobVariants}
            animate="animate"
            style={{ 
              x: useTransform(scrollYProgress, [0, 1], ['0%', '-50%']),
              y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']),
            }}
          />
        </motion.div>
        
        <div className="container relative z-10">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-8">
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-secondary-200 shadow-sm"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm font-medium text-secondary-600">Available for freelance work</span>
                <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                variants={itemVariants}
              >
                <span className="text-secondary-900">Hi, I'm </span>
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 animate-gradient bg-[length:200%_auto]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {profile?.name || 'Your Name'}
                </motion.span>
              </motion.h1>
              
              <div className="h-[60px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={bioIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl md:text-2xl text-secondary-600 max-w-xl"
                  >
                    {bios[bioIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleContactClick}
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600"
                  >
                    Let's Talk
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleProjectsClick}
                    variant="outline"
                    size="lg"
                    className="group"
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
                className="flex items-center space-x-6"
                variants={itemVariants}
              >
                {profile?.github_url && (
                  <motion.a 
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="GitHub"
                    variants={socialIconVariants}
                    whileHover="hover"
                  >
                    <Github size={24} />
                  </motion.a>
                )}
                {profile?.linkedin_url && (
                  <motion.a 
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="LinkedIn"
                    variants={socialIconVariants}
                    whileHover="hover"
                  >
                    <Linkedin size={24} />
                  </motion.a>
                )}
                {profile?.email && (
                  <motion.a 
                    href={`mailto:${profile.email}`}
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="Email"
                    variants={socialIconVariants}
                    whileHover="hover"
                  >
                    <Mail size={24} />
                  </motion.a>
                )}
              </motion.div>
            </div>
            
            <motion.div 
              className="relative hidden lg:block"
              variants={itemVariants}
              style={{ opacity }}
            >
              {/* Floating Holographic Animated Ring */}
              <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <div
                  className="w-[360px] h-[360px] md:w-[420px] md:h-[420px] rounded-[2.5rem] border-4 animate-spin-slow"
                  style={{
                    borderImage: "conic-gradient(from 180deg at 50% 50%, #f1d2b6, #d9aa90, #a65e46, #f1d2b6) 1",
                    borderStyle: "solid",
                    borderWidth: "4px",
                    filter: "blur(2px) opacity(0.7)",
                  }}
                />
              </div>
              {/* Glassmorphism Photo Container with Hover Effect */}
              <motion.div
                className="relative z-10 flex items-center justify-center rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto"
                whileHover={{ y: -12, rotate: -4, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(241,210,182,0.25)",
                  boxShadow: "0 8px 32px 0 rgba(166,94,70,0.15)",
                  padding: "1.5rem",
                }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-[260px] h-[320px] md:w-[320px] md:h-[400px] object-cover object-center rounded-2xl transition-all duration-300"
                    style={{ aspectRatio: "4/5" }}
                  />
                ) : (
                  <div className="w-[260px] h-[320px] md:w-[320px] md:h-[400px] bg-secondary-100 flex items-center justify-center rounded-2xl">
                    <p className="text-secondary-400 text-lg">Add your photo in profile settings</p>
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
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
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
              <div className="bg-secondary-50 rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-start"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Mail className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">Email</h4>
                      <p className="text-secondary-600">{profile?.email || 'contact@example.com'}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Github className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">GitHub</h4>
                      <a
                        ref={profile?.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-600 hover:text-primary-600 transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Linkedin className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">LinkedIn</h4>
                      <a
                        ref={profile?.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-600 hover:text-primary-600 transition-colors"
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
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
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
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
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
                  <label htmlFor="subject" className="block text-sm font-medium text-secondary-700">
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
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700">
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