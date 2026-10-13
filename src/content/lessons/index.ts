import type { Lesson, Level } from '@/types/lesson';
import whatIsElectricity from './what-is-electricity';
import voltageCurrentResistance from './voltage-current-resistance';
import stayingSafe from './staying-safe';
import level0Quiz from './level-0-quiz';
import resistors from './resistors';
import capacitors from './capacitors';
import leds from './leds';
import level1Quiz from './level-1-quiz';
import seriesCircuits from './series-circuits';
import parallelCircuits from './parallel-circuits';
import stringLights from './string-lights';
import fixTheCircuit from './fix-the-circuit';

// The course. To add a lesson: create a file in this folder and add it to LESSONS in
// the order it should be taken (lessons unlock one after another).

export const LEVELS: Level[] = [
  { level: 0, title: 'Intro to Electricity', description: 'What electricity is, the three big ideas, and staying safe.' },
  { level: 1, title: 'Basic Components', description: 'Resistors, capacitors and LEDs: what they do and how to use them.' },
  { level: 2, title: 'Series and Parallel', description: 'The two ways to connect parts, and how voltage and current behave in each.' },
];

export const LESSONS: Lesson[] = [
  whatIsElectricity,
  voltageCurrentResistance,
  stayingSafe,
  level0Quiz,
  resistors,
  capacitors,
  leds,
  level1Quiz,
  seriesCircuits,
  parallelCircuits,
  stringLights,
  fixTheCircuit,
];
