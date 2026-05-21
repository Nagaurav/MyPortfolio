import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
  children,
  className,
  size = 'md',
}: PageHeroProps) {
  const padding = size === 'sm' ? 'pt-16 pb-10 sm:pt-20 sm:pb-12' : 'pt-20 pb-14 sm:pt-28 sm:pb-20';

  return (
    <section className={cn('relative overflow-hidden', padding, className)}>
      {/* Aurora gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-aurora-light dark:bg-aurora"
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-60"
      />

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('max-w-3xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}
        >
          {eyebrow && (
            <div className={cn('mb-5 flex', align === 'center' ? 'justify-center' : 'justify-start')}>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {eyebrow}
              </span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tightest text-balance">
            <span className="text-secondary-900 dark:text-white">{title}</span>
            {highlight && (
              <>
                {' '}
                <span className="heading-gradient">{highlight}</span>
              </>
            )}
          </h1>

          {subtitle && (
            <p className="mt-5 text-lg sm:text-xl text-secondary-600 dark:text-secondary-400 text-pretty">
              {subtitle}
            </p>
          )}

          {children && <div className="mt-8">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}
