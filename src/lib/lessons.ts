import { LESSONS } from '@/content/lessons';
import type { CircuitComponent, CircuitLayout } from '@/types/circuit';
import type { ChallengeGoal, Lesson } from '@/types/lesson';
import { simulate, type SimulationResult } from './simulation';

// ---- Finding lessons and their state ----

export const getLesson = (id: string): Lesson | undefined => LESSONS.find(l => l.id === id);

export type LessonState = 'completed' | 'available' | 'locked';

// Lessons unlock in order: the first one is open, then each needs the one before it.
// Completed lessons always stay open for review.
export const lessonState = (lessonId: string, completed: ReadonlySet<string>): LessonState => {
  if (completed.has(lessonId)) return 'completed';
  const index = LESSONS.findIndex(l => l.id === lessonId);
  if (index <= 0) return index === 0 ? 'available' : 'locked';
  return completed.has(LESSONS[index - 1].id) ? 'available' : 'locked';
};

// The first lesson not yet completed (null when the course is finished)
export const nextLesson = (completed: ReadonlySet<string>): Lesson | null =>
  LESSONS.find(l => !completed.has(l.id)) ?? null;

export const lessonAfter = (lessonId: string): Lesson | null => {
  const index = LESSONS.findIndex(l => l.id === lessonId);
  return index >= 0 ? LESSONS[index + 1] ?? null : null;
};

// ---- Checking challenge circuits ----

// A LED or lamp counts as lit from 10% brightness (about 2 mA through an LED)
const LIT_BRIGHTNESS = 0.1;

export interface GoalResult {
  goal: ChallengeGoal;
  passed: boolean;
}

// Parts of one type that sit in the same series chain: walk from a part through every
// node where exactly two lead ends meet, passing through other two-ended parts. Parts
// reached this way share one path, so they carry the same current.
const seriesChains = (layout: CircuitLayout, sim: SimulationResult, members: CircuitComponent[]) => {
  const endsAt = new Map<string, string[]>(); // node -> ids of parts with an end there
  for (const c of layout.components) {
    for (const n of sim.pinNodes[c.id] ?? []) endsAt.set(n, [...(endsAt.get(n) ?? []), c.id]);
  }
  const twoEnded = new Set(layout.components.filter(c => (sim.pinNodes[c.id]?.length ?? 0) === 2).map(c => c.id));
  const memberIds = new Set(members.map(m => m.id));
  const seen = new Set<string>();
  const chains: string[][] = [];
  for (const start of members) {
    if (seen.has(start.id)) continue;
    const chain: string[] = [];
    const stack = [start.id];
    seen.add(start.id);
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (memberIds.has(id)) chain.push(id);
      for (const n of sim.pinNodes[id] ?? []) {
        const there = endsAt.get(n) ?? [];
        if (there.length !== 2) continue; // a junction (or loose end) ends the chain
        for (const other of there) {
          if (other !== id && twoEnded.has(other) && !seen.has(other)) {
            seen.add(other);
            stack.push(other);
          }
        }
      }
    }
    chains.push(chain);
  }
  return chains;
};

// Parts of one type connected across the same pair of nodes
const parallelGroups = (sim: SimulationResult, members: CircuitComponent[]) => {
  const groups = new Map<string, number>();
  for (const m of members) {
    const nodes = sim.pinNodes[m.id];
    if (!nodes || nodes.length !== 2 || nodes[0] === nodes[1]) continue;
    const key = [...nodes].sort().join('|');
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups.values()];
};

const checkGoal = (goal: ChallengeGoal, layout: CircuitLayout, sim: SimulationResult): boolean => {
  const ofType = (type: string) => layout.components.filter(c => c.type === type);
  switch (goal.kind) {
    case 'uses':
      return ofType(goal.part).length >= (goal.count ?? 1);
    case 'lit':
      return ofType(goal.part).filter(c => (sim.readings[c.id]?.brightness ?? 0) >= LIT_BRIGHTNESS).length >= (goal.count ?? 1);
    case 'current': {
      const parts = ofType(goal.part);
      return parts.length > 0 && parts.every(c => {
        const amps = Math.abs(sim.readings[c.id]?.current ?? 0);
        return amps >= (goal.min ?? 0) && amps <= (goal.max ?? Infinity);
      });
    }
    case 'no-warning':
      return !sim.warnings.some(w => goal.warnings.includes(w.kind));
    case 'series':
      return seriesChains(layout, sim, ofType(goal.part)).some(chain => chain.length >= goal.count);
    case 'parallel':
      return parallelGroups(sim, ofType(goal.part)).some(size => size >= goal.count);
  }
};

// Runs the simulator on a challenge circuit and checks every goal
export const checkChallenge = (layout: CircuitLayout, goals: ChallengeGoal[]): GoalResult[] => {
  const sim = simulate(layout);
  return goals.map(goal => ({ goal, passed: checkGoal(goal, layout, sim) }));
};
