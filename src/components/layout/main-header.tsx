import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
<<<<<<< HEAD
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
=======
import { Menu, X, Github, Linkedin } from 'lucide-react';
>>>>>>> 183ebc5 (Initial commit)

export function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
<<<<<<< HEAD
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
=======
>>>>>>> 183ebc5 (Initial commit)
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
<<<<<<< HEAD

  useEffect(() => {
    async function fetchProfileEmail() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .single();

        if (error) throw error;
        if (data?.email) {
          setProfileEmail(data.email);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfileEmail();
  }, []);
=======
>>>>>>> 183ebc5 (Initial commit)
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `px-3 py-2 text-sm font-medium transition-colors rounded-md ${
      isActive 
        ? 'text-primary-600' 
        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
    }`;
<<<<<<< HEAD

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#contact';
    }
  };
=======
>>>>>>> 183ebc5 (Initial commit)
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent hover:from-primary-700 hover:to-accent-600 transition-all">GN</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden space-x-1 md:flex">
          <NavLink to="/" end className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/projects" className={navLinkClasses}>
            Projects
          </NavLink>
          <NavLink to="/skills" className={navLinkClasses}>
            Skills
          </NavLink>
<<<<<<< HEAD
=======
          <NavLink to="/experience" className={navLinkClasses}>
            Experience
          </NavLink>
>>>>>>> 183ebc5 (Initial commit)
          <NavLink to="/certificates" className={navLinkClasses}>
            Certificates
          </NavLink>
          <NavLink to="/resume" className={navLinkClasses}>
            Resume
          </NavLink>
<<<<<<< HEAD
          <button 
            onClick={handleContactClick}
            className={`px-3 py-2 text-sm font-medium transition-colors rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100`}
          >
            Contact
          </button>
=======
          <NavLink to="/contact" className={navLinkClasses}>
            Contact
          </NavLink>
>>>>>>> 183ebc5 (Initial commit)
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-secondary-600 hover:text-secondary-900"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-secondary-600 hover:text-secondary-900"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
<<<<<<< HEAD
          <a 
            href={`mailto:${profileEmail || 'contact@example.com'}`}
            className="text-secondary-600 hover:text-secondary-900"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
=======
>>>>>>> 183ebc5 (Initial commit)
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="p-2 rounded-md md:hidden"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white">
          <div className="container py-5 flex justify-between items-center">
            <Link to="/" className="flex items-center" onClick={toggleMenu}>
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">GN</span>
            </Link>
            <button 
              className="p-2 rounded-md"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="container flex flex-col space-y-4 py-8">
            <NavLink 
              to="/" 
              end 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Home
            </NavLink>
            <NavLink 
              to="/projects" 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Projects
            </NavLink>
            <NavLink 
              to="/skills" 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Skills
            </NavLink>
            <NavLink 
<<<<<<< HEAD
=======
              to="/experience" 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Experience
            </NavLink>
            <NavLink 
>>>>>>> 183ebc5 (Initial commit)
              to="/certificates" 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Certificates
            </NavLink>
            <NavLink 
              to="/resume" 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Resume
            </NavLink>
<<<<<<< HEAD
            <button 
              onClick={() => {
                handleContactClick();
                toggleMenu();
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 text-left`}
            >
              Contact
            </button>
=======
            <NavLink 
              to="/contact" 
              className={navLinkClasses} 
              onClick={toggleMenu}
            >
              Contact
            </NavLink>
>>>>>>> 183ebc5 (Initial commit)
            
            <div className="flex items-center space-x-4 pt-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-600 hover:text-secondary-900"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-600 hover:text-secondary-900"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
<<<<<<< HEAD
              <a 
                href={`mailto:${profileEmail || 'contact@example.com'}`}
                className="text-secondary-600 hover:text-secondary-900"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
=======
>>>>>>> 183ebc5 (Initial commit)
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}