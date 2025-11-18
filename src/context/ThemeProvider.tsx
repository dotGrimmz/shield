'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
} from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/app/providers/UserProvider';

type ThemeValue = string;

interface ThemeContextValue {
  theme: ThemeValue;
  setTheme: (nextTheme: ThemeValue) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'shield.theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useUser();
  const [theme, setThemeState] = useState<ThemeValue>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored =
      localStorage.getItem(STORAGE_KEY) || document.documentElement.getAttribute('data-theme') || 'light';
    document.documentElement.setAttribute('data-theme', stored);
    return stored;
  });

  const applyTheme = useCallback((nextTheme: ThemeValue) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    }
  }, []);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (profile?.theme && profile.theme !== theme) {
      setThemeState(profile.theme);
    }
  }, [profile?.theme]);

  const persistTheme = useCallback(
    async (nextTheme: ThemeValue) => {
      if (user) {
        try {
          await updateDoc(doc(db, 'profiles', user.uid), { theme: nextTheme });
        } catch (error) {
          console.error('Failed to update theme preference', error);
        }
      }
    },
    [user]
  );

  const handleSetTheme = useCallback(
    (nextTheme: ThemeValue) => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);
      persistTheme(nextTheme);
    },
    [applyTheme, persistTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
