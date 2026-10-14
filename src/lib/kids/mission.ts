import type { CircuitLayout } from '@/types/circuit';
import type { Block, KidsMission } from '@/types/kids';
import { advance, isBeeping, startRun, type RunState } from './program';
import { driveHub, type HubOutput } from './hub';

// Runs a "drive to the flag" mission: the child's program drives the hub, the real circuit
// decides how fast the motor turns, and the motor moves the car. Pure and deterministic, so
// it can be tested and replayed frame by frame by the UI.

export const TICK_SECONDS = 0.05;
// The car at full motor speed. 50% = 20 cm/s, the figure the mission brief gives children.
export const CM_PER_SECOND_AT_FULL_SPEED = 40;
// Safety stop for programs that never end
export const MAX_RUN_SECONDS = 60;

// The circuit with only the parts the child has fitted. Unplaced slot parts are left out,
// so a missing battery or motor really does break the circuit.
export const buildLayout = (mission: KidsMission, placed: ReadonlySet<string>): CircuitLayout => {
  const slotIds = new Set(mission.slots.map(s => s.componentId));
  return {
    ...mission.layout,
    components: mission.layout.components.filter(c => !slotIds.has(c.id) || placed.has(c.id)),
  };
};

export interface Frame {
  time: number;
  distance: number;
  // The block step running (index into the unrolled program), for highlighting
  pc: number;
  levels: Record<string, number>;
  hub: HubOutput;
  beeping: boolean;
}

export type Outcome = 'success' | 'short' | 'long' | 'wall' | 'still' | 'timeout';

export interface MissionRun {
  frames: Frame[];
  distance: number;
  outcome: Outcome;
}

// One tick: advance the program, drive the circuit, move the car
export const stepMission = (
  layout: CircuitLayout,
  mission: KidsMission,
  run: RunState,
  distance: number,
): { run: RunState; frame: Frame } => {
  const next = advance(run, TICK_SECONDS);
  const hub = driveHub(layout, next.levels);
  const speed = hub.speeds[mission.carMotorId] ?? 0;
  const moved = next.done ? 0 : speed * CM_PER_SECOND_AT_FULL_SPEED * TICK_SECONDS;
  const d = Math.min(mission.trackLength, Math.max(0, distance + moved));
  return {
    run: next,
    frame: { time: next.time, distance: d, pc: next.pc, levels: next.levels, hub, beeping: isBeeping(next) },
  };
};

export const judge = (mission: KidsMission, distance: number, hitWall: boolean, timedOut: boolean): Outcome => {
  if (hitWall) return 'wall';
  if (timedOut) return 'timeout';
  if (distance < 0.5) return 'still';
  const { min, max } = mission.goal;
  if (distance >= min && distance <= max) return 'success';
  return distance < min ? 'short' : 'long';
};

export const runMission = (mission: KidsMission, program: Block[], placed?: ReadonlySet<string>): MissionRun => {
  const layout = buildLayout(mission, placed ?? new Set(mission.slots.map(s => s.componentId)));
  let run = startRun(program);
  let distance = 0;
  const frames: Frame[] = [];
  let hitWall = false;
  let timedOut = false;

  while (!run.done) {
    const step = stepMission(layout, mission, run, distance);
    run = step.run;
    distance = step.frame.distance;
    frames.push(step.frame);
    if (distance >= mission.trackLength) { hitWall = true; break; }
    if (run.time >= MAX_RUN_SECONDS) { timedOut = true; break; }
  }
  return { frames, distance, outcome: judge(mission, distance, hitWall, timedOut) };
};
