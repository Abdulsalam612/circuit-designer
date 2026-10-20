// CirKit Kids snap board: placement rules, board -> real circuit, goals and kid feedback.
// Run with: npm test
import { simulate } from '../src/lib/simulation';
import { isLayoutValid } from '../src/lib/wires';
import { allGaps, boardToLayout, canPlace, checkGoals, kidsFeedback, partBetween, partEndOptions, pieceGaps, rotated, testedThings, THINGS, type Board } from '../src/lib/kids/board';
import makeItGo from '../src/content/kids/missions/make-it-go';
import faster from '../src/content/kids/missions/faster';
import lightsOn from '../src/content/kids/missions/lights-on';
import backwards from '../src/content/kids/missions/backwards';
import gentleBreeze from '../src/content/kids/missions/gentle-breeze';
import doesItConduct from '../src/content/kids/missions/does-it-conduct';
import { FIRST_LOOP } from '../src/content/kids/missions/first-loop';
import { CIRCUIT_MISSIONS } from '../src/content/kids';
import type { Piece, PieceKind, ThingKind } from '../src/types/kids';

let fails = 0, passes = 0;
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passes++;
  else { fails++; console.log('FAIL', name, detail); }
};

let n = 0;
const piece = (kind: PieceKind, c: number, r: number, dir: 'h' | 'v', extra: Partial<Piece> = {}): Piece =>
  ({ id: `${kind}${n++}`, kind, at: { c, r }, dir, ...extra });
const wires = (spec: [number, number, 'h' | 'v'][]) => spec.map(([c, r, d]) => piece('wire', c, r, d));

const board: Board = makeItGo.board;

// ---- Placement ----
{
  const w = piece('wire', 0, 0, 'h');
  check('place: a wire fits an empty gap', canPlace([], w, board));
  check('place: off the board is refused', !canPlace([], piece('wire', 5, 0, 'h'), board));
  check('place: one piece per gap', !canPlace([w], piece('wire', 0, 0, 'h'), board));
  const motor = piece('motor', 1, 1, 'h');
  check('place: a part covers two gaps', pieceGaps(motor).length === 2);
  check('place: nothing may end on a part\'s middle', !canPlace([motor], piece('wire', 2, 1, 'v'), board) && !canPlace([motor], piece('wire', 2, 0, 'v'), board));
  check('place: wires may end on a part\'s ends', canPlace([motor], piece('wire', 1, 1, 'v'), board) && canPlace([motor], piece('wire', 3, 1, 'v'), board));
  check('place: a part can\'t sit across another piece\'s end', !canPlace([piece('wire', 2, 2, 'v')], piece('battery', 1, 2, 'h'), board));
  // Two taps: where the part starts, then where it finishes
  const across = partBetween([], 'battery', { c: 1, r: 2 }, { c: 3, r: 2 }, board);
  check('place: start then finish to the right lies across, as tapped', across?.at.c === 1 && across.dir === 'h' && !across.flipped, JSON.stringify(across));
  const leftwards = partBetween([], 'battery', { c: 3, r: 2 }, { c: 1, r: 2 }, board);
  check('place: tapped right to left, it is the same place turned around (+ on the right)', leftwards?.at.c === 1 && leftwards.dir === 'h' && leftwards.flipped === true, JSON.stringify(leftwards));
  const upwards = partBetween([], 'battery', { c: 0, r: 3 }, { c: 0, r: 1 }, board);
  check('place: tapped bottom to top, it stands up turned around (+ at the bottom)', upwards?.at.r === 1 && upwards.dir === 'v' && upwards.flipped === true, JSON.stringify(upwards));
  check('place: the finish must be two studs away in a straight line',
    partBetween([], 'motor', { c: 1, r: 1 }, { c: 2, r: 1 }, board) === null && partBetween([], 'motor', { c: 1, r: 1 }, { c: 3, r: 3 }, board) === null);
  check('place: wires are not placed with two taps', partBetween([], 'wire', { c: 0, r: 0 }, { c: 2, r: 0 }, board) === null);
  check('place: from a corner, a part can finish two ways', partEndOptions([], 'motor', { c: 0, r: 0 }, board).length === 2);
  check('place: from the middle, four ways', partEndOptions([], 'motor', { c: 2, r: 2 }, board).length === 4);
  check('place: a finish blocked by another piece is not offered',
    partEndOptions([piece('wire', 3, 2, 'h')], 'motor', { c: 2, r: 2 }, board).every(o => !(o.to.c === 4 && o.to.r === 2)));
  // Flipping by tapping order really reverses a battery
  const loopWithout = FIRST_LOOP.filter(p => p.kind !== 'battery');
  const plusAtBottom = { ...partBetween(loopWithout, 'battery', { c: 0, r: 3 }, { c: 0, r: 1 }, board)!, id: 'b' } as Piece;
  check('place: a battery tapped + at the bottom runs the motor backwards', (simulate(boardToLayout([plusAtBottom, ...loopWithout])).readings['start-motor'].speed ?? 0) < -0.4);
  const lying = piece('motor', 1, 2, 'h');
  const turned = rotated([lying], lying, board);
  check('rotate: turns on its middle stud', turned?.dir === 'v' && turned.at.c === 2 && turned.at.r === 1, JSON.stringify(turned));
  const top = piece('motor', 1, 0, 'h');
  check('rotate: refused when there is no room (top edge)', rotated([top], top, board) === null);
  check('place: every gap is offered once', allGaps(board).length === (board.cols - 1) * board.rows + board.cols * (board.rows - 1));
}

