'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { Onboarding } from './components/onboarding/Onboarding';
import { Auth } from './components/auth/Auth';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { LessonsList } from './components/lessons/LessonsList';
import { LessonDetail } from './components/lessons/LessonDetail';
import { AskShield } from './components/ask-shield/AskShield';
import { Profile } from './components/profile/Profile';
import { ContextBuilder } from './components/context-builder/ContextBuilder';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { ProgressUpdatePayload, UserProgressMap } from './types/progress';
import { useUser } from './providers/UserProvider';

type PrimaryRoute = 'home' | 'lessons' | 'notes' | 'profile' | 'context-builder';
type Route = PrimaryRoute | 'ask-shield';

const ROUTE_TITLES: Record<PrimaryRoute, string> = {
  home: 'Armory Dashboard',
  lessons: 'Lessons Library',
  notes: 'Study Notes',
  profile: 'Profile & Settings',
  'context-builder': 'Context Builder',
};

interface NavigateData {
  lessonId?: string;
}

type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Lesson {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  difficulty?: LessonDifficulty;
  duration?: string;
  progress?: number;
  defenseOfTheDay?: string;
}

interface UserData {
  name?: string;
  email?: string;
  streak?: number;
  currentLessonId?: string;
  nextLessonId?: string;
  defenseOfTheDay?: string;
  notes?: Array<{
    id: string;
    content: string;
    date: string;
    tags?: string[];
    source?: string;
  }>;
  progress?: UserProgressMap;
  theme?: string;
  onboardingComplete?: boolean;
}

const LOCAL_THEME_KEY = 'shield.theme';
const LOCAL_ONBOARDING_KEY = 'shield.onboarding';

