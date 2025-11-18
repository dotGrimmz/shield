import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const lessonsCollection = collection(db, 'lessons');

export const getAllLessons = async () => {
  const snapshot = await getDocs(lessonsCollection);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const listenToLessons = (callback: (lessons: any[]) => void) => {
  const q = query(lessonsCollection);
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
  });
};

export const getLesson = async (lessonId: string) => {
  const snapshot = await getDoc(doc(db, 'lessons', lessonId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const getLessonSections = async (lessonId: string) => {
  const snapshot = await getDoc(doc(db, 'lessons', lessonId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return (data && (data.sections || data.content || null)) ?? null;
};

export const updateLessonProgress = async (uid: string, lessonId: string, percent: number) => {
  if (!uid || !lessonId) return;
  const userDoc = doc(db, 'users', uid);
  await setDoc(
    userDoc,
    {
    [`progress.${lessonId}`]: {
      percent: Math.min(100, Math.max(0, percent)),
      updatedAt: new Date().toISOString(),
    },
    currentLessonId: lessonId,
  },
    { merge: true }
  );
};
