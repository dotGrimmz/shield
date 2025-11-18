import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BookOpen, Users, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';
import styles from './Onboarding.module.css';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Shield,
    title: 'Defend Your Faith with Confidence',
    description: 'Study the foundations of Christian apologetics through structured lessons and scriptural reasoning.',
  },
  {
    icon: BookOpen,
    title: 'Study Scripture through Reasoned Context',
    description: 'Learn how to articulate and defend core doctrines like Law & Grace, the Trinity, and salvation.',
  },
  {
    icon: Users,
    title: 'Learn from Theologians like Augustine',
    description: 'Discover insights from church fathers and modern scholars who have defended the faith for centuries.',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className={styles.container}>
      <button className={styles.skipButton} onClick={handleSkip}>
        Skip
      </button>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.slide}
          >
            <div className={styles.iconContainer}>
              {React.createElement(slides[currentSlide].icon, { 
                size: 80, 
                strokeWidth: 1.5,
                className: styles.icon
              })}
            </div>

            <h1>{slides[currentSlide].title}</h1>
            <p>{slides[currentSlide].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className={styles.dots}>
          {slides.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
            />
          ))}
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleNext}
          className={styles.nextButton}
        >
          {currentSlide === slides.length - 1 ? 'Enter the Shield' : 'Continue'}
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
};
