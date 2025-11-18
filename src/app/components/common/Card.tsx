import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  variant?: 'lesson' | 'progress' | 'quote' | 'default';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  variant = 'default', 
  className = '',
  children,
  onClick
}) => {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${className} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
