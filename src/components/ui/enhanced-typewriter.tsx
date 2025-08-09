import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { typewriterVariants, cursorVariants } from '../../lib/utils';

interface EnhancedTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorColor?: string;
  onComplete?: () => void;
}

export function EnhancedTypewriter({
  text,
  speed = 60,
  delay = 0,
  className = '',
  cursorColor = 'currentColor',
  onComplete
}: EnhancedTypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    indexRef.current = 0;
    setIsTyping(false);
    setShowCursor(true);

    const startTyping = () => {
      setIsTyping(true);
      const interval = setInterval(() => {
        setDisplayedText((prev) => {
          if (indexRef.current < text.length) {
            indexRef.current++;
            return text.slice(0, indexRef.current);
          } else {
            clearInterval(interval);
            setIsTyping(false);
            onComplete?.();
            return prev;
          }
        });
      }, speed);

      return () => clearInterval(interval);
    };

    const timer = setTimeout(startTyping, delay);
    return () => clearTimeout(timer);
  }, [text, speed, delay, onComplete]);

  // Blinking cursor effect
  useEffect(() => {
    if (!isTyping) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [isTyping]);

  return (
    <motion.div
      variants={typewriterVariants}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center ${className}`}
    >
      <span>{displayedText}</span>
      <AnimatePresence>
        {showCursor && (
          <motion.span
            key="cursor"
            variants={cursorVariants}
            animate="blink"
            className="ml-1 inline-block w-0.5 h-6 bg-current"
            style={{ backgroundColor: cursorColor }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface StaggeredTypewriterProps {
  texts: string[];
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function StaggeredTypewriter({
  texts,
  speed = 60,
  delay = 0,
  className = '',
  onComplete
}: StaggeredTypewriterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedTexts, setCompletedTexts] = useState<boolean[]>(new Array(texts.length).fill(false));

  const handleTextComplete = (index: number) => {
    setCompletedTexts(prev => {
      const newCompleted = [...prev];
      newCompleted[index] = true;
      return newCompleted;
    });

    if (index < texts.length - 1) {
      setTimeout(() => {
        setCurrentIndex(index + 1);
      }, 500); // Delay between texts
    } else {
      onComplete?.();
    }
  };

  return (
    <div className={className}>
      {texts.map((text, index) => (
        <AnimatePresence key={index}>
          {index === currentIndex && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedTypewriter
                text={text}
                speed={speed}
                delay={index === 0 ? delay : 0}
                onComplete={() => handleTextComplete(index)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
} 