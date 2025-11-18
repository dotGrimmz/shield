import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, MessageCircle, TrendingUp, GitBranch } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import styles from './Dashboard.module.css';
import { UserProgressMap } from '@/app/types/progress';

interface LessonSummary {
  id: string;
  title: string;
  category?: string;
  difficulty?: string;
}

interface DashboardProps {
  userName: string;
  onNavigate: (route: string, data?: any) => void;
  lessons: LessonSummary[];
  userProgress: UserProgressMap;
  streak?: number;
  defenseOfTheDay?: string;
  currentLessonId?: string;
  nextLessonId?: string;
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onNavigate,
  lessons,
  userProgress,
  streak = 0,
  defenseOfTheDay = 'Grace fulfills the Law, it does not erase it.',
  currentLessonId,
  nextLessonId,
  isLoading = false,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const resolvedCurrentLesson =
    lessons.find((lesson) => lesson.id === currentLessonId) || lessons[0];

  const nextLesson =
    lessons.find((lesson) => lesson.id === nextLessonId) ||
    lessons.find((lesson) => lesson.id !== resolvedCurrentLesson?.id);

  const currentProgress = resolvedCurrentLesson
    ? userProgress[resolvedCurrentLesson.id]?.percent ?? 0
    : 0;

  return (
    <div className={styles.container}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.content}
      >
        <motion.header variants={itemVariants} className={styles.header}>
          <div>
            <h1>Welcome back, {userName}</h1>
            <p>Continue your journey in defending the faith</p>
          </div>
          <div className={styles.streak}>
            <TrendingUp size={20} />
            <span>{streak || 0} day streak</span>
          </div>
        </motion.header>

        {/* Current Lesson Progress */}
        <motion.div variants={itemVariants}>
          <Card variant="progress" className={styles.progressCard}>
            {isLoading ? (
              <p>Loading your progress...</p>
            ) : resolvedCurrentLesson ? (
              <>
                <div className={styles.progressHeader}>
                  <h3>Continue Learning</h3>
                  <span className={styles.category}>{resolvedCurrentLesson.category || 'General'}</span>
                </div>
                <h2>{resolvedCurrentLesson.title}</h2>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <div className={styles.progressFooter}>
                  <span>{currentProgress}% Complete</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('lessons', { lessonId: resolvedCurrentLesson.id })}
                  >
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3>No lessons found</h3>
                <p>Add lessons in Firebase to start your training.</p>
                <Button variant="primary" size="sm" onClick={() => onNavigate('lessons')}>
                  Browse Lessons
                </Button>
              </>
            )}
          </Card>
        </motion.div>

        {/* Defense of the Day */}
        <motion.div variants={itemVariants}>
          <Card variant="quote">
            <h4 className={styles.quoteTitle}>Defense of the Day</h4>
            <p className={styles.quoteText}>{defenseOfTheDay}</p>
          </Card>
        </motion.div>

        {/* Suggested Next Lesson */}
        {currentProgress >= 90 && nextLesson && (
          <motion.div variants={itemVariants}>
            <Card variant="lesson" onClick={() => onNavigate('lessons', { lessonId: nextLesson.id })}>
              <div className={styles.suggestedHeader}>
                <h4>Suggested Next Lesson</h4>
                <span className={styles.difficulty}>{nextLesson.difficulty || 'All Levels'}</span>
              </div>
              <h3>{nextLesson.title}</h3>
              <p className={styles.category}>{nextLesson.category || 'General'}</p>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <div className={styles.actionGrid}>
            <Card className={styles.actionCard} onClick={() => onNavigate('lessons')}>
              <BookOpen size={32} className={styles.actionIcon} />
              <h4>Browse Topics</h4>
              <p>Explore all lessons</p>
            </Card>
            <Card className={styles.actionCard} onClick={() => onNavigate('ask-shield')}>
              <MessageCircle size={32} className={styles.actionIcon} />
              <h4>Ask Shield</h4>
              <p>Get theological clarity</p>
            </Card>
            <Card className={styles.actionCard} onClick={() => onNavigate('context-builder')}>
              <GitBranch size={32} className={styles.actionIcon} />
              <h4>Context Builder</h4>
              <p>Visualize doctrine relationships</p>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
