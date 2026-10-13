import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Lesson } from '@/types/lesson';

// Learning progress, stored on the user's profile doc users/{uid}
export interface LearningProgress {
  // Ids of completed lessons (see Lesson.id)
  completedLessons: string[];
  completedGuides: number[];
  xp: number;
  totalPoints: number;
  level: number;
  currentStreak: number;
}

export const EMPTY_PROGRESS: LearningProgress = {
  completedLessons: [],
  completedGuides: [],
  xp: 0,
  totalPoints: 0,
  level: 1,
  currentStreak: 0,
};

const userDoc = (uid: string) => doc(firestore, 'users', uid);

// Older accounts stored placeholder lessons as numbers (1, 2, ...); those lessons no
// longer exist, so only string ids count
const lessonIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const parseProgress = (data: Record<string, unknown> | undefined): LearningProgress => ({
  completedLessons: lessonIds(data?.completedLessons),
  completedGuides: Array.isArray(data?.completedGuides) ? data.completedGuides.filter((v): v is number => typeof v === 'number') : [],
  xp: typeof data?.xp === 'number' ? data.xp : 0,
  totalPoints: typeof data?.totalPoints === 'number' ? data.totalPoints : 0,
  level: typeof data?.level === 'number' ? data.level : 1,
  currentStreak: typeof data?.currentStreak === 'number' ? data.currentStreak : 0,
});

export const loadProgress = async (uid: string): Promise<LearningProgress> => {
  const snap = await getDoc(userDoc(uid));
  return parseProgress(snap.data());
};

// Marks a lesson complete and awards its points, once. Done in a transaction so two
// tabs finishing the same lesson can't award the points twice. Returns the new progress.
export const completeLesson = (uid: string, lesson: Lesson): Promise<LearningProgress> =>
  runTransaction(firestore, async (tx) => {
    const ref = userDoc(uid);
    const snap = await tx.get(ref);
    const raw = snap.data();
    const progress = parseProgress(raw);
    if (progress.completedLessons.includes(lesson.id)) return progress;
    const updated: LearningProgress = {
      ...progress,
      completedLessons: [...progress.completedLessons, lesson.id],
      xp: progress.xp + lesson.points,
      totalPoints: progress.totalPoints + lesson.points,
    };
    // Keep any old numeric entries as they were; only add the new id
    const stored = Array.isArray(raw?.completedLessons) ? raw.completedLessons : [];
    tx.set(ref, {
      completedLessons: [...stored, lesson.id],
      xp: updated.xp,
      totalPoints: updated.totalPoints,
    }, { merge: true });
    return updated;
  });
