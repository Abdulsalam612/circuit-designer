import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'staying-safe',
  level: 0,
  title: 'Staying safe',
  description: 'The safety rules to follow before you build anything with real parts.',
  minutes: 8,
  points: 40,
  steps: [
    {
      kind: 'read',
      title: 'Safe in the simulator, careful in real life',
      blocks: [
        { type: 'text', text: 'Nothing in CirKit can hurt you, so experiment as much as you like. Real circuits are different: even small batteries can get hot, and mains electricity can kill.' },
        { type: 'callout', tone: 'warning', text: '**Never** experiment with mains sockets or anything that plugs into the wall. Stick to small batteries (1.5 V–9 V) for practice circuits.' },
        {
          type: 'list',
          items: [
            '**Avoid short circuits.** Connecting a battery\'s + and − directly with a wire makes a huge current flow. The wire and battery get hot fast and the battery can leak or burst.',
            '**Disconnect the power before changing a circuit.** Take the battery out, change things, then reconnect.',
            '**Keep things dry.** Water conducts electricity, so keep drinks away and work with dry hands.',
            '**Watch for heat or smells.** If a part gets hot or smells burnt, disconnect the battery straight away.',
            '**Use a resistor with LEDs.** Without one, an LED burns out almost instantly.',
          ],
        },
        { type: 'callout', tone: 'tip', text: 'The simulator warns you about short circuits and overloaded LEDs with an amber outline. Try it: it is the safe way to see what would go wrong.' },
      ],
    },
    {
      kind: 'quiz',
      title: 'Safety check',
      questions: [
        {
          prompt: 'What is a short circuit?',
          options: [
            'A circuit with very short wires',
            'A path with almost no resistance between the battery\'s + and −, so a huge current flows',
            'A circuit that only works for a short time',
            'A circuit with a switch in it',
          ],
          answer: 1,
          explanation: 'With almost no resistance, Ohm\'s law gives a very large current, which heats the wire and battery.',
        },
        {
          prompt: 'What should you do before changing a real circuit?',
          options: ['Turn the lights off', 'Disconnect the battery', 'Add another battery', 'Nothing, it is fine'],
          answer: 1,
          explanation: 'Always remove the power first, then make your changes.',
        },
        {
          prompt: 'A part in your circuit starts to feel hot. What do you do?',
          options: ['Blow on it', 'Wait to see if it cools down', 'Disconnect the battery straight away', 'Add a second battery'],
          answer: 2,
          explanation: 'Heat usually means too much current. Remove the power, then find out why.',
        },
      ],
    },
  ],
};

export default lesson;
