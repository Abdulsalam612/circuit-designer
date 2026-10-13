import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'series-circuits',
  level: 2,
  title: 'Series circuits',
  description: 'Parts in a single line: one path for the current, and the voltage shared out.',
  minutes: 15,
  points: 100,
  steps: [
    {
      kind: 'read',
      title: 'One path, one current',
      blocks: [
        { type: 'text', text: 'When parts are connected **end to end in a single loop**, they are **in series**. There is only one path, so **the same current flows through every part**.' },
        { type: 'text', text: 'The battery\'s voltage is **shared** between the parts. Two identical lamps in series on a 9 V battery get 4.5 V each, so each one glows more dimly than a single lamp would.' },
        {
          type: 'list',
          items: [
            'Total resistance adds up: **R_total = R1 + R2 + …**',
            'Same current everywhere in the loop.',
            'Voltages across the parts add up to the battery voltage.',
            'If one part breaks (or you open a switch), the whole loop stops.',
          ],
        },
      ],
    },
    {
      kind: 'challenge',
      title: 'Two lamps in series',
      instructions: 'Connect **two lamps in series** with the battery: battery → lamp → lamp → back to the battery, all in one loop. Run it and hover over each lamp. Notice they share the voltage and glow less brightly than one lamp on its own.',
      parts: ['battery', 'lamp'],
      goals: [
        { kind: 'uses', part: 'lamp', count: 2, text: 'Use two lamps' },
        { kind: 'series', part: 'lamp', count: 2, text: 'The lamps are in series (one after the other)' },
        { kind: 'lit', part: 'lamp', count: 2, text: 'Both lamps glow' },
        { kind: 'no-warning', warnings: ['short-circuit'], text: 'No short circuit' },
      ],
      hints: [
        'Join the end of the first lamp straight to the start of the second lamp, with nothing else connected at that point.',
        'Then connect the free end of each lamp to a different end of the battery.',
      ],
    },
    {
      kind: 'quiz',
      title: 'Series check',
      questions: [
        {
          prompt: 'Three parts are in series. What can you say about the current through them?',
          options: ['It is the same through all three', 'The first part gets the most', 'It splits three ways', 'It is zero'],
          answer: 0,
          explanation: 'In series there is only one path, so the current is the same everywhere.',
        },
        {
          prompt: 'A 100 Ω and a 200 Ω resistor are in series. What is the total resistance?',
          options: ['67 Ω', '100 Ω', '200 Ω', '300 Ω'],
          answer: 3,
          explanation: 'In series, resistances add: 100 + 200 = 300 Ω.',
        },
        {
          prompt: 'One of two lamps in series burns out. What happens to the other?',
          options: ['It gets brighter', 'It stays the same', 'It goes out too', 'It flickers'],
          answer: 2,
          explanation: 'The broken lamp opens the only path, so current stops everywhere.',
        },
      ],
    },
  ],
};

export default lesson;
