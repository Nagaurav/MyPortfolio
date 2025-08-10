import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function LoadingSpinner({ size = 24, className = '' }: LoadingSpinnerProps) {
  const actualSize = typeof size === 'string' ? sizeMap[size] || 24 : size;
  
  return (
    <Loader2 
      size={actualSize} 
      className={`animate-spin ${className}`}
    />
  );
}