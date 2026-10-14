import type { CircuitLayout } from './circuit';

// ---- CirKit Kids: block programs and missions (see docs/kids-mode-mvp.md) ----

// A block in a child's program. Programs are plain data (stored as JSON), never code.
// Ports are the hub's outputs ('A', 'B'…); a motor or light is wired to one of them.
export type Block =
  | { type: 'motorOn'; port: string; speed: number } // speed 0–100 (%)
  | { type: 'motorOff'; port: string }
  | { type: 'lightOn'; port: string }
  | { type: 'lightOff'; port: string }
  | { type: 'wait'; seconds: number }
  | { type: 'beep' }
  | { type: 'repeat'; times: number; body: Block[] };

export type BlockType = Block['type'];

// A part the child fits into the build. Until it's placed, it isn't in the circuit.
export interface BuildSlot {
  componentId: string;
  label: string;
}

// Drive a car along a track and stop with its front inside [min, max] cm
export interface StopOnFlagGoal {
  kind: 'stop-between';
  min: number;
  max: number;
  flag: number;
}

// ---- Part 2: code missions (a build with a hub, driven by a block program) ----

export interface KidsCodeMission {
  kind: 'code';
  // Stable id: saved in progress, never change it once published
  id: string;
  title: string;
  story: string;
  // Shown beside the block editor: the goal in numbers, and a nudge (not the answer)
  brief: string;
  hint: string;
  // The coding idea it teaches, for mission cards ("steps in order, and timing")
  learn: string;
  // The finished build: the real circuit, with the hub's ports as `port` components
  layout: CircuitLayout;
  slots: BuildSlot[];
  // Which component makes the car move
  carMotorId: string;
  // What's plugged into each hub port, for labels and hints ({ A: 'Motor', B: 'Light' })
  portLabels: Record<string, string>;
  trackLength: number;
  goal: StopOnFlagGoal;
  // Blocks offered in the palette, and the program the child starts from
  blocks: BlockType[];
  startProgram: Block[];
}

// ---- Part 1: circuit missions (snap pieces on a stud board, no code) ----

// Pieces sit between studs on a grid. A wire spans one gap, a part spans two. Pieces whose
// ends meet on a stud are connected (the same rule as the circuit editor).
export type PieceKind = 'wire' | 'battery' | 'motor' | 'lamp' | 'switch' | 'resistor';

export interface Stud {
  c: number;
  r: number;
}

export interface Piece {
  id: string;
  kind: PieceKind;
  // The stud it starts at; it runs right ('h') or down ('v') from there
  at: Stud;
  dir: 'h' | 'v';
  // Turned around: swaps the ends (a battery's + side, a motor's direction)
  flipped?: boolean;
  // Switches only
  closed?: boolean;
  // Placed by the mission; the child can't remove it
  fixed?: boolean;
}

// What the simulator must show for the mission to be done
export type CircuitGoal =
  | { kind: 'motor-spins'; text: string; direction?: 'forwards' | 'backwards'; minSpeed?: number }
  | { kind: 'lamp-lit'; text: string; minBrightness?: number }
  | { kind: 'no-short'; text: string };

export interface KidsCircuitMission {
  kind: 'circuit';
  id: string;
  title: string;
  story: string;
  brief: string;
  hint: string;
  learn: string;
  // Studs across and down
  board: { cols: number; rows: number };
  // How many of each piece the child gets
  tray: { kind: PieceKind; count: number }[];
  start: Piece[];
  goals: CircuitGoal[];
}

export type KidsMission = KidsCodeMission | KidsCircuitMission;
