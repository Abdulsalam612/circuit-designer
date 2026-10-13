import type { Lesson } from '@/types/lesson';

const lesson: Lesson = {
  id: 'capacitors',
  level: 1,
  title: 'Capacitors',
  description: 'How capacitors store charge, and what charging and discharging look like.',
  minutes: 12,
  points: 70,
  steps: [
    {
      kind: 'read',
      title: 'A tiny rechargeable store',
      blocks: [
        { type: 'parts', parts: [{ part: 'capacitor', text: 'Two metal plates separated by an insulator. Its size is measured in farads (F).' }] },
        { type: 'text', text: 'A capacitor **stores electric charge**. Connect it to a battery and charge piles up on its plates; disconnect the battery and the charge stays there, ready to be released.' },
        { type: 'text', text: 'One farad is huge, so real capacitors are usually measured in **microfarads** (µF, millionths of a farad) or **nanofarads** (nF).' },
        { type: 'callout', tone: 'info', text: 'Water picture: a capacitor is like a rubber sheet stretched across a pipe. Water pushes it and it stretches (charging), but no water gets through. Release the pressure and the sheet pushes the water back (discharging).' },
      ],
    },
    {
      kind: 'read',
      title: 'Charging and discharging',
      blocks: [
        {
          type: 'list',
          items: [
            '**Charging:** when first connected, current rushes in. As the capacitor fills, its voltage rises towards the battery\'s voltage and the current falls towards zero.',
            '**Charged:** once full, no more current flows. A charged capacitor **blocks steady (DC) current**.',
            '**Discharging:** connect the charged capacitor to a lamp and it pushes current out, so the lamp glows briefly and then fades as the charge runs out.',
          ],
        },
        { type: 'text', text: 'How fast this happens depends on the capacitance and the resistance it charges through: a bigger capacitor or a bigger resistor means slower charging. That is how capacitors make timers, smooth out bumpy power supplies and give a camera flash its burst of energy.' },
        { type: 'callout', tone: 'tip', text: 'CirKit\'s simulator shows circuits after they have settled, so a capacitor there always acts as a gap (fully charged). Try putting one in series with a lamp: the lamp stays dark.' },
      ],
    },
    {
      kind: 'quiz',
      title: 'Capacitor check',
      questions: [
        {
          prompt: 'What does a capacitor do?',
          options: ['Stores electric charge', 'Makes light', 'Limits current like a resistor', 'Produces voltage forever'],
          answer: 0,
          explanation: 'A capacitor stores charge on its plates and can release it later.',
        },
        {
          prompt: 'What happens to the current while a capacitor charges from a battery?',
          options: ['It stays the same', 'It starts high and falls towards zero', 'It starts at zero and keeps rising', 'It reverses every second'],
          answer: 1,
          explanation: 'Current rushes in at first, then drops as the capacitor fills up.',
        },
        {
          prompt: 'A charged capacitor is in series with a lamp and a battery. Does the lamp stay lit?',
          options: ['Yes, brightly', 'No: once charged, the capacitor blocks steady current', 'Yes, but it flickers', 'Only if the battery is reversed'],
          answer: 1,
          explanation: 'Once charged, no steady current flows through a capacitor, so the lamp goes dark.',
        },
        {
          prompt: 'Which is the biggest capacitance?',
          options: ['10 nF', '1 µF', '100 nF', '47 nF'],
          answer: 1,
          explanation: '1 µF = 1000 nF, which is bigger than all the others.',
        },
      ],
    },
  ],
};

export default lesson;
