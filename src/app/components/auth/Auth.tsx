import React, { useState } from 'react';
import { Mail, Lock, Chrome } from 'lucide-react';
import { Button } from '../common/Button';
import styles from './Auth.module.css';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInAnonymously,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistUserProfile = async (uid: string, data: Record<string, unknown>) => {
    const userData = {
      createdAt: serverTimestamp(),
      progress: {},
      notes: [],
      defenseOfTheDay: 'Grace fulfills the Law, it does not erase it.',
      ...data,
    };

    const profileData = {
      name: data.name,
      email: data.email,
      theme: data.theme ?? 'light',
      onboardingComplete: data.onboardingComplete ?? false,
      updatedAt: serverTimestamp(),
    };

    await Promise.all([
      setDoc(doc(db, 'users', uid), userData, { merge: true }),
      setDoc(doc(db, 'profiles', uid), profileData, { merge: true }),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(credential.user, { displayName: name });
        }
        await persistUserProfile(credential.user.uid, {
          name: name || credential.user.displayName || email.split('@')[0],
          email,
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Unable to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      await persistUserProfile(credential.user.uid, {
        name: credential.user.displayName || credential.user.email,
        email: credential.user.email,
      });
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Unable to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      const credential = await signInAnonymously(auth);
      await persistUserProfile(credential.user.uid, {
        name: 'Guest',
        email: 'guest@shield.app',
        isGuest: true,
      });
    } catch (err: unknown) {
      console.error('Guest auth error:', err);
      if (err instanceof FirebaseError && err.code === 'auth/configuration-not-found') {
        setError('Guest mode is disabled. Enable Anonymous Sign-In in your Firebase Console.');
      } else {
        setError('Unable to start guest session');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <div className={styles.shieldIcon}>🛡️</div>
          <h1>SHIELD</h1>
          <p>Defend Your Faith with Confidence</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWithIcon}>
              <Mail size={20} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWithIcon}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleGoogleAuth}
          className={styles.googleButton}
          disabled={loading}
        >
          <Chrome size={20} />
          Continue with Google
        </Button>

        <button className={styles.guestButton} onClick={handleGuest} disabled={loading}>
          Continue as Guest
        </button>

        <div className={styles.toggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className={styles.toggleButton}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
