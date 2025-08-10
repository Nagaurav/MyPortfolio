import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function MainFooter() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const currentYear = new Date().getFullYear();
  
  useEffect(() => {
    async function fetchProfile() {
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
        console.error('Error fetching profile:', error);
      }
    }
    
    fetchProfile();
  }, []);

  const socialLinks = [
    {
      name: 'GitHub',
      url: profile?.github_url || 'https://github.com',
      icon: Github,
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      name: 'LinkedIn',
      url: profile?.linkedin_url || 'https://linkedin.com',
      icon: Linkedin,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      name: 'Email',
      url: `mailto:${profile?.email || 'contact@example.com'}`,
      icon: Mail,
      gradient: 'from-red-500 to-red-600'
    }
  ];
  
  return (
    <footer className="relative bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 text-white py-12 sm:py-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid bg-[size:30px_30px] opacity-[0.1]"></div>
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-accent-600/10 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-500/10 to-primary-700/10 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand and Bio */}
          <div className="md:col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block mb-4 group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:to-accent-300 transition-all duration-300">
                  GN
                </span>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </Link>
            <p className="text-secondary-300 mb-6 leading-relaxed text-sm sm:text-base">
              {profile?.bio || 'Showcasing my work, skills, and professional journey in web development and digital solutions.'}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a 
                    key={social.name}
                    href={social.url}
                    target={social.name === 'Email' ? undefined : '_blank'}
                    rel={social.name === 'Email' ? undefined : 'noopener noreferrer'}
                    className={`p-3 rounded-xl bg-gradient-to-r ${social.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-dark-900`}
                    aria-label={`Visit ${social.name} profile`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={`Visit ${social.name}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon size={18} className="sm:w-5 sm:h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="md:col-span-1 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-4 text-white flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary-400" />
              Navigation
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/projects', label: 'Projects' },
                { to: '/skills', label: 'Skills' },
                { to: '/experience', label: 'Experience' },
                { to: '/certificates', label: 'Certificates' },
                { to: '/resume', label: 'Resume' },
                { to: '/contact', label: 'Contact' },
              ].map((item, index) => (
                <motion.li 
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={item.to} 
                    className="text-secondary-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 inline-block text-sm sm:text-base group"
                  >
                    <span className="relative">
                      {item.label}
                                             <motion.span
                         className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400 group-hover:w-full transition-all duration-300"
                         whileHover={{ width: '100%' }}
                       />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Get in Touch */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-base sm:text-lg font-semibold mb-4 text-white flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary-400" />
              Get in Touch
            </h4>
            <p className="text-secondary-300 mb-6 leading-relaxed text-sm sm:text-base">
              {profile?.contact_message || 'Interested in working together or have a question? Feel free to reach out! I\'m always open to discussing new opportunities and collaborations.'}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/contact" 
                className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group text-sm sm:text-base font-medium"
              >
                Contact me 
                <motion.span 
                  className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Copyright */}
        <motion.div 
          className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-secondary-400 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} {profile?.name || 'GN'}. All rights reserved.
          </p>
          <p className="text-secondary-400 text-xs sm:text-sm flex items-center justify-center sm:justify-end">
            Made with 
            <motion.span
              className="mx-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart size={12} className="sm:w-3.5 sm:h-3.5 text-primary-500" />
            </motion.span> 
            using React & Tailwind CSS
          </p>
        </motion.div>
      </div>
    </footer>
  );
}