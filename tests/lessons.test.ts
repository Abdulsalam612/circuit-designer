// Checks the lesson content is well-formed and that challenge goals are judged correctly.
// Run with: npm test
import { LESSONS, LEVELS } from '../src/content/lessons';
import { checkChallenge, getLesson, lessonState, nextLesson } from '../src/lib/lessons';
import { isLayoutValid } from '../src/lib/wires';
import type { CircuitComponent, CircuitLayout, ComponentType } from '../src/types/circuit';
import type { ChallengeStep } from '../src/types/lesson';

let fails = 0, passes = 0;
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passes++;
  else { fails++; console.log('FAIL', name, detail); }
};

// ---- Content ----

const ids = LESSONS.map(l => l.id);
check('lesson ids unique', new Set(ids).size === ids.length, ids.join(','));
for (const lesson of LESSONS) {
  check(`${lesson.id}: url-safe id`, /^[a-z0-9-]+$/.test(lesson.id));
  check(`${lesson.id}: level exists`, LEVELS.some(l => l.level === lesson.level));
  check(`${lesson.id}: has steps`, lesson.steps.length > 0);
  check(`${lesson.id}: points and minutes`, lesson.points > 0 && lesson.minutes > 0);
  lesson.steps.forEach((step, i) => {
    const where = `${lesson.id} step ${i + 1}`;
    if (step.kind === 'quiz') {
      check(`${where}: has questions`, step.questions.length > 0);
      step.questions.forEach((q, j) =>
        check(`${where} q${j + 1}: answer is an option`, q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length));
    }
    if (step.kind === 'challenge') {
      check(`${where}: has goals and parts`, step.goals.length > 0 && step.parts.length > 0);
      if (step.start) {
        check(`${where}: start layout valid`, isLayoutValid(step.start.components, step.start.wires));
        // A challenge mustn't be solved before the learner does anything
        check(`${where}: start isn't already solved`, !checkChallenge(step.start, step.goals).every(r => r.passed));
      }
      // Every part a goal needs can be added from the sidebar (or is already there)
      for (const goal of step.goals) {
        if (!('part' in goal)) continue;
        const available = step.parts.includes(goal.part) || !!step.start?.components.some(c => c.type === goal.part);
        check(`${where}: ${goal.part} available`, available);
      }
    }
  });
}
// Lessons stay grouped by level, in order
check('levels in order', LESSONS.every((l, i) => i === 0 || l.level >= LESSONS[i - 1].level));

// ---- Unlocking ----

const none = new Set<string>();
check('first lesson open', lessonState(LESSONS[0].id, none) === 'available');
check('second lesson locked', lessonState(LESSONS[1].id, none) === 'locked');
check('second unlocks after first', lessonState(LESSONS[1].id, new Set([LESSONS[0].id])) === 'available');
check('completed stays open', lessonState(LESSONS[3].id, new Set([LESSONS[3].id])) === 'completed');
check('unknown lesson locked', lessonState('nope', none) === 'locked');
check('next lesson', nextLesson(new Set([LESSONS[0].id]))?.id === LESSONS[1].id);
check('course finished', nextLesson(new Set(ids)) === null);

// ---- Challenge goals ----

let n = 0;
const id = (t: string) => `${t}-${n++}`;
const part = (type: ComponentType, x: number, y: number, value?: number, rotation = 0): CircuitComponent =>
  ({ id: id(type), type, x, y, rotation, ...(value !== undefined ? { value } : {}) });
