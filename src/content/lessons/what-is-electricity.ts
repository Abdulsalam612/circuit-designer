import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'what-is-electricity',
  level: 0,
  title: 'What is electricity?',
  description: 'Where electricity comes from, what a circuit is, and your first glowing lamp.',
  minutes: 10,
  points: 50,
  steps: [
    {
      kind: 'read',
      title: 'Tiny charges on the move',
      blocks: [
        { type: 'text', text: 'Everything is made of atoms, and atoms contain even smaller particles called **electrons**. Electrons carry a tiny **electric charge**.' },
        { type: 'text', text: 'In metals like copper, some electrons are free to drift from atom to atom. When lots of them move in the same direction, we call that flow an **electric current**. That is electricity doing work: lighting a bulb, spinning a motor, charging your phone.' },
        { type: 'callout', tone: 'info', text: 'Materials that let charge flow easily (copper, aluminium, gold) are **conductors**. Materials that block it (plastic, rubber, glass) are **insulators**. Wires are a conductor wrapped in an insulator.' },
      ],
    },
    {
      kind: 'read',
      title: 'Circuits are loops',
      blocks: [
        { type: 'text', text: 'Charge only keeps flowing if it has a complete path to travel around: out of the battery, through the parts, and back into the battery. That loop is called a **circuit**.' },
        { type: 'text', text: 'If there is a gap anywhere in the loop, the flow stops everywhere. That is an **open circuit**. A light switch works exactly like this: it opens or closes a gap.' },
        {
          type: 'parts',
          parts: [
            { part: 'battery', text: 'Pushes charge around the circuit. The **+** end is marked in red.' },
            { part: 'lamp', text: 'Glows when current flows through it.' },
            { part: 'switch', text: 'Opens or closes a gap in the loop.' },
          ],
        },
      ],
    },
    {
      kind: 'challenge',
      title: 'Light the lamp',
      instructions: 'Drag a battery and a lamp onto the board, then draw wires (drag from the end of a part) so they make one complete loop. Press **Run** to watch the current flow, then **Check my circuit**.',
      parts: ['battery', 'lamp', 'switch'],
      goals: [
        { kind: 'uses', part: 'battery', text: 'Use a battery' },
        { kind: 'lit', part: 'lamp', text: 'The lamp is glowing' },
        { kind: 'no-warning', warnings: ['short-circuit'], text: 'No short circuit' },
      ],
      hints: [
        'Each part has two ends. Connect one end of the lamp to the battery\'s + end and the other end to its − end.',
        'If you added a switch, click it and set it to Closed in the Properties panel.',
      ],
    },
    {
      kind: 'quiz',
      title: 'Quick check',
      questions: [
        {
          prompt: 'What is an electric current?',
          options: ['A flow of electric charge', 'Heat inside a wire', 'The colour of a wire', 'A type of battery'],
          answer: 0,
          explanation: 'Current is charge (electrons) flowing in the same direction through a conductor.',
        },
        {
          prompt: 'Your lamp is wired to a battery but one wire is missing. What happens?',
          options: ['The lamp glows at half brightness', 'Nothing: the loop is open, so no current flows', 'The battery gets hotter', 'The lamp flickers'],
          answer: 1,
          explanation: 'Current needs a complete loop. Any gap stops it everywhere in the circuit.',
        },
        {
          prompt: 'Which of these is an insulator?',
          options: ['Copper', 'Aluminium', 'Rubber', 'Gold'],
          answer: 2,
          explanation: 'Rubber blocks the flow of charge, which is why it is used to cover wires and tools.',
        },
      ],
    },
  ],
};

export default lesson;
