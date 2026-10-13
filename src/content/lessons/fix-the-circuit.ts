import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'fix-the-circuit',
  level: 2,
  title: 'Challenge: fix the circuit',
  description: 'Someone built an LED circuit that doesn\'t work. Find the problems and fix them.',
  minutes: 15,
  points: 150,
  steps: [
    {
      kind: 'read',
      title: 'Be the circuit doctor',
      blocks: [
        { type: 'text', text: 'Engineers spend a lot of time **debugging**: working out why a circuit doesn\'t do what it should. A good approach:' },
        {
          type: 'list',
          items: [
            '**Run it** and look at the warnings. CirKit marks problem parts with an amber outline.',
            '**Follow the loop** from the battery\'s + end round to its − end. Is it complete?',
            '**Check polarity**: are batteries and LEDs the right way round?',
            '**Check values**: will the current be safe? Use Ohm\'s law.',
          ],
        },
      ],
    },
    {
      kind: 'challenge',
      title: 'Fix the broken LED circuit',
      instructions: 'This circuit should light the LED, but it doesn\'t. There are **two** problems. Find and fix them so the LED glows safely. You can move parts, delete wires, flip parts and add new ones.',
      parts: ['battery', 'led', 'resistor'],
      // Battery + on the left; the LED is backwards (anode on the right) and there is no resistor
      start: {
        components: [
          { id: 'fix-battery', type: 'battery', x: 300, y: 320, rotation: 0, value: 9 },
          { id: 'fix-led', type: 'led', x: 300, y: 160, rotation: 180, value: 2 },
        ],
        wires: [
          { id: 'fix-w1', x1: 260, y1: 320, x2: 260, y2: 160 },
          { id: 'fix-w2', x1: 340, y1: 320, x2: 340, y2: 160 },
        ],
      },
      goals: [
        { kind: 'lit', part: 'led', text: 'The LED is lit' },
        { kind: 'uses', part: 'resistor', text: 'A resistor protects the LED' },
        { kind: 'current', part: 'led', min: 0.005, max: 0.025, text: 'The LED current is safe (5–25 mA)' },
        { kind: 'no-warning', warnings: ['led-overload', 'led-reversed', 'short-circuit'], text: 'No warnings about the LED' },
      ],
      hints: [
        'Press Run: the LED is dark. Which way round is it? Its anode (+) must connect towards the battery\'s + end.',
        'Select the LED and press Flip direction. Now what would happen with no resistor?',
        'Delete one of the wires, add a resistor in its place, and wire it into the loop.',
      ],
    },
  ],
};

export default lesson;
