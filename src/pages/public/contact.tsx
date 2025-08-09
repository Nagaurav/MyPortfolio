import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, Copy, Github, Linkedin, MessageSquare, User, AtSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card3D, TechCard, GlassCard } from '../../components/ui/3d-card';
import { generateCSRFToken, storeCSRFToken, getStoredCSRFToken } from '../../lib/csrf';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  useEffect(() => {
    if (!getStoredCSRFToken()) {
      const token = generateCSRFToken();
      storeCSRFToken(token);
    }

    // Fetch profile data
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const csrfToken = getStoredCSRFToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmail = async () => {
    if (!profile?.email) return;
    
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      toast.error('Failed to copy email');
    }
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
              <span className="text-secondary-900">Let's </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-600 animate-gradient bg-[length:200%_auto]">
                Connect
              </span>
            </h1>
            <p className="text-xl text-secondary-600">
              Have a question or want to work together? I'd love to hear from you
            </p>
          </motion.div>
        </div>
      </section>

      <div className="responsive-container pb-20">
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card3D variant="tech" className="p-8 h-full">
                             <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary-500 to-accent-600 bg-clip-text text-transparent">
                 Contact Information
               </h2>
              <div className="space-y-6">
                {profile?.email && (
                                     <motion.div 
                     className="flex items-start p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                     whileHover={{ scale: 1.02, backgroundColor: 'rgba(241, 210, 182, 0.1)' }}
                     transition={{ type: "spring", stiffness: 300 }}
                   >
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 flex items-center justify-center shadow-lg">
                       <Mail className="w-6 h-6 text-white" />
                     </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-secondary-900">Email</h3>
                      <div className="flex items-center mt-1">
                        <p className="text-secondary-600">{profile.email}</p>
                                                 <motion.button
                           onClick={copyEmail}
                           className="ml-2 text-secondary-400 hover:text-primary-500 transition-colors p-1 rounded-lg hover:bg-primary-500/10"
                           aria-label="Copy email"
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                         >
                          <Copy size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {profile?.phone && (
                                     <motion.div 
                     className="flex items-start p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                     whileHover={{ scale: 1.02, backgroundColor: 'rgba(241, 210, 182, 0.1)' }}
                     transition={{ type: "spring", stiffness: 300 }}
                   >
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-accent-500 to-primary-700 flex items-center justify-center shadow-lg">
                       <Phone className="w-6 h-6 text-white" />
                     </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-secondary-900">Phone</h3>
                                             <a
                         href={`tel:${profile.phone}`}
                         className="text-secondary-600 hover:text-primary-500 transition-colors"
                       >
                        {profile.phone}
                      </a>
                    </div>
                  </motion.div>
                )}

                {profile?.location && (
                                     <motion.div 
                     className="flex items-start p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                     whileHover={{ scale: 1.02, backgroundColor: 'rgba(241, 210, 182, 0.1)' }}
                     transition={{ type: "spring", stiffness: 300 }}
                   >
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-400 to-accent-500 flex items-center justify-center shadow-lg">
                       <MapPin className="w-6 h-6 text-white" />
                     </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-secondary-900">Location</h3>
                      <p className="text-secondary-600">{profile.location}</p>
                    </div>
                  </motion.div>
                )}

                <div className="pt-6 border-t border-white/20">
                  <h3 className="text-lg font-medium mb-4 text-secondary-900">Connect with me</h3>
                  <div className="flex space-x-4">
                    {profile?.github_url && (
                      <motion.a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Github size={20} />
                      </motion.a>
                    )}
                    {profile?.linkedin_url && (
                      <motion.a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Linkedin size={20} />
                      </motion.a>
                    )}
                  </div>
                </div>
              </div>
            </Card3D>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card3D variant="glass" className="p-8">
                             <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary-500 to-accent-600 bg-clip-text text-transparent">
                 Send Message
               </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                                         className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400"
                     placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <AtSign className="w-4 h-4 inline mr-2" />
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
                                         className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400"
                     placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Subject
                  </label>
                  <input
                    {...register('subject', { required: 'Subject is required' })}
                    type="text"
                                         className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400"
                     placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Message
                  </label>
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    rows={5}
                                         className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400 resize-none"
                     placeholder="Tell me about your project or question..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                                 <motion.button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-gradient-to-r from-primary-500 to-accent-600 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                 >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </div>
                  )}
                </motion.button>
              </form>
            </Card3D>
          </motion.div>
        </div>
      </div>
    </>
  );
}