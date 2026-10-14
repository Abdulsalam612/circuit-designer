import type { KidsCodeMission } from '@/types/kids';

// Mission 1. The car's circuit: a 9 V battery feeds two hub ports in parallel. Port A drives
// the motor, port B the headlight (a lamp). The default program stops at 40 cm; the flag is
// at 80 cm, so the child works out that the car needs 4 seconds at 50%.
//
//   (60,60)──(100,60)──[port A]──[motor]──(380,60)
//      │         │                            │
//  [battery]  (100,160)──[port B]──[lamp]──(380,160)
//      │                                      │
//   (60,260)───────────────────────────────(380,260)

const driveToTheFlag: KidsCodeMission = {
  kind: 'code',
  id: 'drive-to-the-flag',
  title: 'Drive to the flag',
  story: 'Build a car with a motor, then code it to stop exactly on the flag.',
  brief: 'The flag is 80 cm away. At speed 50%, the car goes 20 cm every second.',
  hint: 'How many seconds does the car need to go 80 cm?',
  learn: 'steps in order, and timing',
  layout: {
    components: [
      { id: 'battery', type: 'battery', x: 60, y: 160, rotation: 90, value: 9 },
      { id: 'portA', type: 'port', x: 180, y: 60, rotation: 0, port: 'A', closed: false },
      { id: 'motor', type: 'motor', x: 300, y: 60, rotation: 0, value: 20 },
      { id: 'portB', type: 'port', x: 180, y: 160, rotation: 0, port: 'B', closed: false },
      { id: 'light', type: 'lamp', x: 300, y: 160, rotation: 0, value: 100 },
    ],
    wires: [
      { id: 'w1', x1: 60, y1: 120, x2: 60, y2: 60 },
      { id: 'w2', x1: 60, y1: 60, x2: 100, y2: 60 },
      { id: 'w3', x1: 100, y1: 60, x2: 140, y2: 60 },
      { id: 'w4', x1: 220, y1: 60, x2: 260, y2: 60 },
      { id: 'w5', x1: 340, y1: 60, x2: 380, y2: 60 },
      { id: 'w6', x1: 380, y1: 60, x2: 380, y2: 160 },
      { id: 'w7', x1: 380, y1: 160, x2: 380, y2: 260 },
      { id: 'w8', x1: 380, y1: 260, x2: 60, y2: 260 },
      { id: 'w9', x1: 60, y1: 260, x2: 60, y2: 200 },
      { id: 'w10', x1: 100, y1: 60, x2: 100, y2: 160 },
      { id: 'w11', x1: 100, y1: 160, x2: 140, y2: 160 },
      { id: 'w12', x1: 220, y1: 160, x2: 260, y2: 160 },
      { id: 'w13', x1: 340, y1: 160, x2: 380, y2: 160 },
    ],
  },
  // The hub's ports are built in; the child fits the rest
  slots: [
    { componentId: 'battery', label: 'Battery' },
    { componentId: 'motor', label: 'Motor' },
    { componentId: 'light', label: 'Light' },
  ],
  carMotorId: 'motor',
  portLabels: { A: 'Motor', B: 'Light' },
  trackLength: 100,
  goal: { kind: 'stop-between', min: 72, max: 88, flag: 80 },
  blocks: ['motorOn', 'wait', 'motorOff', 'lightOn', 'lightOff', 'beep'],
  startProgram: [
    { type: 'motorOn', port: 'A', speed: 50 },
    { type: 'wait', seconds: 2 },
    { type: 'lightOn', port: 'B' },
    { type: 'motorOff', port: 'A' },
  ],
};

export default driveToTheFlag;
