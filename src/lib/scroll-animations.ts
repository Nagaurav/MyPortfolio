// Scroll-triggered animation utility
export class ScrollAnimations {
  private observer: IntersectionObserver;
  private animatedElements: Set<Element> = new Set();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px -50px 0px',
      }
    );
  }

  private animateElement(element: Element) {
    if (this.animatedElements.has(element)) return;

    this.animatedElements.add(element);
    element.classList.add('visible');

    // Add specific animation classes based on data attributes
    const animationType = element.getAttribute('data-animation');
    if (animationType) {
      element.classList.add(`scroll-${animationType}`);
    }
  }

  public observe(element: Element) {
    this.observer.observe(element);
  }

  public unobserve(element: Element) {
    this.observer.unobserve(element);
    this.animatedElements.delete(element);
  }

  public destroy() {
    this.observer.disconnect();
    this.animatedElements.clear();
  }
}

// Initialize scroll animations
export const scrollAnimations = new ScrollAnimations();

// Auto-initialize animations for elements with data-animation attributes
export function initializeScrollAnimations() {
  const elements = document.querySelectorAll('[data-animation]');
  elements.forEach((element) => {
    scrollAnimations.observe(element);
  });
}

// Utility function to add animation attributes to elements
export function addScrollAnimation(
  element: HTMLElement,
  animationType: 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in' | 'stagger'
) {
  element.setAttribute('data-animation', animationType);
  scrollAnimations.observe(element);
}

// Enhanced typewriter effect with cursor
export function createTypewriterEffect(
  element: HTMLElement,
  text: string,
  speed: number = 60,
  delay: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = '';
    
    // Add cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    const typeNextChar = () => {
      if (index < text.length) {
        const char = text[index];
        const textNode = document.createTextNode(char);
        element.insertBefore(textNode, cursor);
        index++;
        setTimeout(typeNextChar, speed);
      } else {
        // Remove cursor after typing is complete
        setTimeout(() => {
          cursor.remove();
          resolve();
        }, 1000);
      }
    };

    setTimeout(typeNextChar, delay);
  });
}

// Staggered typewriter effect for multiple texts
export async function createStaggeredTypewriter(
  element: HTMLElement,
  texts: string[],
  speed: number = 60,
  delay: number = 0
): Promise<void> {
  for (let i = 0; i < texts.length; i++) {
    const textElement = document.createElement('div');
    textElement.className = 'typewriter-text';
    element.appendChild(textElement);
    
    await createTypewriterEffect(textElement, texts[i], speed, i === 0 ? delay : 0);
    
    // Add delay between texts
    if (i < texts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Parallax effect utility
export function createParallaxEffect(
  element: HTMLElement,
  speed: number = 0.5
) {
  let ticking = false;

  const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * speed;
    element.style.transform = `translateY(${rate}px)`;
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', requestTick);
  };
}

// Smooth reveal animation for text
export function createTextReveal(
  element: HTMLElement,
  delay: number = 0
) {
  const text = element.textContent || '';
  element.textContent = '';
  element.classList.add('text-reveal');

  const words = text.split(' ');
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.style.transitionDelay = `${delay + index * 0.1}s`;
    element.appendChild(span);
  });

  // Trigger animation when element comes into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(element);
}

// Enhanced progress bar animation
export function animateProgressBar(
  element: HTMLElement,
  targetPercentage: number,
  duration: number = 1000
) {
  const progressBar = element.querySelector('.progress-fill') as HTMLElement;
  if (!progressBar) return;

  const startTime = performance.now();
  const startWidth = 0;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentWidth = startWidth + (targetPercentage - startWidth) * easeOutQuart;
    
    progressBar.style.width = `${currentWidth}%`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

// Cleanup function for all animations
export function cleanupAnimations() {
  scrollAnimations.destroy();
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeScrollAnimations);
} 