import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, BookOpen, StickyNote, Shield } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import styles from './AskShield.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedLesson?: string;
}

interface AskShieldProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  onSaveNote: (payload: { content: string; tags?: string[]; source?: string }) => Promise<void>;
}

const mockResponses = [
  "The relationship between Law and Grace is beautifully explained in Romans 6:14: 'For sin will have no dominion over you, since you are not under law but under grace.' This doesn't mean the moral law is discarded, but rather that we're empowered by the Holy Spirit to fulfill its intent. Augustine wrote: 'The New Testament is concealed in the Old; the Old Testament is revealed in the New.'",
  "This is a deep theological question. The doctrine of the Trinity holds that God exists eternally as three distinct persons—Father, Son, and Holy Spirit—yet remains one God in essence. This is not tritheism (three gods) but rather a mystery revealed progressively through Scripture.",
  "Great question! The distinction between Israel and the Church is important for understanding God's covenant faithfulness. While believers are grafted into the promises through Christ (Romans 11), there remain specific promises to ethnic Israel that will be fulfilled in God's timing.",
];

export const AskShield: React.FC<AskShieldProps> = ({ isOpen, onClose, initialQuestion, onSaveNote }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [noteStatus, setNoteStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion && isOpen && messages.length === 0) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with OpenAI
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        relatedLesson: 'law-and-grace-1',
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleAddToNotes = async (content: string, relatedLesson?: string) => {
    try {
      setNoteStatus('Saving...');
      await onSaveNote({
        content,
        source: 'ask-shield',
        tags: relatedLesson ? [relatedLesson] : undefined,
      });
      setNoteStatus('Saved to notes');
      setTimeout(() => setNoteStatus(null), 2000);
    } catch (err) {
      console.error('Failed to add note', err);
      setNoteStatus('Failed to save');
      setTimeout(() => setNoteStatus(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.shieldAvatar}>
              <Shield size={24} />
            </div>
            <div>
              <h2>Ask Shield</h2>
              <p>AI Theological Assistant</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.shieldIcon}>🛡️</div>
              <h3>How can I help you today?</h3>
              <p>Ask me about Scripture, theology, or apologetics</p>
              <div className={styles.suggestions}>
                <button onClick={() => handleSendMessage('Explain the Trinity')}>
                  Explain the Trinity
                </button>
                <button onClick={() => handleSendMessage('Law vs Grace?')}>
                  Law vs Grace?
                </button>
                <button onClick={() => handleSendMessage('Why trust the Bible?')}>
                  Why trust the Bible?
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`${styles.message} ${styles[message.role]}`}
              >
                {message.role === 'assistant' && (
                  <div className={styles.assistantAvatar}>
                    <Shield size={18} />
                  </div>
                )}
                <div className={styles.messageContent}>
                  <p>{message.content}</p>
                  {message.role === 'assistant' && (
                    <div className={styles.messageActions}>
                      <button onClick={() => handleAddToNotes(message.content, message.relatedLesson)}>
                        <StickyNote size={16} />
                        Add to Notes
                      </button>
                      {message.relatedLesson && (
                        <button>
                          <BookOpen size={16} />
                          View Related Lesson
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.message} ${styles.assistant}`}
            >
              <div className={styles.assistantAvatar}>
                <Shield size={18} />
              </div>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className={styles.input}
          />
          <button 
            className={styles.sendButton}
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        {noteStatus && <div className={styles.noteStatus}>{noteStatus}</div>}
      </motion.div>
    </motion.div>
  );
};
