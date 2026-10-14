// CirKit Kids engine: motor and hub-port models, the block program runner, PWM averaging
// and the "drive to the flag" mission. Run with: npm test
import { simulate, MOTOR_RATED_VOLTS } from '../src/lib/simulation';
import { isLayoutValid } from '../src/lib/wires';
import { advance, flatten, startRun, MAX_STEPS, type RunState } from '../src/lib/kids/program';
import { driveHub } from '../src/lib/kids/hub';
import { buildLayout, runMission, CM_PER_SECOND_AT_FULL_SPEED, TICK_SECONDS } from '../src/lib/kids/mission';
import { KIDS_MISSIONS } from '../src/content/kids';
import driveToTheFlag from '../src/content/kids/missions/drive-to-the-flag';
import type { Block } from '../src/types/kids';
import type { CircuitLayout } from '../src/types/circuit';

let fails = 0, passes = 0;
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passes++;
  else { fails++; console.log('FAIL', name, detail); }
};
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

// ---- Motor in the solver ----
// A battery straight across a motor: battery at x=0..80, motor below it, joined at both ends
const motorLoop = (volts: number, reversed = false): CircuitLayout => ({
  components: [
    { id: 'b', type: 'battery', x: 100, y: 100, rotation: 0, value: volts },
    { id: 'm', type: 'motor', x: 100, y: 200, rotation: reversed ? 180 : 0, value: 20 },
  ],
  wires: [
    { id: '1', x1: 60, y1: 100, x2: 60, y2: 200 },
    { id: '2', x1: 140, y1: 100, x2: 140, y2: 200 },
  ],
});
{
  const full = simulate(motorLoop(9)).readings.m;
  check('motor: full speed at its rated voltage', near(full.speed ?? 0, 1, 0.01), JSON.stringify(full));
  check('motor: draws V/R', near(full.current, 9 / 20, 0.01));
  const half = simulate(motorLoop(MOTOR_RATED_VOLTS / 2)).readings.m;
  check('motor: half the voltage, half the speed', near(half.speed ?? 0, 0.5, 0.01));
  const back = simulate(motorLoop(9, true)).readings.m;
  check('motor: reversed, it runs backwards', (back.speed ?? 0) < -0.98, JSON.stringify(back));
  const over = simulate(motorLoop(18)).readings.m;
  check('motor: speed is capped at full', over.speed === 1);
}

// ---- The mission's circuit ----
const mission = driveToTheFlag;
const all = new Set(mission.slots.map(s => s.componentId));
const layout = buildLayout(mission, all);
check('mission layout is valid', isLayoutValid(layout.components, layout.wires));
check('missions have unique ids', new Set(KIDS_MISSIONS.map(m => m.id)).size === KIDS_MISSIONS.length);
for (const m of KIDS_MISSIONS) {
  check(`${m.id}: car motor exists`, m.layout.components.some(c => c.id === m.carMotorId && c.type === 'motor'));
  check(`${m.id}: slots name real parts`, m.slots.every(s => m.layout.components.some(c => c.id === s.componentId)));
  check(`${m.id}: start program only uses offered blocks`, flatten(m.startProgram).every(b => m.blocks.includes(b.type)));
}

// ---- Hub ports and PWM ----
{
  const off = driveHub(layout, {});
  check('hub: ports off, motor still', near(off.speeds.motor ?? 0, 0, 1e-6));
  const on = driveHub(layout, { A: 1 });
  check('hub: port A on, motor at full speed', near(on.speeds.motor ?? 0, 1, 0.01), JSON.stringify(on.speeds));
  check('hub: port A on, light stays off', near(on.brightness.light ?? 0, 0, 1e-6));
  const half = driveHub(layout, { A: 0.5 });
  check('hub: 50% PWM gives half speed', near(half.speeds.motor ?? 0, 0.5, 0.01), JSON.stringify(half.speeds));
  const quarterAndLight = driveHub(layout, { A: 0.25, B: 1 });
  check('hub: 25% motor with the light on', near(quarterAndLight.speeds.motor ?? 0, 0.25, 0.01) && (quarterAndLight.brightness.light ?? 0) > 0.5,
    JSON.stringify(quarterAndLight));
  const bothPwm = driveHub(layout, { A: 0.5, B: 0.5 });
  check('hub: two PWM ports average independently', near(bothPwm.speeds.motor ?? 0, 0.5, 0.01));
  check('hub: no warnings in a good build', on.warnings.length === 0, JSON.stringify(on.warnings));
}

