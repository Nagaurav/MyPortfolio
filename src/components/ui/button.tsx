import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        tech: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 hover:scale-105 border border-cyan-400/20',
        neon: 'bg-transparent text-cyan-400 border border-cyan-400 shadow-lg shadow-cyan-400/25 hover:bg-cyan-400 hover:text-white hover:shadow-xl hover:shadow-cyan-400/50 hover:-translate-y-1',
        glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-1',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  ripple?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ripple = true, leftIcon, rightIcon, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !loading) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
      
      props.onClick?.(e);
    };

    return (
      <motion.button
        className={cn(
          buttonVariants({ variant, size, className }),
          'relative overflow-hidden',
          loading && 'cursor-not-allowed'
        )}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
        
        <motion.span
          className={cn(
            'flex items-center gap-2',
            loading && 'opacity-0'
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0 : 1 }}
        >
          {leftIcon && (
            <span className="flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className="flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </motion.span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

// Enhanced button with icon support
export function IconButton({ 
  icon: Icon, 
  children, 
  className, 
  ...props 
}: ButtonProps & { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <Button
      className={cn('group', className)}
      {...props}
    >
      {Icon && (
        <motion.div
          className="flex items-center justify-center"
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      )}
      {children}
    </Button>
  );
}

// Floating action button
export function FloatingButton({ 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <Button
        className={cn(
          'w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl',
          className
        )}
        size="icon"
        variant="tech"
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

// Gradient button with animated background
export function GradientButton({ 
  className, 
  children, 
  gradient = 'from-cyan-500 to-blue-600',
  ...props 
}: ButtonProps & { gradient?: string }) {
  return (
    <motion.div
      className={cn(
        'relative p-[2px] rounded-xl bg-gradient-to-r',
        gradient
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        className={cn(
          'w-full h-full bg-background hover:bg-transparent hover:text-white',
          className
        )}
        variant="ghost"
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}