import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

export function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const close = () => setIsMenuOpen(false);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/75 dark:bg-ink-900/75 backdrop-blur-md border-b border-secondary-200/70 dark:border-secondary-800/70'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2"
          aria-label="Home"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,theme(colors.brand.500),theme(colors.brand.700))] text-white shadow-sm shadow-brand-500/30">
            <span className="text-sm font-black tracking-tightest">GN</span>
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-secondary-900 dark:text-white">
              Gaurav Naik
            </span>
            <span className="text-2xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              Full-stack · AI
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-600 dark:text-brand-300 bg-brand-500/10'
                    : 'text-secondary-700 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-100/70 dark:hover:bg-secondary-800/50'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions.
            This slot used to be a second "Resume" sitting beside the Resume nav
            item, and it pointed at /resume.pdf, which does not exist. The one
            action worth promoting here is contact. */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <Button
            as={Link}
            to="/contact"
            variant="gradient"
            size="sm"
            leftIcon={<Mail size={15} />}
          >
            Get in touch
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-lg border border-secondary-200 bg-white/70 text-secondary-700 hover:bg-secondary-100 dark:border-secondary-800 dark:bg-secondary-900/70 dark:text-secondary-200 dark:hover:bg-secondary-800"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMenuOpen ? 'x' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-secondary-200/70 dark:border-secondary-800/70 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md"
          >
            <nav className="container-page py-3 flex flex-col gap-1">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        isActive
                          ? 'text-brand-600 dark:text-brand-300 bg-brand-500/10'
                          : 'text-secondary-700 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-100/70 dark:hover:bg-secondary-800/50'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="pt-3 pb-2">
                <Button
                  as={Link}
                  to="/contact"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  leftIcon={<Mail size={16} />}
                  onClick={close}
                >
                  Get in touch
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
