import type { CircuitLayout, ComponentType } from './circuit';
import type { WarningKind } from '@/lib/simulation';

// Lesson content is plain data (no functions or JSX), so it can live in content files
// today and move to Firestore or a CMS later without changing the viewer.

// ---- Reading ----

// Text supports **bold** and nothing else, so content stays easy to write
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; tone: 'tip' | 'warning' | 'info'; text: string }
  // A key formula or rule, shown large
  | { type: 'formula'; text: string; caption?: string }
  // Pictures of editor parts with a line about each
  | { type: 'parts'; parts: { part: ComponentType; text: string }[] }
  // A small table (e.g. resistor colour codes)
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface ReadStep {
  kind: 'read';
  title: string;
  blocks: ContentBlock[];
}

// ---- Quiz ----

export interface QuizQuestion {
  prompt: string;
  options: string[];
  // Index into options
  answer: number;
  // Shown after checking, right or wrong
  explanation: string;
}

export interface QuizStep {
  kind: 'quiz';
  title: string;
  questions: QuizQuestion[];
}

// ---- Build-a-circuit challenge ----

// What a challenge circuit must do, checked by running the simulator. `text` is what
// the learner sees in the checklist.
export type ChallengeGoal = { text: string } & (
  // At least `count` (default 1) LEDs or lamps glowing
  | { kind: 'lit'; part: 'led' | 'lamp'; count?: number }
  // The circuit contains at least `count` of a part
  | { kind: 'uses'; part: ComponentType; count?: number }
  // Every part of this type carries a current between min and max (amps)
  | { kind: 'current'; part: ComponentType; min?: number; max?: number }
  // None of these simulator warnings
  | { kind: 'no-warning'; warnings: WarningKind[] }
  // At least `count` parts of this type in one series chain / all across the same two points
  | { kind: 'series'; part: ComponentType; count: number }
  | { kind: 'parallel'; part: ComponentType; count: number }
);

export interface ChallengeStep {
  kind: 'challenge';
  title: string;
  instructions: string;
  // Parts offered in the sidebar
  parts: ComponentType[];
  // Circuit to start from (e.g. a broken one to fix); empty if left out
  start?: CircuitLayout;
  goals: ChallengeGoal[];
  hints?: string[];
}

export type LessonStep = ReadStep | QuizStep | ChallengeStep;

// ---- Lessons and levels ----

export interface Lesson {
  // Stable id, used in the URL (/learn/<id>) and saved in the user's progress.
  // Never change it once published, or people lose their progress for that lesson.
  id: string;
  level: number;
  title: string;
  description: string;
  minutes: number;
  points: number;
  steps: LessonStep[];
}

export interface Level {
  level: number;
  title: string;
  description: string;
}
