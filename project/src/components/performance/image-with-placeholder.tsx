import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export function ImageWithPlaceholder({
  src,
  alt,
  className = '',
  placeholderClassName = '',
}: ImageWithPlaceholderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-secondary-100 animate-pulse ${placeholderClassName}`}
          />
        )}
      </AnimatePresence>
      
      {!error ? (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          className={className}
          loading="lazy"
        />
      ) : (
        <div className={`bg-secondary-100 flex items-center justify-center ${className}`}>
          <span className="text-secondary-400">Failed to load image</span>
        </div>
      )}
    </div>
  );
}