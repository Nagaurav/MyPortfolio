import React from 'react';
import { cn } from '../../lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'tech' | 'glass' | 'neon' | 'plain';
  hoverEffect?: boolean;
  onClick?: () => void;
  as?: React.ElementType;
}

const VARIANTS: Record<NonNullable<Card3DProps['variant']>, string> = {
  default:
    'bg-white/80 backdrop-blur-sm border border-secondary-200/80 dark:bg-secondary-900/40 dark:border-secondary-800',
  plain:
    'bg-white border border-secondary-200 dark:bg-secondary-900/50 dark:border-secondary-800',
  tech:
    'bg-gradient-to-br from-brand-500/[0.04] via-transparent to-accent-500/[0.04] backdrop-blur-sm border border-brand-500/15 dark:from-brand-500/[0.06] dark:to-accent-500/[0.06] dark:border-brand-400/15',
  glass:
    'bg-white/55 backdrop-blur-xl border border-white/40 dark:bg-ink-900/40 dark:border-white/10',
  neon:
    'bg-white/70 backdrop-blur-sm border border-brand-500/40 shadow-[0_0_0_1px_rgb(6_182_212/0.08),0_8px_24px_-12px_rgb(6_182_212/0.35)] dark:bg-ink-900/40',
};

export function Card3D({
  children,
  className,
  variant = 'default',
  hoverEffect = true,
  onClick,
  as,
}: Card3DProps) {
  const Component = (as ?? (onClick ? 'button' : 'div')) as React.ElementType;
  return (
    <Component
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl p-6 transition-all duration-300',
        VARIANTS[variant],
        hoverEffect && 'hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-brand-500/5',
        onClick && 'cursor-pointer text-left w-full',
        className
      )}
    >
      {children}
    </Component>
  );
}

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
