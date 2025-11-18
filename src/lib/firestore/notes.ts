import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const notesCollection = collection(db, 'notes');

export const getUserNotes = async (uid: string) => {
  if (!uid) return [];
  const snapshot = await getDocs(query(notesCollection, where('uid', '==', uid)));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const listenToUserNotes = (uid: string, callback: (notes: any[]) => void) => {
  if (!uid) return () => {};
  const q = query(notesCollection, where('uid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
  });
};

export const createNote = async (uid: string, body: Record<string, unknown>) => {
  if (!uid) return null;
  const ref = await addDoc(notesCollection, {
    uid,
    createdAt: new Date().toISOString(),
    ...body,
  });
  return ref.id;
};

export const updateNote = async (noteId: string, body: Record<string, unknown>) => {
  if (!noteId) return;
  await updateDoc(doc(notesCollection, noteId), {
    ...body,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteNote = async (noteId: string) => {
  if (!noteId) return;
  await deleteDoc(doc(notesCollection, noteId));
};