// ---- Program runner ----
const runFor = (program: Block[], seconds: number) => {
  let s: RunState = startRun(program);
  const levels: number[] = [];
  for (let t = 0; t < seconds / TICK_SECONDS && !s.done; t++) {
    s = advance(s, TICK_SECONDS);
    levels.push(s.levels.A ?? 0);
  }
  return { state: s, levels };
};
{
  const { state, levels } = runFor([
    { type: 'motorOn', port: 'A', speed: 50 },
    { type: 'wait', seconds: 1 },
    { type: 'motorOff', port: 'A' },
  ], 5);
  const onTicks = levels.filter(l => l === 0.5).length;
  check('runner: wait 1 s keeps the motor on for 1 s', onTicks === Math.round(1 / TICK_SECONDS), `${onTicks} ticks`);
  check('runner: program ends', state.done);
  check('runner: everything stops at the end', Object.keys(state.levels).length === 0);
}
{
  const { state } = runFor([{ type: 'motorOn', port: 'A', speed: 100 }], 1);
  check('runner: a program with no wait ends at once', state.done && state.time === 0);
}
{
  const steps = flatten([{ type: 'repeat', times: 3, body: [{ type: 'beep' }, { type: 'wait', seconds: 1 }] }]);
  check('runner: repeat unrolls', steps.length === 6 && steps.filter(s => s.type === 'beep').length === 3);
  const nested = flatten([{ type: 'repeat', times: 99, body: [{ type: 'repeat', times: 99, body: [{ type: 'beep' }] }] }]);
  check('runner: runaway repeats are capped', nested.length === MAX_STEPS);
  const { state } = runFor([{ type: 'repeat', times: 3, body: [{ type: 'beep' }, { type: 'wait', seconds: 1 }] }], 10);
  check('runner: three beeps', state.beeps === 3);
}
{
  let s = startRun([{ type: 'lightOn', port: 'B' }, { type: 'wait', seconds: 0.5 }]);
  s = advance(s, TICK_SECONDS);
  check('runner: light on sets the port fully on', s.levels.B === 1);
}

// ---- The mission: the default program falls short; 4 seconds lands on the flag ----
const programWithWait = (seconds: number, speed = 50): Block[] => [
  { type: 'motorOn', port: 'A', speed },
  { type: 'wait', seconds },
  { type: 'lightOn', port: 'B' },
  { type: 'motorOff', port: 'A' },
];
{
  const start = runMission(mission, mission.startProgram);
  check('mission: start program stops short at ~40 cm', start.outcome === 'short' && near(start.distance, 40, 1), `${start.outcome} ${start.distance}`);
  const solved = runMission(mission, programWithWait(4));
  check('mission: wait 4 s stops on the flag', solved.outcome === 'success' && near(solved.distance, 80, 1), `${solved.outcome} ${solved.distance}`);
  const fast = runMission(mission, programWithWait(2, 100));
  check('mission: full speed for 2 s also reaches the flag', fast.outcome === 'success', `${fast.outcome} ${fast.distance}`);
  const long = runMission(mission, programWithWait(4.5));
  check('mission: 4.5 s goes past the flag', long.outcome === 'long', `${long.outcome} ${long.distance}`);
  const wall = runMission(mission, programWithWait(9));
  check('mission: 9 s hits the wall', wall.outcome === 'wall' && wall.distance === mission.trackLength);
  const still = runMission(mission, [{ type: 'lightOn', port: 'B' }, { type: 'wait', seconds: 1 }]);
  check('mission: no motor block, no movement', still.outcome === 'still');
  const lit = still.frames.some(f => (f.hub.brightness.light ?? 0) > 0.5);
  check('mission: the light comes on', lit);
  const wrongPort = runMission(mission, [{ type: 'motorOn', port: 'B', speed: 100 }, { type: 'wait', seconds: 2 }]);
  check('mission: motor block on the wrong port does nothing', wrongPort.outcome === 'still');
  const speed = (solved.frames[5].distance - solved.frames[4].distance) / TICK_SECONDS;
  check('mission: 50% is 20 cm a second, as the brief says', near(speed, CM_PER_SECOND_AT_FULL_SPEED / 2, 0.5), `${speed}`);
}
{
  // Missing parts break the circuit for real
  const noMotor = runMission(mission, programWithWait(4), new Set(['battery', 'light']));
  check('mission: without the motor the car stays put', noMotor.outcome === 'still');
  const noBattery = runMission(mission, programWithWait(4), new Set(['motor', 'light']));
  check('mission: without the battery nothing works', noBattery.outcome === 'still' && noBattery.frames.every(f => (f.hub.brightness.light ?? 0) === 0));
  const noLight = runMission(mission, programWithWait(4), new Set(['battery', 'motor']));
  check('mission: the car still drives without its light', noLight.outcome === 'success');
}

console.log(fails ? `${fails} kids checks FAILED, ${passes} passed` : `all ${passes} kids checks passed`);
if (fails) process.exit(1);
