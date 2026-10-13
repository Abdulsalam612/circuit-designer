import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'string-lights',
  level: 2,
  title: 'Series and parallel in real life',
  description: 'Fairy lights, house wiring and torches: spotting series and parallel around you.',
  minutes: 10,
  points: 60,
  steps: [
    {
      kind: 'read',
      title: 'Why one dead bulb used to ruin the tree',
      blocks: [
        { type: 'text', text: 'Old Christmas fairy lights were wired **in series**: dozens of small bulbs in one long loop. They were cheap and each bulb only needed a small share of the voltage, but if one bulb blew, the loop broke and **every light went out**. Finding the dead one meant checking them all.' },
        { type: 'text', text: 'Modern sets fix this: each bulb has a tiny bypass inside, or the string is split into several shorter series chains wired **in parallel**, so one failure only darkens a small section.' },
      ],
    },
    {
      kind: 'read',
      title: 'More examples',
      blocks: [
        {
          type: 'list',
          items: [
            '**House wiring is parallel.** Every socket and light gets the full mains voltage, and turning off the kettle doesn\'t switch off the TV.',
            '**Torch batteries are in series.** Two 1.5 V batteries end to end give 3 V: series voltages add up.',
            '**Car headlights are parallel.** If one bulb fails, you can still see with the other.',
            '**A switch is in series with what it controls.** It sits in the same loop so it can break it.',
          ],
        },
        { type: 'callout', tone: 'tip', text: 'Try it in the editor: put two batteries end to end (+ to −) and watch a lamp get brighter.' },
      ],
    },
    {
      kind: 'quiz',
      title: 'Real-life check',
      questions: [
        {
          prompt: 'Why are the lights in a house wired in parallel?',
          options: ['It uses less wire', 'So each one gets full voltage and works on its own', 'So they all switch on together', 'Parallel is cheaper'],
          answer: 1,
          explanation: 'Parallel gives every appliance the full voltage and an independent path.',
        },
        {
          prompt: 'On an old string of fairy lights, one bulb blows and they all go out. How were they wired?',
          options: ['In series', 'In parallel', 'They weren\'t wired', 'With capacitors'],
          answer: 0,
          explanation: 'In series, one broken bulb opens the only path for the current.',
        },
        {
          prompt: 'A torch holds two 1.5 V batteries end to end. What voltage do they give?',
          options: ['1.5 V', '0.75 V', '3 V', '2.25 V'],
          answer: 2,
          explanation: 'Batteries in series add their voltages: 1.5 + 1.5 = 3 V.',
        },
      ],
    },
  ],
};

export default lesson;
