#!/usr/bin/env ts-node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const { default: firebaseConfig } = await import('../src/lib/firebase.ts');
const { initializeApp, getApps, getApp } = await import('firebase/app');
const { getFirestore, doc, setDoc } = await import('firebase/firestore');

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

type SectionType = 'claim' | 'counter' | 'scripture';

interface Section {
  type: SectionType;
  content: string;
  order: number;
}

interface LessonSeed {
  id?: string;
  title: string;
  summary: string;
  category: string;
  difficulty: number;
  estimatedMinutes: number;
  bannerImageUrl: string;
  sections: Section[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const seedLessons = async () => {
  const filePath = resolve(process.cwd(), 'seed-lessons.json');
  const payload = JSON.parse(readFileSync(filePath, 'utf-8')) as LessonSeed[];

  for (const lesson of payload) {
    const lessonId = lesson.id || slugify(lesson.title);
    await setDoc(doc(db, 'lessons', lessonId), { ...lesson, id: lessonId });
    console.log(`Seeded lesson: ${lesson.title}`);
  }

  console.log('Seeding complete.');
  process.exit(0);
};

seedLessons().catch((error) => {
  console.error('Seeding failed', error);
  process.exit(1);
});
