import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  centered?: boolean;
  /** kept for back-compat — `tech` and `gradient` both use heading-gradient styling now */
  variant?: 'default' | 'tech' | 'gradient';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  centered = false,
  variant = 'default',
  className,
}: SectionHeaderProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const useGradient = variant === 'tech' || variant === 'gradient';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('mb-12', centered && 'text-center', className)}
    >
      {eyebrow && (
        <div className={cn('mb-4 flex', centered ? 'justify-center' : 'justify-start')}>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {eyebrow}
          </span>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">
        <span
          className={cn(
            useGradient ? 'heading-gradient' : 'text-secondary-900 dark:text-white'
          )}
        >
          {title}
        </span>
        {highlight && (
          <>
            {' '}
            <span className={useGradient ? 'text-secondary-900 dark:text-white' : 'heading-gradient'}>
              {highlight}
            </span>
          </>
        )}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'mt-4 text-base sm:text-lg text-secondary-600 dark:text-secondary-400 text-pretty',
            centered && 'mx-auto max-w-2xl'
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
