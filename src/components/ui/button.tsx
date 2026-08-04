import { forwardRef, type ElementType, type ComponentPropsWithoutRef, type Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-900 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:-translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-secondary-900 text-white hover:bg-secondary-800 shadow-sm dark:bg-white dark:text-secondary-900 dark:hover:bg-secondary-100 focus-visible:ring-secondary-500',
        primary:
          'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20 focus-visible:ring-brand-500',
        gradient:
          'text-white shadow-md shadow-brand-500/25 focus-visible:ring-brand-500 bg-[linear-gradient(135deg,theme(colors.brand.500),theme(colors.brand.700))] hover:brightness-110',
        tech:
          'text-white shadow-md shadow-brand-500/25 focus-visible:ring-brand-500 bg-[linear-gradient(135deg,theme(colors.brand.500),theme(colors.brand.700))] hover:brightness-110 ring-1 ring-inset ring-white/10',
        accent:
          'bg-accent-500 text-white hover:bg-accent-600 shadow-sm shadow-accent-500/20 focus-visible:ring-accent-500',
        outline:
          'border border-secondary-300 bg-transparent text-secondary-900 hover:bg-secondary-100 dark:border-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-800/60 focus-visible:ring-brand-500',
        ghost:
          'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800/60 focus-visible:ring-brand-500',
        link:
          'text-brand-600 dark:text-brand-400 underline-offset-4 hover:underline hover:translate-y-0',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500',
        neon:
          'bg-transparent text-brand-600 dark:text-brand-300 border border-brand-500/60 hover:bg-brand-500 hover:text-white focus-visible:ring-brand-500',
        glass:
          'bg-white/60 backdrop-blur-md border border-white/40 text-secondary-900 hover:bg-white/80 dark:bg-white/10 dark:border-white/15 dark:text-white dark:hover:bg-white/20 focus-visible:ring-brand-500',
        secondary:
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700 focus-visible:ring-brand-500',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-base rounded-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonOwnProps<E extends ElementType = 'button'> = {
  as?: E;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
} & VariantProps<typeof buttonVariants>;

type ButtonProps<E extends ElementType> = ButtonOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps>;

function ButtonInner<E extends ElementType = 'button'>(
  { as, className, variant, size, loading = false, leftIcon, rightIcon, children, ...props }: ButtonProps<E>,
  ref: Ref<Element>
) {
  const Component = (as || 'button') as ElementType;
  const isNative = typeof Component === 'string';
  // `props` is a union across every possible element type, so `disabled` is only
  // present on some members. There is no sound narrowing here without knowing E
  // at runtime, which is the standard escape hatch for polymorphic components.
  const disabled = (props as { disabled?: boolean }).disabled || loading;

  return (
    <Component
      // Same reason: the ref type depends on E, which isn't resolvable here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(buttonVariants({ variant, size, className }))}
      aria-disabled={disabled || undefined}
      {...(isNative && Component === 'button' ? { disabled } : {})}
      {...props}
    >
      {loading ? (
        <span
          className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden
        />
      ) : (
        <span className="inline-flex items-center gap-2">
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      )}
    </Component>
  );
}

const Button = forwardRef(ButtonInner) as <E extends ElementType = 'button'>(
  props: ButtonProps<E> & { ref?: Ref<Element> }
) => JSX.Element;

export { Button, buttonVariants };
export type { ButtonProps };
