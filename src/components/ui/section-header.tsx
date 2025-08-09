import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { underlineVariants } from '../../lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  variant?: 'default' | 'tech' | 'gradient';
  showUnderline?: boolean;
  underlineDelay?: number;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  centered = false, 
  variant = 'default',
  showUnderline = true,
  underlineDelay = 0.3
}: SectionHeaderProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const titleVariants = {
    default: 'text-3xl font-bold tracking-tight text-secondary-900 md:text-4xl',
    tech: 'text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent',
    gradient: 'text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent',
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const titleAnimationVariants = {
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

  const subtitleAnimationVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      <div className="relative">
        <motion.h2 
          variants={titleAnimationVariants}
          className={titleVariants[variant]}
        >
          {title}
        </motion.h2>
        
        {/* Enhanced animated underline for tech variant */}
        {variant === 'tech' && showUnderline && (
          <motion.div
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
            variants={underlineVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: underlineDelay }}
          />
        )}

        {/* Enhanced animated underline for gradient variant */}
        {variant === 'gradient' && showUnderline && (
          <motion.div
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"
            variants={underlineVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: underlineDelay }}
          />
        )}

        {/* Default underline for other variants */}
        {variant === 'default' && showUnderline && (
          <motion.div
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full"
            variants={underlineVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: underlineDelay }}
          />
        )}

        {/* Glowing effect for gradient variant */}
        {variant === 'gradient' && (
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-lg blur-sm"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Tech variant glow effect */}
        {variant === 'tech' && (
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-sm"
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      
      {subtitle && (
        <motion.p 
          variants={subtitleAnimationVariants}
          className={`mt-4 max-w-3xl text-lg text-secondary-600 dark:text-secondary-400 ${centered ? 'mx-auto text-center' : ''}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}