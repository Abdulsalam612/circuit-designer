import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'voltage-current-resistance',
  level: 0,
  title: 'Voltage, current and resistance',
  description: 'The three ideas behind every circuit, explained with water pipes, plus Ohm\'s law.',
  minutes: 15,
  points: 60,
  steps: [
    {
      kind: 'read',
      title: 'Think of water in pipes',
      blocks: [
        { type: 'text', text: 'Electricity is invisible, so it helps to picture water flowing through pipes.' },
        {
          type: 'table',
          headers: ['Electricity', 'Water picture', 'Unit'],
          rows: [
            ['**Voltage** (V)', 'The pressure pushing the water', 'volts (V)'],
            ['**Current** (I)', 'How much water flows past each second', 'amps (A)'],
            ['**Resistance** (R)', 'How narrow the pipe is', 'ohms (Ω)'],
          ],
        },
        { type: 'text', text: 'A battery is like a pump: it creates the pressure (voltage). A narrow pipe (a high resistance) lets less water through for the same pressure.' },
        { type: 'callout', tone: 'tip', text: 'Small currents are often written in **milliamps**: 1 mA = 0.001 A. An LED usually needs about 10–20 mA.' },
      ],
    },
    {
      kind: 'read',
      title: 'Ohm\'s law',
      blocks: [
        { type: 'text', text: 'The three are linked by one simple rule, discovered by Georg Ohm in 1827:' },
        { type: 'formula', text: 'V = I × R', caption: 'voltage = current × resistance' },
        { type: 'text', text: 'Rearranged, **I = V ÷ R**: more voltage means more current, more resistance means less current.' },
        { type: 'callout', tone: 'info', text: 'Example: a 9 V battery across a 1 kΩ (1000 Ω) resistor gives I = 9 ÷ 1000 = 0.009 A, which is **9 mA**. You can check this in the simulator: hover over a part while it runs to see its readings.' },
      ],
    },
    {
      kind: 'quiz',
      title: 'Check your understanding',
      questions: [
        {
          prompt: 'In the water picture, what is voltage like?',
          options: ['The width of the pipe', 'The pressure pushing the water', 'The amount of water in the tank', 'The colour of the water'],
          answer: 1,
          explanation: 'Voltage is the "push". Current is the flow, and resistance is how narrow the pipe is.',
        },
        {
          prompt: 'What is the unit of resistance?',
          options: ['Volts', 'Amps', 'Ohms', 'Watts'],
          answer: 2,
          explanation: 'Resistance is measured in ohms, written Ω.',
        },
        {
          prompt: 'A 6 V battery is connected across a 2 Ω resistor. What current flows?',
          options: ['12 A', '3 A', '0.33 A', '8 A'],
          answer: 1,
          explanation: 'I = V ÷ R = 6 ÷ 2 = 3 A.',
        },
        {
          prompt: 'You swap a resistor for one with a higher resistance. What happens to the current?',
          options: ['It goes up', 'It stays the same', 'It goes down', 'It reverses direction'],
          answer: 2,
          explanation: 'With the same voltage, a bigger R means a smaller I (I = V ÷ R).',
        },
      ],
    },
  ],
};

export default lesson;
