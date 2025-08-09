import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Sparkles } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
  duration?: number;
  showProgress?: boolean;
}

export function Preloader({ onComplete, duration = 800, showProgress = true }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 300); // Reduced from 500ms to 300ms
        }, 100); // Reduced from 200ms to 100ms
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0f1b27] via-[#1a2a3a] to-[#0f1b27] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }} // Reduced from 0.5s to 0.3s
        >
          <div className="relative">
            {/* Logo Animation */}
            <motion.div
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }} // Reduced from 1s to 0.8s
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.5)",
                      "0 0 40px rgba(6, 182, 212, 0.8)",
                      "0 0 20px rgba(6, 182, 212, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Code2 className="w-10 h-10 text-white" />
                </motion.div>
                
                {/* Floating sparkles - reduced animation complexity */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ 
                    y: [0, -8, 0], // Reduced movement
                    rotate: [0, 180] // Reduced rotation
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }} // Reduced from 2s to 1.5s
                >
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{ 
                    y: [0, 8, 0], // Reduced movement
                    rotate: [0, -180] // Reduced rotation
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} // Reduced delay
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Text Animation */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }} // Reduced duration and delay
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                Gaurav Naik
              </h1>
              <p className="text-secondary-400 text-lg">
                Full Stack Developer
              </p>
            </motion.div>

            {/* Progress Bar */}
            {showProgress && (
              <motion.div
                className="w-64 h-2 bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }} // Reduced duration and delay
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </motion.div>
            )}

            {/* Loading Text */}
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }} // Reduced duration and delay
            >
              <motion.p
                className="text-secondary-400 text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }} // Reduced from 1.5s to 1.2s
              >
                Loading amazing things...
              </motion.p>
            </motion.div>

            {/* Particle Effects - reduced count for better performance */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => ( // Reduced from 20 to 8 particles
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -60, 0], // Reduced movement
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random(), // Reduced duration
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Alternative minimal preloader - even faster
export function MinimalPreloader({ onComplete, duration = 600 }: PreloaderProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 200); // Reduced from 300ms to 200ms
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#0f1b27] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} // Reduced from 0.3s to 0.2s
        >
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }} // Reduced from 0.5s to 0.3s
          >
            <motion.div
              className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-cyan-500 font-medium">Loading...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Branded preloader with initials - optimized
export function BrandedPreloader({ onComplete, duration = 600 }: PreloaderProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 250); // Reduced from 400ms to 250ms
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0f1b27] to-[#1a2a3a] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }} // Reduced from 0.5s to 0.3s
        >
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }} // Reduced from 0.6s to 0.4s
          >
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <motion.div
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }} // Reduced duration and delay
              >
                GN
              </motion.div>
            </div>
            
            {/* Ripple effect - simplified */}
            <motion.div
              className="absolute inset-0 border-2 border-cyan-400/50 rounded-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} // Reduced scale
              transition={{ duration: 1.5, repeat: Infinity }} // Reduced from 2s to 1.5s
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 