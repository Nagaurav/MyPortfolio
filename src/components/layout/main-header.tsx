import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';

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
      ? 'text-cyan-500 dark:text-cyan-400' 
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
    <motion.header 
      className={`sticky top-0 z-50 transition-all duration-500 backdrop-blur-md border-b ${
        isScrolled 
          ? 'bg-white/80 shadow-xl shadow-black/5 py-3 dark:bg-secondary-900/80 border-secondary-200/20 dark:border-secondary-700/20' 
          : 'bg-transparent py-4 sm:py-5 border-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <motion.div
              className="relative p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                GN
              </span>
              {/* Glowing effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-sm"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
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
                {/* Enhanced animated underline */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: (location.pathname === item.to || (item.to === '/' && location.pathname === '/')) ? '100%' : 0 
                  }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ width: '100%' }}
                />
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-600/5 rounded-lg opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="gradient"
              size="sm"
              className="group"
              onClick={() => window.open('/resume.pdf', '_blank')}
            >
              <Download size={16} className="mr-2 group-hover:animate-bounce" />
              Resume
            </Button>
            <ThemeToggle />
          </div>
          
          {/* Mobile Menu Button */}
          <motion.button 
            className="p-2 rounded-lg lg:hidden text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100/50 transition-all duration-300 dark:text-secondary-300 dark:hover:text-white dark:hover:bg-secondary-800/50 border border-transparent hover:border-cyan-500/20 touch-manipulation"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
            }}
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
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md dark:bg-secondary-900/95 lg:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-4 sm:py-5 flex justify-between items-center border-b border-secondary-200/20 dark:border-secondary-700/20">
              <Link to="/" className="flex items-center" onClick={toggleMenu}>
                <div className="relative p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
                  <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">GN</span>
                </div>
              </Link>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/resume.pdf', '_blank')}
                >
                  <Download size={16} />
                </Button>
                <ThemeToggle />
                <motion.button 
                  className="p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100/50 transition-all duration-300 dark:text-secondary-300 dark:hover:text-white dark:hover:bg-secondary-800/50 border border-transparent hover:border-cyan-500/20"
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>
            <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 flex flex-col space-y-1 py-8">
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
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
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
    </motion.header>
  );
}