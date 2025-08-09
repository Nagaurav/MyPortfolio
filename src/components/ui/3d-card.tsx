import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'tech' | 'glass' | 'neon';
  hoverEffect?: boolean;
  onClick?: () => void;
}

export function Card3D({ 
  children, 
  className, 
  variant = 'default',
  hoverEffect = true,
  onClick 
}: Card3DProps) {
  const baseClasses = 'relative rounded-xl transition-all duration-500 transform-style-preserve-3d';
  
  const variantClasses = {
    default: 'bg-white/80 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl dark:bg-secondary-800/80 dark:border-secondary-700/30',
    tech: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-xl border border-cyan-500/30 shadow-xl hover:shadow-cyan-500/25 dark:from-cyan-500/5 dark:to-blue-600/5 dark:border-cyan-500/20',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-white/10 dark:bg-secondary-800/20 dark:border-secondary-700/40',
    neon: 'bg-black/20 backdrop-blur-md border border-cyan-400/50 shadow-xl shadow-cyan-400/25 hover:shadow-cyan-400/40 dark:bg-secondary-900/40 dark:border-cyan-400/30',
  };

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      whileHover={hoverEffect ? {
        y: -8,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3, ease: 'easeOut' }
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated background gradient for tech variant */}
      {variant === 'tech' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-600/5 rounded-xl"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))',
              'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))',
              'linear-gradient(45deg, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Glowing effect for neon variant */}
      {variant === 'neon' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Subtle border glow on hover */}
      {hoverEffect && (
        <motion.div
          className="absolute inset-0 rounded-xl border border-transparent"
          whileHover={{
            borderColor: variant === 'neon' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            transition: { duration: 0.3 }
          }}
        />
      )}
    </motion.div>
  );
}

// Specialized card variants
export function TechCard({ children, className, ...props }: Omit<Card3DProps, 'variant'>) {
  return (
    <Card3D variant="tech" className={className} {...props}>
      {children}
    </Card3D>
  );
}

export function GlassCard({ children, className, ...props }: Omit<Card3DProps, 'variant'>) {
  return (
    <Card3D variant="glass" className={className} {...props}>
      {children}
    </Card3D>
  );
}

export function NeonCard({ children, className, ...props }: Omit<Card3DProps, 'variant'>) {
  return (
    <Card3D variant="neon" className={className} {...props}>
      {children}
    </Card3D>
  );
} 