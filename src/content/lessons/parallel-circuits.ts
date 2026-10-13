import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'parallel-circuits',
  level: 2,
  title: 'Parallel circuits',
  description: 'Side-by-side branches: the full voltage for every part, and the current split up.',
  minutes: 15,
  points: 100,
  steps: [
    {
      kind: 'read',
      title: 'Many paths, same voltage',
      blocks: [
        { type: 'text', text: 'When parts are connected **side by side, across the same two points**, they are **in parallel**. Each part gets its own branch.' },
        { type: 'text', text: 'Every branch gets the **full battery voltage**, so two identical lamps in parallel each glow as brightly as one lamp alone. The battery\'s current **splits** between the branches and joins back up afterwards.' },
        {
          type: 'table',
          headers: ['', 'Series', 'Parallel'],
          rows: [
            ['Current', 'Same through every part', 'Splits between branches'],
            ['Voltage', 'Shared between parts', 'Full voltage on every branch'],
            ['Adding a lamp', 'All lamps get dimmer', 'Others stay just as bright'],
            ['One lamp breaks', 'Everything goes out', 'The others keep working'],
          ],
        },
        { type: 'callout', tone: 'warning', text: 'The catch: each extra branch draws more current, so the battery runs down faster.' },
      ],
    },
    {
      kind: 'challenge',
      title: 'Two lamps in parallel',
      instructions: 'Connect **two lamps in parallel**: both lamps connected across the same two points, so each has its own path back to the battery. Run it and compare the brightness with the series circuit from the last lesson.',
      parts: ['battery', 'lamp'],
      goals: [
        { kind: 'uses', part: 'lamp', count: 2, text: 'Use two lamps' },
        { kind: 'parallel', part: 'lamp', count: 2, text: 'The lamps are in parallel (side by side)' },
        { kind: 'lit', part: 'lamp', count: 2, text: 'Both lamps glow' },
        { kind: 'no-warning', warnings: ['short-circuit'], text: 'No short circuit' },
      ],
      hints: [
        'Place the two lamps one above the other.',
        'Wire both left ends together and to one end of the battery, then both right ends together and to the other end.',
      ],
    },
    {
      kind: 'quiz',
      title: 'Parallel check',
      questions: [
        {
          prompt: 'Two identical lamps are in parallel on a 9 V battery. What voltage does each lamp get?',
          options: ['4.5 V', '9 V', '18 V', '0 V'],
          answer: 1,
          explanation: 'Every parallel branch gets the full battery voltage.',
        },
        {
          prompt: 'One branch carries 0.2 A and the other 0.3 A. How much current leaves the battery?',
          options: ['0.1 A', '0.25 A', '0.5 A', '0.06 A'],
          answer: 2,
          explanation: 'The branch currents add up: 0.2 + 0.3 = 0.5 A.',
        },
        {
          prompt: 'One lamp in a parallel circuit breaks. What happens to the others?',
          options: ['They all go out', 'They keep glowing', 'They get much dimmer', 'They flicker'],
          answer: 1,
          explanation: 'Each branch has its own path, so the others are unaffected.',
        },
      ],
    },
  ],
};

export default lesson;
