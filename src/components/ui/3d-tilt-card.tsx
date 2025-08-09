import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  reverse?: boolean;
  glare?: boolean;
  glareOpacity?: number;
  glareColor?: string;
  glarePosition?: 'top' | 'bottom' | 'left' | 'right';
  glareMaxOpacity?: number;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 15,
  perspective = 1000,
  scale = 1.05,
  speed = 500,
  reverse = false,
  glare = true,
  glareOpacity = 0.15,
  glareColor = 'white',
  glarePosition = 'top',
  glareMaxOpacity = 0.3
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Motion values for smooth animations
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scaleValue = useMotionValue(1);

  // Spring animations for smooth transitions
  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scaleValue, springConfig);

  // Glare effect transforms
  const glareOpacityValue = useMotionValue(0);
  const springGlareOpacity = useSpring(glareOpacityValue, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;

    // Calculate rotation based on mouse position
    const rotateXValue = (mouseY / (rect.height / 2)) * -maxTilt;
    const rotateYValue = (mouseX / (rect.width / 2)) * maxTilt;

    // Apply reverse if needed
    const finalRotateX = reverse ? -rotateXValue : rotateXValue;
    const finalRotateY = reverse ? -rotateYValue : rotateYValue;

    rotateX.set(finalRotateX);
    rotateY.set(finalRotateY);

    // Calculate glare effect
    if (glare) {
      const glareX = (mouseX / (rect.width / 2)) * 100;
      const glareY = (mouseY / (rect.height / 2)) * 100;
      
      // Position glare based on mouse position
      let glareOpacity = 0;
      if (glarePosition === 'top' && mouseY < 0) {
        glareOpacity = Math.abs(mouseY / (rect.height / 2)) * glareMaxOpacity;
      } else if (glarePosition === 'bottom' && mouseY > 0) {
        glareOpacity = Math.abs(mouseY / (rect.height / 2)) * glareMaxOpacity;
      } else if (glarePosition === 'left' && mouseX < 0) {
        glareOpacity = Math.abs(mouseX / (rect.width / 2)) * glareMaxOpacity;
      } else if (glarePosition === 'right' && mouseX > 0) {
        glareOpacity = Math.abs(mouseX / (rect.width / 2)) * glareMaxOpacity;
      }
      
      glareOpacityValue.set(glareOpacity);
    }

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scaleValue.set(scale);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scaleValue.set(1);
    glareOpacityValue.set(0);
  };

  // Get glare gradient based on position
  const getGlareGradient = () => {
    switch (glarePosition) {
      case 'top':
        return `linear-gradient(135deg, ${glareColor} 0%, transparent 50%)`;
      case 'bottom':
        return `linear-gradient(315deg, ${glareColor} 0%, transparent 50%)`;
      case 'left':
        return `linear-gradient(45deg, ${glareColor} 0%, transparent 50%)`;
      case 'right':
        return `linear-gradient(225deg, ${glareColor} 0%, transparent 50%)`;
      default:
        return `linear-gradient(135deg, ${glareColor} 0%, transparent 50%)`;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative transform-gpu ${className}`}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare effect */}
      {glare && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{
            background: getGlareGradient(),
            opacity: springGlareOpacity,
          }}
        />
      )}

      {/* Main card content */}
      <motion.div
        className="relative z-0"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
          transformStyle: 'preserve-3d',
        }}
        transition={{
          duration: speed / 1000,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Enhanced version with shadow depth effect
interface TiltCardWithShadowProps extends TiltCardProps {
  shadowIntensity?: number;
  shadowColor?: string;
}

export function TiltCardWithShadow({
  children,
  shadowIntensity = 0.3,
  shadowColor = 'rgba(0, 0, 0, 0.1)',
  ...props
}: TiltCardWithShadowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scaleValue = useMotionValue(1);
  const shadowX = useMotionValue(0);
  const shadowY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scaleValue, springConfig);
  const springShadowX = useSpring(shadowX, springConfig);
  const springShadowY = useSpring(shadowY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -15;
    const rotateYValue = (mouseX / (rect.width / 2)) * 15;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);

    // Calculate shadow offset based on tilt
    const shadowOffsetX = (mouseX / (rect.width / 2)) * shadowIntensity * 20;
    const shadowOffsetY = (mouseY / (rect.height / 2)) * shadowIntensity * 20;

    shadowX.set(shadowOffsetX);
    shadowY.set(shadowOffsetY);

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scaleValue.set(1.05);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scaleValue.set(1);
    shadowX.set(0);
    shadowY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative transform-gpu ${props.className || ''}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative z-0"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
          transformStyle: 'preserve-3d',
          boxShadow: useTransform(
            [springShadowX, springShadowY],
            ([x, y]) => `${x}px ${y}px 30px ${shadowColor}`
          ),
        }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Simple tilt hook for custom implementations
export function useTilt(maxTilt = 15) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;

    const rotateX = (mouseY / (rect.height / 2)) * -maxTilt;
    const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return {
    rotation,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
} 