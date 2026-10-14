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

export interface KidsMission {
  // Stable id: saved in progress, never change it once published
  id: string;
  title: string;
  story: string;
  // The finished build: the real circuit, with the hub's ports as `port` components
  layout: CircuitLayout;
  slots: BuildSlot[];
  // Which component makes the car move
  carMotorId: string;
  trackLength: number;
  goal: StopOnFlagGoal;
  // Blocks offered in the palette, and the program the child starts from
  blocks: BlockType[];
  startProgram: Block[];
}
