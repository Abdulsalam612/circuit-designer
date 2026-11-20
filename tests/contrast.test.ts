// Checks the colour pairings the design system promises (WCAG 2.2 contrast) straight from the
// tokens in src/app/globals.css, and that every preset avatar keeps its white icon readable
// with the same stored ids. Run with: npx tsx tests/contrast.test.ts
import { readFileSync } from 'node:fs';
import { AVATARS } from '../src/lib/avatars';

let fails = 0;
const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) { fails++; console.log('FAIL', label, detail); }
};

const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const token = (name: string) => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token --color-${name} not found`);
  return match[1];
};

// [foreground, background, minimum]: 4.5 for text, 3 for boundaries and focus rings
const PAIRS: [string, string, number][] = [
  ['ink-faint', 'surface', 4.5],
  ['ink-faint', 'paper', 4.5],
  ['ink-muted', 'disabled', 4.5], // disabled button label
  ['line-input', 'surface', 3],
  ['line-input', 'paper', 3],
  ['brand', 'surface', 3], // focus ring on light surfaces
  ['glow', 'ink', 3], // focus ring on dark surfaces
  ['glow', 'success', 3],
  ['glow', 'danger', 3],
  ['carrot-ink', 'carrot-tint', 4.5], // CirKit Kids nav button
];
for (const [fg, bg, min] of PAIRS) {
  const ratio = contrast(token(fg), token(bg));
  check(`${fg} on ${bg} >= ${min}`, ratio >= min, ratio.toFixed(2));
}
for (const name of ['signal', 'sound', 'success', 'danger']) {
  const ratio = contrast('#ffffff', token(name));
  check(`white on ${name} >= 4.5`, ratio >= 4.5, ratio.toFixed(2));
}

// Avatars: white icon readable on every preset, ids never renamed (they are stored)
for (const avatar of AVATARS) {
  const ratio = contrast('#ffffff', avatar.background);
  check(`white on avatar ${avatar.id} >= 4.5`, ratio >= 4.5, ratio.toFixed(2));
}
check('avatar ids unchanged', AVATARS.map(a => a.id).join(',') === 'bolt,bulb,battery,chip,atom,magnet,radio,plug');

if (fails) {
  console.log(`contrast: ${fails} failed`);
  process.exit(1);
}
console.log('contrast: all passed');