// ---- "Make it go": a solution, built only from the tray ----
const solution = (): Piece[] => [
  piece('battery', 0, 1, 'v'),
  piece('motor', 2, 0, 'h'),
  ...wires([[0, 0, 'v'], [0, 0, 'h'], [1, 0, 'h'], [4, 0, 'h'], [5, 0, 'v'], [5, 1, 'v'], [5, 2, 'v'],
    [0, 3, 'h'], [1, 3, 'h'], [2, 3, 'h'], [3, 3, 'h'], [4, 3, 'h']]),
];
{
  const pieces = solution();
  // Each piece placed in turn must be allowed
  const built: Piece[] = [];
  for (const p of pieces) {
    check(`solution: ${p.kind} at ${p.at.c},${p.at.r} ${p.dir} can be placed`, canPlace(built, p, board));
    built.push(p);
  }
  const counts = new Map<PieceKind, number>();
  pieces.forEach(p => counts.set(p.kind, (counts.get(p.kind) ?? 0) + 1));
  check('solution: uses only what the tray offers', makeItGo.tray.every(t => (counts.get(t.kind) ?? 0) <= t.count) && [...counts.keys()].every(k => makeItGo.tray.some(t => t.kind === k)));

  const layout = boardToLayout(pieces);
  check('solution: the board is a valid circuit', isLayoutValid(layout.components, layout.wires));
  const result = simulate(layout);
  const motor = result.readings[pieces[1].id];
  check('solution: the motor runs forwards at half speed (one 4.5 V battery)', Math.abs((motor.speed ?? 0) - 0.5) < 0.02, JSON.stringify(motor));
  check('solution: every goal is met', checkGoals(pieces, makeItGo.goals).every(g => g.met));
  check('solution: kids are told it works', kidsFeedback(pieces, result).tone === 'good');
}

// ---- Common mistakes ----
{
  const gap = solution().filter((p, i) => i !== 6); // one wire missing on the right
  const result = simulate(boardToLayout(gap));
  check('gap: the motor stops', Math.abs(result.readings[gap[1].id].speed ?? 0) < 1e-6);
  check('gap: goal not met', !checkGoals(gap, makeItGo.goals)[0].met);
  check('gap: kids are told to complete the loop', kidsFeedback(gap, result).text.includes('complete loop'));

  const flipped = solution();
  flipped[0] = { ...flipped[0], flipped: true };
  const back = simulate(boardToLayout(flipped)).readings[flipped[1].id].speed ?? 0;
  check('flipped battery: the motor runs backwards', back < -0.45, `${back}`);
  check('flipped battery: "the motor spins" still counts', checkGoals(flipped, makeItGo.goals)[0].met);
  check('flipped battery: a "backwards" goal sees it', checkGoals(flipped, [{ kind: 'motor-spins', text: '', direction: 'backwards' }])[0].met);

  // A loop of wire straight round the battery
  const short = [piece('battery', 1, 1, 'h'), ...wires([[1, 1, 'v'], [1, 2, 'h'], [2, 2, 'h'], [3, 1, 'v']])];
  const shortResult = simulate(boardToLayout(short));
  check('short: the simulator calls it a short circuit', shortResult.warnings.some(w => w.kind === 'short-circuit'));
  check('short: no-short goal fails', !checkGoals(short, [{ kind: 'no-short', text: '' }])[0].met);
  check('short: kids are warned', kidsFeedback(short, shortResult).text.startsWith('Short circuit'));

  check('empty board: asks for a battery', kidsFeedback([], simulate(boardToLayout([]))).text.includes('battery'));
}

