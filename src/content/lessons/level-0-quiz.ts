import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'level-0-quiz',
  level: 0,
  title: 'Level 0 quiz',
  description: 'Show what you know about electricity, circuits and safety to finish Level 0.',
  minutes: 5,
  points: 75,
  steps: [
    {
      kind: 'quiz',
      title: 'Identify the basic concepts',
      questions: [
        {
          prompt: 'Which word means "the push that makes charge flow"?',
          options: ['Current', 'Voltage', 'Resistance', 'Power'],
          answer: 1,
          explanation: 'Voltage is the push (like water pressure). It is measured in volts.',
        },
        {
          prompt: 'Which word means "how much charge flows each second"?',
          options: ['Current', 'Voltage', 'Resistance', 'Charge'],
          answer: 0,
          explanation: 'Current is the rate of flow, measured in amps.',
        },
        {
          prompt: 'Which word means "how much a part opposes the flow"?',
          options: ['Current', 'Voltage', 'Resistance', 'Conductance'],
          answer: 2,
          explanation: 'Resistance opposes current and is measured in ohms (Ω).',
        },
        {
          prompt: 'Why does a lamp go out when you open a switch?',
          options: ['The switch uses up all the energy', 'The loop is broken, so current stops everywhere', 'The battery turns off', 'The lamp cools down'],
          answer: 1,
          explanation: 'Current needs a complete loop. Opening the switch makes a gap.',
        },
        {
          prompt: 'A 12 V battery drives 0.5 A through a lamp. What is the lamp\'s resistance?',
          options: ['6 Ω', '24 Ω', '12.5 Ω', '0.04 Ω'],
          answer: 1,
          explanation: 'R = V ÷ I = 12 ÷ 0.5 = 24 Ω.',
        },
        {
          prompt: 'Which of these is safe to practise with?',
          options: ['A wall socket', 'A 9 V battery', 'A car battery shorted with a spanner', 'An extension lead'],
          answer: 1,
          explanation: 'Small batteries are the right way to practise. Never experiment with mains.',
        },
      ],
    },
  ],
};

export default lesson;
