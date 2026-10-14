import type { Block } from '@/types/kids';

// Runs a child's block program one tick at a time. The runner only decides what the hub's
// ports are doing (and when it beeps); hub.ts turns that into real circuit behaviour.
//
// Rules a child can rely on:
// - Blocks run top to bottom. Everything except Wait happens instantly.
// - Wait holds the program for its seconds; the motors and lights keep doing what they were told.
// - When the program reaches the end, everything stops (all ports off).

// Repeat is unrolled before running; this caps runaway programs (e.g. repeat 99 inside repeat 99)
export const MAX_STEPS = 2000;
export const BEEP_SECONDS = 0.5;

type Step = Exclude<Block, { type: 'repeat' }>;

export const flatten = (program: Block[]): Step[] => {
  const steps: Step[] = [];
  const add = (blocks: Block[]) => {
    for (const b of blocks) {
      if (steps.length >= MAX_STEPS) return;
      if (b.type === 'repeat') {
        for (let i = 0; i < Math.max(0, Math.floor(b.times)); i++) add(b.body);
      } else {
        steps.push(b);
      }
    }
  };
  add(program);
  return steps;
};

export interface RunState {
  steps: Step[];
  // Next step to run
  pc: number;
  // Seconds left on the Wait being run, or null
  waitLeft: number | null;
  // Each port's output, 0–1 (motor speed % / 100; lights are 1 when on)
  levels: Record<string, number>;
  time: number;
  beepUntil: number;
  beeps: number;
  done: boolean;
}

export const startRun = (program: Block[]): RunState => ({
  steps: flatten(program),
  pc: 0,
  waitLeft: null,
  levels: {},
  time: 0,
  beepUntil: -1,
  beeps: 0,
  done: false,
});

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Runs the instant blocks due now, then lets `dt` seconds pass. Returns the new state; the
// ports' levels in it hold for that whole tick.
export const advance = (state: RunState, dt: number): RunState => {
  if (state.done) return state;
  const s: RunState = { ...state, levels: { ...state.levels } };

  while (s.pc < s.steps.length) {
    const step = s.steps[s.pc];
    if (step.type === 'wait') {
      if (s.waitLeft === null) s.waitLeft = Math.max(0, step.seconds);
      if (s.waitLeft > 1e-9) break;
      s.waitLeft = null;
      s.pc++;
      continue;
    }
    switch (step.type) {
      case 'motorOn': s.levels[step.port] = clamp01(step.speed / 100); break;
      case 'motorOff':
      case 'lightOff': s.levels[step.port] = 0; break;
      case 'lightOn': s.levels[step.port] = 1; break;
      case 'beep': s.beepUntil = s.time + BEEP_SECONDS; s.beeps++; break;
    }
    s.pc++;
  }

  if (s.pc >= s.steps.length) {
    // The end of the program stops everything
    s.levels = {};
    s.done = true;
    return s;
  }

  // Time passes on the Wait being run
  s.time += dt;
  s.waitLeft = (s.waitLeft ?? 0) - dt;
  return s;
};

export const isBeeping = (state: RunState) => state.time < state.beepUntil;
