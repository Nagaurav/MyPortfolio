import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CustomCursorProps {
  enabled?: boolean;
}

export function CustomCursor({ enabled = true }: CustomCursorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'hover' | 'click' | 'text'>('default');
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorScale = useMotionValue(1);
  const cursorOpacity = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const springScale = useSpring(cursorScale, springConfig);
  const springOpacity = useSpring(cursorOpacity, springConfig);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (!isVisible) {
        setIsVisible(true);
        cursorOpacity.set(1);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      cursorOpacity.set(0);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      cursorOpacity.set(1);
    };

    const handleMouseDown = () => {
      setCursorType('click');
      cursorScale.set(0.8);
    };

    const handleMouseUp = () => {
      setCursorType('default');
      cursorScale.set(1);
    };

    // Handle interactive elements
    const handleElementHover = (e: Event) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.closest('button') || 
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('.interactive')) {
        setIsHovering(true);
        setCursorType('hover');
        cursorScale.set(1.5);
      } else if (target.tagName === 'INPUT' || 
                 target.tagName === 'TEXTAREA' || 
                 target.contentEditable === 'true') {
        setCursorType('text');
        cursorScale.set(0.8);
      } else {
        setIsHovering(false);
        setCursorType('default');
        cursorScale.set(1);
      }
    };

    const handleElementLeave = () => {
      setIsHovering(false);
      setCursorType('default');
      cursorScale.set(1);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover);
    document.addEventListener('mouseout', handleElementLeave);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseout', handleElementLeave);
      
      // Restore default cursor
      document.body.style.cursor = 'auto';
    };
  }, [enabled, isVisible, cursorX, cursorY, cursorScale, cursorOpacity, springConfig]);

  if (!enabled) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        scale: springScale,
        opacity: springOpacity,
      }}
    >
      {/* Main cursor dot */}
      <motion.div
        className={`w-4 h-4 rounded-full bg-white transition-colors duration-200 ${
          cursorType === 'click' ? 'bg-cyan-400' : 
          cursorType === 'hover' ? 'bg-cyan-300' : 
          cursorType === 'text' ? 'bg-yellow-400' : 'bg-white'
        }`}
        animate={{
          scale: cursorType === 'click' ? 0.8 : cursorType === 'hover' ? 1.5 : cursorType === 'text' ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Outer ring for hover state */}
      {isHovering && (
        <motion.div
          className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Text cursor indicator */}
      {cursorType === 'text' && (
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-6 border-l-2 border-white rounded-sm -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}

// Alternative cursor with trail effect
export function CustomCursorWithTrail({ enabled = true }: CustomCursorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [trailId, setTrailId] = useState(0);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorOpacity = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const springOpacity = useSpring(cursorOpacity, springConfig);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Add to trail
      setTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: trailId }];
        setTrailId(prev => prev + 1);
        
        // Keep only last 10 positions
        if (newTrail.length > 10) {
          return newTrail.slice(-10);
        }
        return newTrail;
      });
      
      if (!isVisible) {
        setIsVisible(true);
        cursorOpacity.set(1);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      cursorOpacity.set(0);
      setTrail([]);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      cursorOpacity.set(1);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
    };
  }, [enabled, isVisible, cursorX, cursorY, cursorOpacity, trailId]);

  if (!enabled) return null;

  return (
    <>
      {/* Trail dots */}
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="fixed top-0 left-0 w-2 h-2 bg-white/30 rounded-full pointer-events-none z-[9998] mix-blend-difference"
          style={{
            x: point.x - 4,
            y: point.y - 4,
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        />
      ))}
      
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          opacity: springOpacity,
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white shadow-lg" />
      </motion.div>
    </>
  );
} 