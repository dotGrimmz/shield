import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const profileRef = (uid: string) => doc(db, 'profiles', uid);

export const getProfile = async (uid: string) => {
  if (!uid) return null;
  const snapshot = await getDoc(profileRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const updateProfile = async (uid: string, data: Record<string, unknown>) => {
  if (!uid) return;
  await updateDoc(profileRef(uid), { ...data, updatedAt: new Date().toISOString() });
};

export const ensureProfileDoc = async (uid: string, defaults: Record<string, unknown> = {}) => {
  if (!uid) return;
  const ref = profileRef(uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      theme: 'light',
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      ...defaults,
    });
  }
};

