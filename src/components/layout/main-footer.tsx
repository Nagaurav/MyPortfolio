import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export function MainFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary-900 text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black tracking-tighter text-primary-400 hover:text-primary-300 transition-colors">GN</span>
            </Link>
            <p className="text-secondary-300 mb-4">
              Showcasing my work, skills, and professional journey.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="mailto:your.email@example.com" 
                className="text-secondary-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-secondary-300 hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/skills" className="text-secondary-300 hover:text-white transition-colors">
                  Skills
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="text-secondary-300 hover:text-white transition-colors">
                  Certificates
                </Link>
              </li>
              <li>
                <Link to="/resume" className="text-secondary-300 hover:text-white transition-colors">
                  Resume
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1 lg:col-span-2">
            <h4 className="text-lg font-medium mb-4">Get in Touch</h4>
            <p className="text-secondary-300 mb-4">
              Interested in working together or have a question? Feel free to reach out!
            </p>
            <Link to="/contact" className="inline-flex items-center text-primary-400 hover:text-primary-300">
              Contact me <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary-800 flex flex-col md:flex-row md:justify-between items-center">
          <p className="text-secondary-400 text-sm">
            © {currentYear} GN. All rights reserved.
          </p>
          <p className="text-secondary-400 text-sm mt-2 md:mt-0">
            Made with <Heart size={14} className="inline text-primary-500" /> using React & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}