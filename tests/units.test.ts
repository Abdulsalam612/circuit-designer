// Checks the value parser/formatter used by the Properties panel. Run with: npm test
import { parseValue, formatValue } from '../src/lib/components';
const cases: [string, string, number | null][] = [
  ['4.7k', 'Ω', 4700], ['4k7', 'Ω', 4700], ['4.7 kΩ', 'Ω', 4700], ['220', 'Ω', 220], ['1M', 'Ω', 1e6],
  ['10u', 'F', 1e-5], ['10µF', 'F', 1e-5], ['100n', 'F', 1e-7], ['1e-6', 'F', 1e-6], ['47p', 'F', 4.7e-11],
  ['9', 'V', 9], ['1.5V', 'V', 1.5], ['100m', 'Ω', 0.1], ['10 ohms', 'Ω', 10],
  ['abc', 'Ω', null], ['-5', 'V', null], ['', 'V', null], ['1..2', 'V', null],
];
let fails = 0;
for (const [text, unit, want] of cases) {
  const got = parseValue(text, unit);
  const ok = want === null ? got === null : got !== null && Math.abs(got - want) < Math.abs(want) * 1e-9 + 1e-18;
  if (!ok) { fails++; console.log('FAIL parse', JSON.stringify(text), unit, '->', got, 'want', want); }
}
const fmt: [number, string, string][] = [[4700, 'Ω', '4.7 kΩ'], [1e-6, 'F', '1 µF'], [9, 'V', '9 V'], [0.1, 'Ω', '100 mΩ'], [1e6, 'Ω', '1 MΩ'], [0, 'V', '0 V'], [3.3333, 'V', '3.33 V'], [4.7e-11, 'F', '47 pF']];
for (const [v, u, want] of fmt) { const got = formatValue(v, u); if (got !== want) { fails++; console.log('FAIL format', v, u, '->', got, 'want', want); } }
console.log(fails === 0 ? `all ${cases.length + fmt.length} unit checks passed` : `${fails} failures`);