// ---- A switch in the loop ----
{
  // Swap the two left-hand bottom wires for a switch
  const base = solution().filter(p => !(p.kind === 'wire' && p.at.r === 3 && p.at.c < 2));
  const off = [...base, piece('switch', 0, 3, 'h', { closed: false })];
  const on = [...base, piece('switch', 0, 3, 'h', { closed: true })];
  check('switch off: motor still', !checkGoals(off, makeItGo.goals)[0].met);
  check('switch off: kids are told to turn it on', kidsFeedback(off, simulate(boardToLayout(off))).text.includes('switch is off'));
  check('switch on: motor spins', checkGoals(on, makeItGo.goals)[0].met);
}

// ---- Two batteries in series run the motor at full speed (for "Faster!") ----
{
  const two = solution();
  // Replace the left column (battery + top wire) with two batteries stacked: (0,0)-(0,2) and (0,2)-(0,4)
  const pieces = [
    piece('battery', 0, 0, 'v'), piece('battery', 0, 2, 'v'), two[1],
    ...wires([[0, 0, 'h'], [1, 0, 'h'], [4, 0, 'h'], [5, 0, 'v'], [5, 1, 'v'], [5, 2, 'v'], [5, 3, 'v'],
      [0, 4, 'h'], [1, 4, 'h'], [2, 4, 'h'], [3, 4, 'h'], [4, 4, 'h']]),
  ];
  const speed = simulate(boardToLayout(pieces)).readings[two[1].id].speed ?? 0;
  check('two batteries: the motor runs at full speed', speed > 0.97, `${speed}`);
}

// ---- "Faster!": a second battery and a switch ----
{
  const bottom = (p: Piece) => p.kind === 'wire' && p.at.r === 3 && p.at.c < 4;
  const answer = (flipped = false, closed = true): Piece[] => [
    ...faster.start.filter(p => !bottom(p)),
    piece('battery', 0, 3, 'h', { flipped }),
    piece('switch', 2, 3, 'h', { closed }),
  ];
  const pieces = answer();
  check('faster: the answer fits the board', pieces.every((p, i) => canPlace(pieces.slice(0, i), p, faster.board)));
  const motorId = faster.start.find(p => p.kind === 'motor')!.id;
  const speed = simulate(boardToLayout(pieces)).readings[motorId].speed ?? 0;
  check('faster: full speed with both batteries and the switch on', speed > 0.97, `${speed}`);
  check('faster: every goal is met', checkGoals(pieces, faster.goals).every(g => g.met));
  check('faster: the start is half speed, not full', !checkGoals(faster.start, faster.goals)[0].met);

  const off = answer(false, false);
  const offGoals = checkGoals(off, faster.goals);
  check('faster: switch off stops the car', !offGoals[0].met);
  check('faster: the switch goal counts with the switch off too', offGoals[1].met);

  const wrongWay = answer(true);
  const wrongResult = simulate(boardToLayout(wrongWay));
  check('faster: batteries facing each other cancel out', Math.abs(wrongResult.readings[motorId].speed ?? 0) < 1e-6);
  check('faster: kids are told the batteries push against each other', kidsFeedback(wrongWay, wrongResult).text.includes('against each other'));

  // A switch beside the loop (not in it) controls nothing
  const aside = [...faster.start, piece('switch', 1, 4, 'h', { closed: true })];
  check('faster: a switch outside the loop does not count', !checkGoals(aside, faster.goals)[1].met);
}

