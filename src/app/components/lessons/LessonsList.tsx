import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Clock, BarChart } from 'lucide-react';
import { Card } from '../common/Card';
import styles from './LessonsList.module.css';
import { UserProgressMap } from '@/app/types/progress';

interface Lesson {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
}

interface LessonsListProps {
  lessons: Lesson[];
  userProgress: UserProgressMap;
  onSelectLesson: (lessonId: string) => void;
  isLoading?: boolean;
}

const categories = ['All', 'Law & Grace', 'Trinity', 'Israel & the Church', 'Salvation', 'Scripture & Authority'];

export const LessonsList: React.FC<LessonsListProps> = ({ lessons, userProgress, onSelectLesson, isLoading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (lesson.category ? lesson.category === selectedCategory : false);
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.summary ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [lessons, selectedCategory, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>Lessons</h1>
          <p>Master Christian apologetics through structured study</p>
        </header>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          <Filter size={18} />
          <div className={styles.categories}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        {isLoading ? (
          <div className={styles.emptyState}>
            <p>Loading lessons...</p>
          </div>
        ) : filteredLessons.length > 0 ? (
          <motion.div
            className={styles.lessonsGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredLessons.map((lesson, index) => {
              const progress = userProgress[lesson.id]?.percent ?? 0;
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="lesson"
                    className={styles.lessonCard}
                    onClick={() => onSelectLesson(lesson.id)}
                  >
                    <div className={styles.lessonHeader}>
                      <span className={styles.category}>{lesson.category || 'General'}</span>
                      <span className={styles.difficulty}>{lesson.difficulty || 'All Levels'}</span>
                    </div>

                    <h3>{lesson.title}</h3>
                    <p className={styles.summary}>{lesson.summary || 'Detailed content available inside the lesson.'}</p>

                    <div className={styles.lessonFooter}>
                      <div className={styles.meta}>
                        <Clock size={16} />
                        <span>{lesson.duration || 'Self-paced'}</span>
                      </div>

                      {progress > 0 && (
                        <div className={styles.progressIndicator}>
                          <BarChart size={16} />
                          <span>{progress}%</span>
                        </div>
                      )}
                    </div>

                    {progress > 0 && progress < 100 && (
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className={styles.emptyState}>
            <p>No lessons found. Add lessons to your Firebase collection to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
