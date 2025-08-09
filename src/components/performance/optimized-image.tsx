import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  webpSrc?: string;
  className?: string;
  placeholderClassName?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  webpSrc,
  className = '',
  placeholderClassName = '',
  loading = 'lazy',
  priority = false,
  width,
  height,
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine the best image source based on browser support
  const getOptimalImageSrc = () => {
    // Check if browser supports WebP
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (supportsWebP && webpSrc) {
      return webpSrc;
    }
    return src;
  };

  useEffect(() => {
    if (priority) {
      // Preload critical images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimalImageSrc();
      if (sizes) link.setAttribute('imagesizes', sizes);
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, webpSrc, sizes]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  // Progressive loading: show placeholder, then low-quality, then full quality
  const imageVariants = {
    hidden: { 
      opacity: 0,
      scale: 1.05,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const placeholderVariants = {
    loading: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.4,
        delay: 0.1
      }
    }
  };

  if (error) {
    return (
      <div className={`bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 text-secondary-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <span className="text-xs text-secondary-500">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            variants={placeholderVariants}
            initial="loading"
            animate="loading"
            exit="hidden"
            className={`absolute inset-0 bg-gradient-to-r from-secondary-100 via-secondary-200 to-secondary-100 dark:from-secondary-800 dark:via-secondary-700 dark:to-secondary-800 ${placeholderClassName}`}
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}
      </AnimatePresence>

      {/* Picture element for modern browsers with WebP support */}
      <picture>
        {webpSrc && (
          <source 
            srcSet={webpSrc}
            type="image/webp"
            sizes={sizes}
          />
        )}
        <motion.img
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          width={width}
          height={height}
          sizes={sizes}
          onLoad={handleImageLoad}
          onError={handleImageError}
          variants={imageVariants}
          initial="hidden"
          animate={imageLoaded ? "visible" : "hidden"}
          decoding="async"
          style={{
            willChange: imageLoaded ? 'auto' : 'opacity, transform',
          }}
        />
      </picture>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

// Higher-order component for automatic WebP conversion
interface AutoOptimizedImageProps extends Omit<OptimizedImageProps, 'webpSrc'> {
  autoWebP?: boolean;
}

export function AutoOptimizedImage({
  src,
  autoWebP = true,
  ...props
}: AutoOptimizedImageProps) {
  const webpSrc = autoWebP && src ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp') : undefined;
  
  return (
    <OptimizedImage
      src={src}
      webpSrc={webpSrc}
      {...props}
    />
  );
}

// Preset for hero images
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      priority
      loading="eager"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}

// Preset for gallery/card images
export function CardImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
      {...props}
    />
  );
}