// ---- "Lights on": two bulbs, in a row and side by side ----
{
  const loop = wires([[4, 0, 'v'], [4, 1, 'v'], [4, 2, 'v'], [0, 3, 'h'], [1, 3, 'h'], [2, 3, 'h'], [3, 3, 'h']]);
  const sideBySide = [
    piece('battery', 0, 1, 'v'), piece('lamp', 1, 0, 'h'), piece('lamp', 1, 1, 'h'),
    ...wires([[0, 0, 'v'], [0, 0, 'h'], [3, 0, 'h'], [0, 1, 'h'], [3, 1, 'h']]), ...loop,
  ];
  check('lights: the side-by-side answer fits the board', sideBySide.every((p, i) => canPlace(sideBySide.slice(0, i), p, lightsOn.board)));
  check('lights: side by side uses only the tray', lightsOn.tray.every(t => sideBySide.filter(p => p.kind === t.kind).length <= t.count));
  const parallel = simulate(boardToLayout(sideBySide));
  const bright = sideBySide.filter(p => p.kind === 'lamp').map(p => parallel.readings[p.id].brightness ?? 0);
  check('lights: side by side, both bulbs are fully bright', bright.every(b => b > 0.95), bright.join());
  check('lights: side by side meets every goal', checkGoals(sideBySide, lightsOn.goals).every(g => g.met));
  check('lights: side by side gets the good news', kidsFeedback(sideBySide, parallel).tone === 'good');

  const inARow = [
    piece('battery', 0, 1, 'v'), piece('lamp', 0, 0, 'h'), piece('lamp', 2, 0, 'h'),
    ...wires([[0, 0, 'v']]), ...loop,
  ];
  check('lights: the in-a-row build fits the board', inARow.every((p, i) => canPlace(inARow.slice(0, i), p, lightsOn.board)));
  const series = simulate(boardToLayout(inARow));
  const dim = inARow.filter(p => p.kind === 'lamp').map(p => series.readings[p.id].brightness ?? 0);
  check('lights: in a row, both bulbs are dim', dim.every(b => b > 0.2 && b < 0.5), dim.join());
  const rowGoals = checkGoals(inARow, lightsOn.goals);
  check('lights: in a row, "both on" is met but not "both bright"', rowGoals[0].met && !rowGoals[1].met);
  check('lights: in a row, kids are nudged to give each bulb its own path', kidsFeedback(inARow, series).text.includes('own path'));

  const oneDark = sideBySide.filter(p => !(p.kind === 'wire' && p.at.c === 3 && p.at.r === 1));
  const oneDarkResult = simulate(boardToLayout(oneDark));
  check('lights: a bulb out of the loop stays dark', !checkGoals(oneDark, lightsOn.goals)[0].met);
  check('lights: kids are told one bulb is still dark', kidsFeedback(oneDark, oneDarkResult).text.includes('still dark'));
  check('lights: an empty loop talks about the bulb, not a motor',
    kidsFeedback([piece('battery', 0, 1, 'v'), piece('lamp', 1, 0, 'h')], simulate(boardToLayout([piece('battery', 0, 1, 'v'), piece('lamp', 1, 0, 'h')]))).text.includes('the bulb'));
}

// ---- "Backwards": turn the battery (or the motor) round ----
{
  const turn = (id: string) => backwards.start.map(p => (p.id === id ? { ...p, flipped: true } : p));
  check('backwards: the start drives forwards, not backwards', !checkGoals(backwards.start, backwards.goals)[0].met);
  check('backwards: turning the battery round solves it', checkGoals(turn('start-battery'), backwards.goals).every(g => g.met));
  check('backwards: turning the motor round solves it too', checkGoals(turn('start-motor'), backwards.goals).every(g => g.met));
  const both = turn('start-battery').map(p => (p.id === 'start-motor' ? { ...p, flipped: true } : p));
  check('backwards: turning both round goes forwards again', !checkGoals(both, backwards.goals)[0].met);
}

