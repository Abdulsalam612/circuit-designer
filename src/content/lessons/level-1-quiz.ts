import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'level-1-quiz',
  level: 1,
  title: 'Level 1 quiz',
  description: 'Match each component to what it does to finish Level 1.',
  minutes: 5,
  points: 75,
  steps: [
    {
      kind: 'read',
      title: 'Your toolbox so far',
      blocks: [
        {
          type: 'parts',
          parts: [
            { part: 'battery', text: 'Battery' },
            { part: 'resistor', text: 'Resistor' },
            { part: 'capacitor', text: 'Capacitor' },
            { part: 'led', text: 'LED' },
            { part: 'switch', text: 'Switch' },
            { part: 'lamp', text: 'Lamp' },
          ],
        },
        { type: 'text', text: 'For each question, pick the component that matches the job.' },
      ],
    },
    {
      kind: 'quiz',
      title: 'Match the component to its function',
      questions: [
        {
          prompt: 'Limits the current in a circuit',
          options: ['Battery', 'Resistor', 'Capacitor', 'Switch'],
          answer: 1,
          explanation: 'A resistor opposes current. Its value in ohms sets how much.',
        },
        {
          prompt: 'Stores charge and releases it later',
          options: ['Capacitor', 'Lamp', 'Resistor', 'LED'],
          answer: 0,
          explanation: 'A capacitor stores charge on its plates.',
        },
        {
          prompt: 'Gives light, but only when current flows the right way',
          options: ['Lamp', 'LED', 'Switch', 'Battery'],
          answer: 1,
          explanation: 'An LED is a diode: it only conducts (and lights) one way round.',
        },
        {
          prompt: 'Provides the voltage that pushes current around',
          options: ['Resistor', 'Capacitor', 'Battery', 'LED'],
          answer: 2,
          explanation: 'The battery is the "pump" of the circuit.',
        },
        {
          prompt: 'Opens or closes a gap in the circuit',
          options: ['Switch', 'Capacitor', 'Resistor', 'Lamp'],
          answer: 0,
          explanation: 'A switch breaks or completes the loop.',
        },
        {
          prompt: 'A 9 V battery drives a 2 V LED at 20 mA. Which resistor is closest to right?',
          options: ['35 Ω', '350 Ω', '3.5 kΩ', '35 kΩ'],
          answer: 1,
          explanation: 'R = (9 − 2) ÷ 0.02 = 350 Ω.',
        },
      ],
    },
  ],
};

export default lesson;
