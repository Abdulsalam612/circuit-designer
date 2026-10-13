import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'resistors',
  level: 1,
  title: 'Resistors',
  description: 'What resistors do, how to read their colour bands, and how to set a current.',
  minutes: 15,
  points: 80,
  steps: [
    {
      kind: 'read',
      title: 'What a resistor does',
      blocks: [
        { type: 'parts', parts: [{ part: 'resistor', text: 'A resistor limits how much current flows. Its value is in ohms (Ω).' }] },
        { type: 'text', text: 'Resistors are the most common part in electronics. They protect delicate parts (like LEDs) from too much current, and set voltages and currents to the values a circuit needs.' },
        { type: 'text', text: 'Values are often written with prefixes: **k** means thousand and **M** means million. So 4.7 kΩ = 4700 Ω, and engineers often write it as **4k7**.' },
        { type: 'callout', tone: 'tip', text: 'In the editor, click a resistor and type a new value in the Properties panel: "330", "4.7k", "4k7" and "1M" all work.' },
      ],
    },
    {
      kind: 'read',
      title: 'Reading the colour bands',
      blocks: [
        { type: 'text', text: 'Real resistors are too small to print numbers on, so they use coloured bands. On a 4-band resistor: **band 1** and **band 2** are digits, **band 3** is how many zeros to add, and **band 4** (often gold) is the tolerance.' },
        {
          type: 'table',
          headers: ['Colour', 'Digit', 'Multiplier'],
          rows: [
            ['Black', '0', '×1'],
            ['Brown', '1', '×10'],
            ['Red', '2', '×100'],
            ['Orange', '3', '×1 000'],
            ['Yellow', '4', '×10 000'],
            ['Green', '5', '×100 000'],
            ['Blue', '6', '×1 000 000'],
            ['Violet', '7', ''],
            ['Grey', '8', ''],
            ['White', '9', ''],
          ],
        },
        { type: 'callout', tone: 'info', text: 'Example: **brown, black, red, gold** = 1, 0, then ×100 → 10 × 100 = **1000 Ω (1 kΩ)**, ±5%.' },
        { type: 'text', text: 'A handy way to remember the order: **B**ig **B**rown **R**abbits **O**ften **Y**awn **G**ently **B**y **V**iolet **G**ardens **W**eekly.' },
      ],
    },
    {
      kind: 'quiz',
      title: 'Colour code practice',
      questions: [
        {
          prompt: 'What value is red, red, brown?',
          options: ['22 Ω', '220 Ω', '2.2 kΩ', '122 Ω'],
          answer: 1,
          explanation: 'Red = 2, red = 2, brown = ×10 → 22 × 10 = 220 Ω.',
        },
        {
          prompt: 'What value is yellow, violet, red?',
          options: ['470 Ω', '4.7 kΩ', '47 kΩ', '472 Ω'],
          answer: 1,
          explanation: 'Yellow = 4, violet = 7, red = ×100 → 47 × 100 = 4700 Ω = 4.7 kΩ.',
        },
        {
          prompt: 'What does "10k" mean on a resistor?',
          options: ['10 Ω', '1 000 Ω', '10 000 Ω', '10 000 000 Ω'],
          answer: 2,
          explanation: 'k means thousand, so 10k = 10 000 Ω.',
        },
      ],
    },
    {
      kind: 'challenge',
      title: 'Set the current to 3 mA',
      instructions: 'Build a loop with the 9 V battery and one resistor. Then change the resistor\'s value so that **about 3 mA** flows through it. Use Ohm\'s law (R = V ÷ I) to work out the value, then press **Run** and hover over the resistor to check.',
      parts: ['battery', 'resistor'],
      goals: [
        { kind: 'uses', part: 'battery', text: 'Use a battery' },
        { kind: 'uses', part: 'resistor', text: 'Use a resistor' },
        { kind: 'current', part: 'resistor', min: 0.0027, max: 0.0033, text: 'About 3 mA flows through the resistor (2.7–3.3 mA)' },
      ],
      hints: [
        'R = V ÷ I = 9 V ÷ 0.003 A.',
        'That works out at 3000 Ω. Type "3k" into the resistor\'s value box.',
      ],
    },
  ],
};

export default lesson;
