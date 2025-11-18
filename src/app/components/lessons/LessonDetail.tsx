import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  StickyNote,
  Loader,
  CheckCircle,
} from "lucide-react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import styles from "./LessonDetail.module.css";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface LessonDetailProps {
  lessonId: string;
  onBack: () => void;
  onAskShield: (question: string) => void;
  onSaveNote: (payload: { content: string; tags?: string[] }) => Promise<void>;
  onCompleteLesson: (lessonId: string) => Promise<void>;
}

type SectionType = "claim" | "counter" | "scripture";

interface LessonSection {
  type: SectionType;
  content: string;
  order: number;
}

interface LessonContent {
  title: string;
  category?: string;
  sections?: LessonSection[];
  theologianInsights?: Array<{ name: string; quote: string }>;
}

export const LessonDetail: React.FC<LessonDetailProps> = ({
  lessonId,
  onBack,
  onAskShield,
  onSaveNote,
  onCompleteLesson,
}) => {
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [completing, setCompleting] = useState(false);

  console.log({ lesson });
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const lessonSnapshot = await getDoc(doc(db, "lessons", lessonId));
        if (!lessonSnapshot.exists()) {
          setError("Lesson not found. Please choose another lesson.");
          setLesson(null);
        } else {
          setLesson(lessonSnapshot.data() as LessonContent);
        }
      } catch (err) {
        console.error("Failed to load lesson", err);
        setError("Unable to load this lesson. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await onSaveNote({
        content: note.trim(),
        tags: lesson?.category ? [lesson.category] : undefined,
      });
      setShowNoteEditor(false);
      setNote("");
    } catch (err) {
      console.error("Failed to save note", err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      await onCompleteLesson(lessonId);
    } catch (err) {
      console.error("Failed to mark complete", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <Loader size={48} className={styles.spinningLoader} />
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <p>{error}</p>
          <Button variant="primary" onClick={onBack}>
            Back to lessons
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) return null;
  const sortedSections = [...(lesson.sections ?? [])].sort(
    (a, b) => a.order - b.order
  );
  console.log({ sortedSections });
  const claimSection = sortedSections.find(
    (section) => section.type === "claim"
  );
  const counterSection = sortedSections.find(
    (section) => section.type === "counter"
  );
  const scriptureSection = sortedSections.find(
    (section) => section.type === "scripture"
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <div className={styles.headerContent}>
            <span className={styles.category}>
              {lesson.category || "Doctrine"}
            </span>
            <h1>{lesson.title}</h1>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => setShowNoteEditor(!showNoteEditor)}
            >
              <StickyNote size={20} />
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompleteLesson}
              disabled={completing}
              className={styles.completeButton}
            >
              <CheckCircle size={16} />
              {completing ? "Saving..." : "Mark Complete"}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <motion.div
          className={styles.sections}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {/* Claim Section */}
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.sectionHeader}>
              <BookOpen size={24} className={styles.sectionIcon} />
              <h2>The Claim</h2>
            </div>
            <Card>
              <p className={styles.claimText}>
                {claimSection?.content || "Detailed claim content coming soon."}
              </p>
            </Card>
          </motion.section>

          {/* Counter-Argument Section */}
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.sectionHeader}>
              <h2>Common Objection</h2>
            </div>
            <Card className={styles.counterCard}>
              <p>
                {counterSection?.content ||
                  "No objection recorded for this lesson yet."}
              </p>
            </Card>
          </motion.section>

          {/* Scriptural Response Section */}
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h2>Scriptural Response</h2>
            </div>
            <Card className={styles.scripturalCard}>
              <p className={styles.responseText}>
                {scriptureSection?.content ||
                  "Add scriptural commentary for this lesson."}
              </p>
            </Card>
          </motion.section>

          {/* Theologian Insights */}
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <h2>Theologian Insights</h2>
            </div>
            {lesson.theologianInsights?.length ? (
              lesson.theologianInsights.map((insight, index) => (
                <Card
                  key={index}
                  variant="quote"
                  className={styles.theologianQuote}
                >
                  <p>{insight.quote}</p>
                  <cite>— {insight.name}</cite>
                </Card>
              ))
            ) : (
              <Card variant="quote" className={styles.theologianQuote}>
                <p>Add theologian commentary to deepen the lesson.</p>
              </Card>
            )}
          </motion.section>
        </motion.div>

        {/* Ask Shield Bubble */}
        <button
          className={styles.askShieldBubble}
          onClick={() => onAskShield("Tell me more about " + lesson.title)}
        >
          <MessageCircle size={24} />
          <span>Ask Shield</span>
        </button>

        {/* Note Editor */}
        {showNoteEditor && (
          <motion.div
            className={styles.noteEditor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <h3>Add Note</h3>
              <textarea
                placeholder="Write your thoughts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={styles.noteTextarea}
              />
              <div className={styles.noteActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteEditor(false)}
                  disabled={savingNote}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={savingNote || !note.trim()}
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
