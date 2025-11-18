import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, StickyNote, Settings, BookOpen, Award, Calendar, LogOut, Moon, Sun } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import styles from './Profile.module.css';

interface ProfileProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  initialTab?: 'notes' | 'profile' | 'settings';
  notes: Array<{
    id: string;
    content: string;
    date: string;
    tags?: string[];
  }>;
  progress: Record<string, { percent: number }>;
  streak?: number;
  totalLessons?: number;
}

export const Profile: React.FC<ProfileProps> = ({ 
  userName, 
  userEmail, 
  onLogout, 
  theme, 
  onThemeChange,
  initialTab = 'profile',
  notes = [],
  progress = {},
  streak = 0,
  totalLessons = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'profile' | 'settings'>(initialTab);
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const themes = [
    { id: 'light', name: 'Light', color: '#F9FAFB' },
    { id: 'dark', name: 'Dark', color: '#111827' },
    { id: 'emerald', name: 'Emerald', color: '#10B981' },
    { id: 'crimson', name: 'Crimson', color: '#B91C1C' },
  ];

  const lessonsCompleted = Object.values(progress || {}).filter((entry) => entry.percent >= 100).length;
  const trackedLessons = totalLessons || Object.keys(progress || {}).length || 1;

  const renderNotes = () => (
    <div className={styles.notes}>
      {notes.length === 0 ? (
        <Card className={styles.noteCard}>
          <p>You have not saved any notes yet. Capture insights while studying to see them here.</p>
        </Card>
      ) : (
        notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={styles.noteCard}>
              <p className={styles.noteContent}>{note.content}</p>
              <div className={styles.noteFooter}>
                <span className={styles.noteDate}>
                  <Calendar size={14} />
                  {new Date(note.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                {note.tags && (
                  <div className={styles.noteTags}>
                    {note.tags.map(tag => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderProfile = () => (
    <motion.div 
      className={styles.profileContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          <User size={48} />
        </div>
        <h2>{userName}</h2>
        <p>{userEmail}</p>
      </div>

      <div className={styles.stats}>
        <Card className={styles.statCard}>
          <BookOpen size={32} className={styles.statIcon} />
          <div className={styles.statValue}>
            {lessonsCompleted}/{trackedLessons}
          </div>
          <div className={styles.statLabel}>Lessons</div>
        </Card>
        <Card className={styles.statCard}>
          <Award size={32} className={styles.statIcon} />
          <div className={styles.statValue}>{streak}</div>
          <div className={styles.statLabel}>Day Streak</div>
        </Card>
        <Card className={styles.statCard}>
          <StickyNote size={32} className={styles.statIcon} />
          <div className={styles.statValue}>{notes.length}</div>
          <div className={styles.statLabel}>Notes</div>
        </Card>
      </div>

      <Button 
        variant="primary" 
        size="lg" 
        className={styles.continueButton}
      >
        Continue Study
      </Button>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      className={styles.settingsContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.settingSection}>
        <h3>Theme</h3>
        <div className={styles.themeGrid}>
          {themes.map(t => (
            <button
              key={t.id}
              className={`${styles.themeOption} ${theme === t.id ? styles.activeTheme : ''}`}
              onClick={() => onThemeChange(t.id)}
            >
              <div 
                className={styles.themeColor} 
                style={{ background: t.color }}
              />
              <span>{t.name}</span>
              {t.id === 'light' && <Sun size={16} />}
              {t.id === 'dark' && <Moon size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>Font Size</h3>
        <div className={styles.fontSizeOptions}>
          {['Small', 'Medium', 'Large'].map(size => (
            <button
              key={size}
              className={`${styles.fontSizeButton} ${fontSize.toLowerCase() === size.toLowerCase() ? styles.active : ''}`}
              onClick={() => setFontSize(size.toLowerCase())}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>About</h3>
        <Card>
          <p className={styles.aboutText}>
            <strong>SHIELD</strong> v1.0.0
          </p>
          <p className={styles.aboutText}>
            A Christian apologetics study application built to help believers defend their faith with confidence.
          </p>
        </Card>
      </div>

      <Button 
        variant="secondary" 
        size="lg" 
        onClick={onLogout}
        className={styles.logoutButton}
      >
        <LogOut size={20} />
        Logout
      </Button>
    </motion.div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <StickyNote size={20} />
            <span>Notes</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'notes' && renderNotes()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};