export default function Home() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { user: firebaseUser, profile: accountProfile, loading: userLoading, logout: providerLogout } = useUser();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<Route>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [askShieldOpen, setAskShieldOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>(undefined);
  const previousRouteRef = useRef<PrimaryRoute>('home');
  const authReady = !userLoading;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedTheme = localStorage.getItem(LOCAL_THEME_KEY);
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    }
    const storedOnboarding = localStorage.getItem(LOCAL_ONBOARDING_KEY);
    if (storedOnboarding === 'true') {
      setHasCompletedOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
      const data = snapshot.data() as UserProfile | undefined;
      setUserProfile(data ?? null);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'lessons'),
      (snapshot) => {
        const fetchedLessons: Lesson[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Lesson, 'id'>),
        }));
        setLessons(fetchedLessons);
        setLessonsLoading(false);
      },
      (error) => {
        console.error('Error loading lessons:', error);
        setLessons([]);
        setLessonsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accountProfile?.theme && accountProfile.theme !== theme) {
      setTheme(accountProfile.theme);
    }
  }, [accountProfile?.theme]);

  useEffect(() => {
    if (
      typeof accountProfile?.onboardingComplete === 'boolean' &&
      accountProfile.onboardingComplete !== hasCompletedOnboarding
    ) {
      setHasCompletedOnboarding(accountProfile.onboardingComplete);
    }
  }, [accountProfile?.onboardingComplete]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_THEME_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (hasCompletedOnboarding && typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_ONBOARDING_KEY, 'true');
    }
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    if (
      firebaseUser &&
      hasCompletedOnboarding &&
      accountProfile &&
      !accountProfile.onboardingComplete
    ) {
      updateDoc(doc(db, 'profiles', firebaseUser.uid), { onboardingComplete: true }).catch((error) =>
        console.error('Failed to sync onboarding flag', error)
      );
    }
  }, [firebaseUser, hasCompletedOnboarding, accountProfile]);

  const handleThemeChange = async (nextTheme: string) => {
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_THEME_KEY, nextTheme);
    }
    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), { theme: nextTheme });
      } catch (error) {
        console.error('Failed to update theme preference', error);
      }
    }
  };

  const handleCompleteOnboarding = async () => {
    setHasCompletedOnboarding(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_ONBOARDING_KEY, 'true');
    }
    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), { onboardingComplete: true });
      } catch (error) {
        console.error('Failed to record onboarding completion', error);
      }
    }
  };

  const handlePersistNote = async ({
    content,
    tags,
    source,
  }: {
    content: string;
    tags?: string[];
    source?: string;
  }) => {
    if (!firebaseUser) return;
    const noteEntry = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.round(Math.random() * 1000)}`,
      content,
      tags: tags ?? [],
      source: source ?? 'lesson',
      date: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        notes: arrayUnion(noteEntry),
      });
    } catch (error) {
      console.error('Failed to persist note', error);
      throw error;
    }
  };

  const updateLessonProgress = async ({ lessonId, percent, currentPercent }: ProgressUpdatePayload) => {
    if (!firebaseUser || !lessonId) return;
    const safePercent = Math.max(currentPercent ?? 0, percent);
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        [`progress.${lessonId}`]: {
          percent: Math.min(100, Math.max(0, safePercent)),
          updatedAt: new Date().toISOString(),
        },
        currentLessonId: lessonId,
      });
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    await updateLessonProgress({ lessonId, percent: 100, currentPercent: 100 });
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        nextLessonId: lessons.find((lesson) => lesson.id !== lessonId)?.id ?? lessonId,
      });
    } catch (error) {
      console.error('Failed to set next lesson', error);
    }
  };

  const contentRoute: PrimaryRoute =
    activeRoute === 'ask-shield' ? previousRouteRef.current : activeRoute;

  const handleNavigate = (route: Route, data?: NavigateData) => {
    if (route === 'ask-shield') {
      openAskShield();
      return;
    }

    previousRouteRef.current = route;
    setActiveRoute(route);
    setAskShieldOpen(false);

    if (route === 'lessons') {
      setSelectedLessonId(data?.lessonId ?? null);
      return;
    }

    setSelectedLessonId(null);
  };

  const openAskShield = (question?: string) => {
    if (activeRoute !== 'ask-shield') {
      previousRouteRef.current = contentRoute;
    }
    setInitialQuestion(question);
    setAskShieldOpen(true);
    setActiveRoute('ask-shield');
  };

  const handleCloseAskShield = () => {
    setAskShieldOpen(false);
    setActiveRoute(previousRouteRef.current);
    setInitialQuestion(undefined);
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    updateLessonProgress({ lessonId, percent: 25, currentPercent: userProgress[lessonId]?.percent });
  };

  const handleAskShieldFromLesson = (question: string) => {
    openAskShield(question);
  };

  const handleLogout = async () => {
    await providerLogout();
    setActiveRoute('home');
    setSelectedLessonId(null);
    setAskShieldOpen(false);
    previousRouteRef.current = 'home';
  };

  const resolvedName =
    userProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email?.split('@')[0] ||
    'Student';

  const resolvedEmail = userProfile?.email || firebaseUser?.email || 'guest@shield.app';

  const userProgress: UserProgressMap = userProfile?.progress ?? {};

  const renderActiveView = () => {
    if (!firebaseUser) return null;

    if (contentRoute === 'lessons') {
      if (selectedLessonId) {
        return (
          <LessonDetail
            lessonId={selectedLessonId}
            onBack={() => setSelectedLessonId(null)}
            onAskShield={handleAskShieldFromLesson}
            onSaveNote={(payload) => handlePersistNote({ ...payload, source: 'lesson' })}
            onCompleteLesson={markLessonComplete}
          />
        );
      }

      return (
        <LessonsList
          lessons={lessons}
          isLoading={lessonsLoading}
          onSelectLesson={handleLessonSelect}
          userProgress={userProgress}
        />
      );
    }

    if (contentRoute === 'profile' || contentRoute === 'notes') {
      const initialTab = contentRoute === 'notes' ? 'notes' : 'profile';
      return (
        <Profile
          key={`profile-${initialTab}`}
          userName={resolvedName}
          userEmail={resolvedEmail}
          onLogout={handleLogout}
          theme={theme}
          onThemeChange={handleThemeChange}
          initialTab={initialTab}
          notes={userProfile?.notes ?? []}
          streak={userProfile?.streak ?? 0}
          progress={userProgress}
          totalLessons={lessons.length}
        />
      );
    }

    if (contentRoute === 'context-builder') {
      return <ContextBuilder />;
    }

    return (
      <Dashboard
        userName={resolvedName}
        onNavigate={handleNavigate}
        lessons={lessons}
        userProgress={userProgress}
        streak={userProfile?.streak}
        defenseOfTheDay={userProfile?.defenseOfTheDay}
        currentLessonId={userProfile?.currentLessonId}
        nextLessonId={userProfile?.nextLessonId}
        isLoading={lessonsLoading}
      />
    );
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  if (!authReady) {
    return (
      <div className={styles.loadingState}>
        <p>Preparing your study armory...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Auth />;
  }

  return (
    <div className={styles.appShell}>
      <Navigation activeRoute={activeRoute} onNavigate={handleNavigate} />

      <div className={styles.stage}>
        <header className={styles.header}>
          <div>
            <p className={styles.subtitle}>Christian Apologetics Study</p>
            <h1 className={styles.title}>{ROUTE_TITLES[contentRoute]}</h1>
          </div>
          <div className={styles.userBadge}>
            <span className={styles.badgeInitials}>{resolvedName.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{resolvedName}</strong>
              <p className={styles.badgeEmail}>{resolvedEmail}</p>
            </div>
          </div>
        </header>

        <section className={styles.view}>{renderActiveView()}</section>
      </div>

      <AskShield
        isOpen={askShieldOpen}
        onClose={handleCloseAskShield}
        initialQuestion={initialQuestion}
        onSaveNote={(payload) => handlePersistNote({ ...payload, source: payload.source ?? 'ask-shield' })}
      />
    </div>
  );
}
