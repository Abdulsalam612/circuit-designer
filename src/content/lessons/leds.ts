import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'leds',
  level: 1,
  title: 'LEDs',
  description: 'Why LEDs only work one way round, and how to keep them from burning out.',
  minutes: 15,
  points: 100,
  steps: [
    {
      kind: 'read',
      title: 'Light that only flows one way',
      blocks: [
        { type: 'parts', parts: [{ part: 'led', text: 'A light-emitting diode. Current can only flow through it in one direction.' }] },
        { type: 'text', text: 'An LED has two legs: the **anode (+)**, usually the longer leg, and the **cathode (−)**, the shorter leg next to a flat edge on the case. Current must flow **into the anode and out of the cathode**.' },
        { type: 'text', text: 'Put it in backwards and it simply stays dark. That is **polarity**: the part has a right way round.' },
        { type: 'callout', tone: 'tip', text: 'In CirKit the LED\'s anode is its first end (on the left before you rotate it). If it is the wrong way round, select it and press **Flip direction** in the Properties panel.' },
      ],
    },
    {
      kind: 'read',
      title: 'Voltage drop and the resistor',
      blocks: [
        { type: 'text', text: 'An LED needs a minimum voltage before it lights, called its **forward voltage** (about 2 V for a red LED, 3 V for blue or white). Once it is on, it barely resists current at all.' },
        { type: 'text', text: 'So if you connect an LED straight to a 9 V battery, far too much current flows and it burns out. A **resistor in series** limits the current to a safe 10–20 mA.' },
        { type: 'formula', text: 'R = (battery V − LED V) ÷ I', caption: 'the resistor takes the voltage the LED does not use' },
        { type: 'callout', tone: 'info', text: 'Example: 9 V battery, 2 V LED, 15 mA wanted → R = (9 − 2) ÷ 0.015 ≈ **470 Ω**.' },
      ],
    },
    {
      kind: 'challenge',
      title: 'Light an LED safely',
      instructions: 'Build a circuit where the LED lights up **without being overloaded**. You\'ll need the battery, the LED and a resistor all in one loop, with the LED the right way round. Press **Run** to test it, then **Check my circuit**.',
      parts: ['battery', 'led', 'resistor'],
      goals: [
        { kind: 'lit', part: 'led', text: 'The LED is lit' },
        { kind: 'uses', part: 'resistor', text: 'A resistor protects the LED' },
        { kind: 'current', part: 'led', min: 0.005, max: 0.025, text: 'The LED current is safe (5–25 mA)' },
        { kind: 'no-warning', warnings: ['led-overload', 'short-circuit'], text: 'Nothing is overloaded or shorted' },
      ],
      hints: [
        'Go round the loop: battery + → resistor → LED anode (left end) → LED cathode → battery −.',
        'If the LED stays dark, it may be backwards: select it and press Flip direction.',
        'Around 470 Ω gives about 15 mA. The default 1 kΩ also works (about 7 mA).',
      ],
    },
    {
      kind: 'quiz',
      title: 'LED check',
      questions: [
        {
          prompt: 'Which leg of an LED is the anode (+)?',
          options: ['The shorter leg', 'The longer leg', 'Either, it doesn\'t matter', 'The one next to the flat edge'],
          answer: 1,
          explanation: 'The longer leg is the anode. The flat edge marks the cathode (−).',
        },
        {
          prompt: 'What happens if you connect an LED backwards?',
          options: ['It glows a different colour', 'It stays dark', 'It glows brighter', 'It explodes instantly'],
          answer: 1,
          explanation: 'Current can only flow one way through an LED, so backwards means no current and no light.',
        },
        {
          prompt: 'Why does an LED need a resistor?',
          options: ['To change its colour', 'To limit the current so it doesn\'t burn out', 'To make it flash', 'It doesn\'t need one'],
          answer: 1,
          explanation: 'Once lit, an LED barely resists current, so a resistor keeps the current safe.',
        },
      ],
    },
  ],
};

export default lesson;
