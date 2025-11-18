import React from 'react';
import { Home, BookOpen, MessageCircle, StickyNote, User, GitBranch } from 'lucide-react';
import styles from './Navigation.module.css';

interface NavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeRoute, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'ask-shield', label: 'Ask Shield', icon: MessageCircle },
    { id: 'context-builder', label: 'Context', icon: GitBranch },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeRoute === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.shieldIcon}>🛡️</div>
          <h2>SHIELD</h2>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.sidebarItem} ${activeRoute === item.id ? styles.active : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