// ---- "Gentle breeze": a resistor slows the fan ----
{
  const motorSpeed = (pieces: Piece[]) => simulate(boardToLayout(pieces)).readings['start-motor'].speed ?? 0;
  check('breeze: the start fan is too fast for the papers', !checkGoals(gentleBreeze.start, gentleBreeze.goals)[1].met && checkGoals(gentleBreeze.start, gentleBreeze.goals)[0].met);
  const withResistor = [
    ...gentleBreeze.start.filter(p => !(p.kind === 'wire' && p.at.r === 3 && p.at.c < 2)),
    piece('resistor', 0, 3, 'h'),
  ];
  check('breeze: the answer fits the board', withResistor.every((p, i) => canPlace(withResistor.slice(0, i), p, gentleBreeze.board)));
  const slow = motorSpeed(withResistor);
  check('breeze: the resistor slows the fan to a quarter speed', Math.abs(slow - 0.25) < 0.02, `${slow}`);
  check('breeze: with the resistor every goal is met', checkGoals(withResistor, gentleBreeze.goals).every(g => g.met));
  check('breeze: a "max speed" goal fails when too fast', !checkGoals(solution(), [{ kind: 'motor-spins', text: '', maxSpeed: 0.35 }])[0].met);
}

// ---- "Does it conduct?": metals light the torch, the rest don't ----
{
  const gap = doesItConduct.testGap!;
  const bulb = (pieces: Piece[]) => simulate(boardToLayout(pieces)).readings['torch-bulb'].brightness ?? 0;
  check('conduct: the torch starts dark', bulb(doesItConduct.start) < 0.01);
  check('conduct: the test gap is free', canPlace(doesItConduct.start, { kind: 'coin', ...gap }, doesItConduct.board));
  check('conduct: everything at the start is fixed', doesItConduct.start.every(p => p.fixed));
  for (const kind of Object.keys(THINGS) as ThingKind[]) {
    const pieces = [...doesItConduct.start, piece(kind, gap.at.c, gap.at.r, gap.dir)];
    const lit = bulb(pieces) > 0.5;
    check(`conduct: the ${kind} ${THINGS[kind].conducts ? 'lights' : 'doesn’t light'} the torch`, lit === THINGS[kind].conducts);
    check(`conduct: the ${kind} in the gap counts as tested`, testedThings(pieces).some(p => p.kind === kind));
    const text = kidsFeedback(pieces, simulate(boardToLayout(pieces))).text;
    check(`conduct: feedback names the ${kind} as ${THINGS[kind].conducts ? 'a conductor' : 'an insulator'}`,
      text.includes(THINGS[kind].conducts ? 'a conductor' : 'an insulator') && text.includes(THINGS[kind].material), text);
  }
  const elsewhere = [...doesItConduct.start, piece('coin', 1, 1, 'h')];
  check('conduct: a thing away from the loop isn’t tested', testedThings(elsewhere).length === 0);

  const withCoin = [...doesItConduct.start, piece('coin', gap.at.c, gap.at.r, gap.dir)];
  const some = new Set<ThingKind>(['coin', 'eraser']);
  const all = new Set(Object.keys(THINGS) as ThingKind[]);
  check('conduct: torch lit but not all tested: not done', !checkGoals(withCoin, doesItConduct.goals, undefined, some).every(g => g.met));
  check('conduct: all tested and the torch lit: done', checkGoals(withCoin, doesItConduct.goals, undefined, all).every(g => g.met));
  const withEraser = [...doesItConduct.start, piece('eraser', gap.at.c, gap.at.r, gap.dir)];
  check('conduct: all tested but an insulator in the gap: not done', !checkGoals(withEraser, doesItConduct.goals, undefined, all).every(g => g.met));
}

// ---- Content checks ----
for (const m of CIRCUIT_MISSIONS) {
  if (m.kind !== 'circuit') continue;
  check(`${m.id}: start pieces fit`, m.start.every((p, i) => canPlace(m.start.slice(0, i), p, m.board)));
  check(`${m.id}: start is not already solved`, !checkGoals(m.start, m.goals).every(g => g.met));
  check(`${m.id}: has goals`, m.goals.length > 0);
}

console.log(fails ? `${fails} board checks FAILED, ${passes} passed` : `all ${passes} board checks passed`);
if (fails) process.exit(1);
