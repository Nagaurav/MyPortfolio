import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/theme-toggle';

export function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  
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

  // Scroll spy functionality
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId || 'home');
        }
      });
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'px-3 py-2 text-sm font-medium transition-all duration-300 relative group';
    const activeClasses = isActive 
      ? 'text-primary-600 dark:text-primary-400' 
      : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white';
    
    return `${baseClasses} ${activeClasses}`;
  };

  const navItems = [
    { to: '/', label: 'Home', id: 'home' },
    { to: '/projects', label: 'Projects', id: 'projects' },
    { to: '/skills', label: 'Skills', id: 'skills' },
    { to: '/experience', label: 'Experience', id: 'experience' },
    { to: '/certificates', label: 'Certificates', id: 'certificates' },
    { to: '/resume', label: 'Resume', id: 'resume' },
    { to: '/contact', label: 'Contact', id: 'contact' },
  ];
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm ${
      isScrolled ? 'bg-white/95 shadow-lg py-3 dark:bg-dark-900/95' : 'bg-transparent py-4 sm:py-5'
    }`}>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <motion.span 
              className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-600 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              GN
            </motion.span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                end={item.to === '/'}
                className={navLinkClasses}
              >
                {item.label}
                {/* Animated underline */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: (location.pathname === item.to || (item.to === '/' && location.pathname === '/')) ? '100%' : 0 
                  }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ width: '100%' }}
                />
              </NavLink>
            ))}
          </nav>

          {/* Desktop Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />
          </div>
          
          {/* Mobile Menu Button */}
          <motion.button 
            className="p-2 rounded-md lg:hidden text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors dark:text-secondary-300 dark:hover:text-white dark:hover:bg-dark-800"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm dark:bg-dark-900/95 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-4 sm:py-5 flex justify-between items-center">
              <Link to="/" className="flex items-center" onClick={toggleMenu}>
                <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">GN</span>
              </Link>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <motion.button 
                  className="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors dark:text-secondary-300 dark:hover:text-white dark:hover:bg-dark-800"
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>
            <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 flex flex-col space-y-2 py-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink 
                    to={item.to} 
                    end={item.to === '/'}
                    className={navLinkClasses} 
                    onClick={toggleMenu}
                  >
                    {item.label}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: (location.pathname === item.to || (item.to === '/' && location.pathname === '/')) ? '100%' : 0 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}