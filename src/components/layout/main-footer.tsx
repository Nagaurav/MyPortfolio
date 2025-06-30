import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Heart, ExternalLink } from 'lucide-react';
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
      color: 'hover:text-white hover:bg-gray-800'
    },
    {
      name: 'LinkedIn',
      url: profile?.linkedin_url || 'https://linkedin.com',
      icon: Linkedin,
      color: 'hover:text-white hover:bg-blue-600'
    },
    {
      name: 'Email',
      url: `mailto:${profile?.email || 'contact@example.com'}`,
      icon: Mail,
      color: 'hover:text-white hover:bg-red-500'
    }
  ];
  
  return (
    <footer className="bg-dark-900 dark:bg-dark-950 text-white py-12 sm:py-16">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand and Bio */}
          <div className="md:col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block mb-4 group">
              <motion.span 
                className="text-xl sm:text-2xl font-black tracking-tighter text-primary-400 group-hover:text-primary-300 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                GN
              </motion.span>
            </Link>
            <p className="text-secondary-300 mb-6 leading-relaxed text-sm sm:text-base">
              {profile?.bio || 'Showcasing my work, skills, and professional journey in web development and digital solutions.'}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a 
                    key={social.name}
                    href={social.url}
                    target={social.name === 'Email' ? undefined : '_blank'}
                    rel={social.name === 'Email' ? undefined : 'noopener noreferrer'}
                    className={`p-2 rounded-full text-secondary-400 transition-all duration-300 ${social.color} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    style={{ '--tw-ring-offset-color': '#041421' } as React.CSSProperties}
                    aria-label={`Visit ${social.name} profile`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={`Visit ${social.name}`}
                  >
                    <Icon size={18} className="sm:w-5 sm:h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="md:col-span-1 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/projects', label: 'Projects' },
                { to: '/skills', label: 'Skills' },
                { to: '/experience', label: 'Experience' },
                { to: '/certificates', label: 'Certificates' },
                { to: '/resume', label: 'Resume' },
                { to: '/contact', label: 'Contact' },
              ].map((item) => (
                <li key={item.to}>
                  <Link 
                    to={item.to} 
                    className="text-secondary-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block text-sm sm:text-base"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Get in Touch */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-base sm:text-lg font-semibold mb-4 text-white">Get in Touch</h4>
            <p className="text-secondary-300 mb-6 leading-relaxed text-sm sm:text-base">
              {profile?.contact_message || 'Interested in working together or have a question? Feel free to reach out! I\'m always open to discussing new opportunities and collaborations.'}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/contact" 
                className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-300 group text-sm sm:text-base"
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
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-secondary-400 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} {profile?.full_name || 'GN'}. All rights reserved.
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
        </div>
      </div>
    </footer>
  );
}