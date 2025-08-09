import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordByWordTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

export function WordByWordText({
  text,
  className = '',
  delay = 0,
  speed = 150,
  onComplete
}: WordByWordTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const words = text.split(' ');

  useEffect(() => {
    if (words.length === 0) return;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentWordIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= words.length) {
            clearInterval(interval);
            setIsComplete(true);
            onComplete?.();
            return prevIndex;
          }
          return nextIndex;
        });
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [words.length, speed, delay, onComplete]);

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className={`inline-flex flex-wrap gap-x-2 ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          initial="hidden"
          animate={index <= currentWordIndex ? "visible" : "hidden"}
          className="inline-block"
          style={{
            willChange: index <= currentWordIndex ? 'auto' : 'opacity, transform, filter'
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

interface LetterByLetterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

export function LetterByLetterText({
  text,
  className = '',
  delay = 0,
  speed = 50,
  onComplete
}: LetterByLetterTextProps) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  
  const letters = text.split('');

  useEffect(() => {
    if (letters.length === 0) return;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentLetterIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= letters.length) {
            clearInterval(interval);
            onComplete?.();
            return prevIndex;
          }
          return nextIndex;
        });
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [letters.length, speed, delay, onComplete]);

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          initial="hidden"
          animate={index <= currentLetterIndex ? "visible" : "hidden"}
          className="inline-block"
          style={{
            willChange: index <= currentLetterIndex ? 'auto' : 'opacity, transform'
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </div>
  );
}

interface StaggeredTextRevealProps {
  lines: string[];
  className?: string;
  delay?: number;
  lineDelay?: number;
  onComplete?: () => void;
}

export function StaggeredTextReveal({
  lines,
  className = '',
  delay = 0,
  lineDelay = 300,
  onComplete
}: StaggeredTextRevealProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<boolean[]>(new Array(lines.length).fill(false));

  const handleLineComplete = (index: number) => {
    setCompletedLines(prev => {
      const newCompleted = [...prev];
      newCompleted[index] = true;
      return newCompleted;
    });

    if (index < lines.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex(index + 1);
      }, lineDelay);
    } else {
      onComplete?.();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLineIndex(0);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const lineVariants = {
    hidden: { 
      opacity: 0, 
      x: -30,
      filter: 'blur(2px)'
    },
    visible: { 
      opacity: 1, 
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <AnimatePresence key={index}>
          {index === currentLineIndex && (
            <motion.div
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              className="mb-2"
            >
              <WordByWordText
                text={line}
                speed={80}
                onComplete={() => handleLineComplete(index)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}

// Preset for hero text
export function HeroTextReveal({
  greeting = "Hello, I'm",
  name,
  tagline,
  className = '',
  onComplete
}: {
  greeting?: string;
  name: string;
  tagline: string;
  className?: string;
  onComplete?: () => void;
}) {
  return (
    <StaggeredTextReveal
      lines={[greeting, name, tagline]}
      className={className}
      delay={200}
      lineDelay={500}
      onComplete={onComplete}
    />
  );
}