const wire = (x1: number, y1: number, x2: number, y2: number) => ({ id: id('w'), x1, y1, x2, y2 });
// Battery on the bottom row (+ at x=60), the given parts in a chain on the top row
const loop = (top: [ComponentType, number?][]): CircuitLayout => {
  const parts = top.map(([t, v], i) => part(t, 100 + 80 * i, 0, v));
  const rightEnd = 60 + 80 * top.length;
  return {
    components: [part('battery', 100, 200, 9), ...parts],
    wires: [wire(60, 200, 60, 0), wire(140, 200, rightEnd, 200), wire(rightEnd, 200, rightEnd, 0)],
  };
};
const challenge = (lessonId: string) => getLesson(lessonId)!.steps.find((s): s is ChallengeStep => s.kind === 'challenge')!;
const solves = (lessonId: string, layout: CircuitLayout) => checkChallenge(layout, challenge(lessonId).goals).every(r => r.passed);
const failed = (lessonId: string, layout: CircuitLayout) =>
  checkChallenge(layout, challenge(lessonId).goals).filter(r => !r.passed).map(r => r.goal.text);

// Light the lamp
check('lamp loop solves', solves('what-is-electricity', loop([['lamp', 100]])), failed('what-is-electricity', loop([['lamp', 100]])).join('; '));
check('empty board fails', !solves('what-is-electricity', { components: [], wires: [] }));
check('open switch fails', !solves('what-is-electricity', loop([['lamp', 100], ['switch']])));

// 3 mA through a resistor
check('3k solves', solves('resistors', loop([['resistor', 3000]])), failed('resistors', loop([['resistor', 3000]])).join('; '));
check('1k fails', !solves('resistors', loop([['resistor', 1000]])));

// LED safely
check('led + 1k solves', solves('leds', loop([['led', 2], ['resistor', 1000]])), failed('leds', loop([['led', 2], ['resistor', 1000]])).join('; '));
check('led alone fails', !solves('leds', loop([['led', 2]])));
{
  const reversed = loop([['led', 2], ['resistor', 1000]]);
  reversed.components[1].rotation = 180; // LED backwards (same ends, swapped)
  check('reversed led fails', !solves('leds', reversed));
}

// Series vs parallel
const series = loop([['lamp', 100], ['lamp', 100]]);
const parallel: CircuitLayout = {
  components: [part('battery', 100, 200, 9), part('lamp', 100, 0, 100), part('lamp', 100, -80, 100)],
  wires: [wire(60, 200, 60, 0), wire(60, 0, 60, -80), wire(140, 200, 140, 0), wire(140, 0, 140, -80)],
};
check('series layout valid', isLayoutValid(series.components, series.wires));
check('parallel layout valid', isLayoutValid(parallel.components, parallel.wires));
check('series solves series', solves('series-circuits', series), failed('series-circuits', series).join('; '));
check('parallel fails series', !solves('series-circuits', parallel));
check('parallel solves parallel', solves('parallel-circuits', parallel), failed('parallel-circuits', parallel).join('; '));
check('series fails parallel', !solves('parallel-circuits', series));
// Lamps in one loop with a switch between them are still in series
{
  const withSwitch = loop([['lamp', 100], ['switch'], ['lamp', 100]]);
  withSwitch.components[2].closed = true;
  check('series through a closed switch', solves('series-circuits', withSwitch), failed('series-circuits', withSwitch).join('; '));
}

// Fix the circuit: flip the LED and put a resistor in the right-hand wire
{
  const fixed: CircuitLayout = {
    components: [
      { id: 'b', type: 'battery', x: 300, y: 320, rotation: 0, value: 9 },
      { id: 'l', type: 'led', x: 300, y: 160, rotation: 0, value: 2 },
      { id: 'r', type: 'resistor', x: 340, y: 240, rotation: 90, value: 1000 },
    ],
    wires: [wire(260, 320, 260, 160), wire(340, 320, 340, 280), wire(340, 200, 340, 160)],
  };
  check('fixed layout valid', isLayoutValid(fixed.components, fixed.wires));
  check('fixed circuit solves', solves('fix-the-circuit', fixed), failed('fix-the-circuit', fixed).join('; '));
}

console.log(fails ? `${fails} lesson checks FAILED, ${passes} passed` : `all ${passes} lesson checks passed`);
if (fails) process.exit(1);
