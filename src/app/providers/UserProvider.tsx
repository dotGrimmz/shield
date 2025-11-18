'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { ensureProfileDoc, getProfile } from '@/lib/firestore/profile';

interface UserProfile {
  name?: string;
  email?: string;
  theme?: string;
  onboardingComplete?: boolean;
  [key: string]: unknown;
}

interface UserContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const data = await getProfile(uid);
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await ensureProfileDoc(firebaseUser.uid, {
          name: firebaseUser.displayName || firebaseUser.email || 'Believer',
          email: firebaseUser.email ?? '',
        });
        const profileRef = doc(db, 'profiles', firebaseUser.uid);

        unsubscribeProfile = onSnapshot(
          profileRef,
          (snapshot) => {
            setProfile((snapshot.data() as UserProfile) ?? null);
            setLoading(false);
          },
          async (error) => {
            console.error('Profile listener error', error);
            await fetchProfile(firebaseUser.uid);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Failed to prepare profile document', error);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      unsubscribeAuth();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await fetchProfile(user.uid);
    setLoading(false);
  }, [user, fetchProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
