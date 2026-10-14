import type { CircuitComponent, ComponentType } from '@/types/circuit';

export interface ComponentDef {
  label: string;
  // Length in grid cells from end to end. Must be even, so that with the part centred
  // on a grid point both ends also sit on grid points, including after rotation.
  cells: number;
  // How many lead ends: 2 = both ends, 1 = only the starting end (ground)
  pins: 1 | 2;
  defaultRotation: number;
  // The editable electrical value, if the part has one
  value?: { label: string; unit: string; default: number };
  // Has an open/closed state (switches)
  toggles?: boolean;
  // The two ends aren't interchangeable. The first end (left when unrotated) is the
  // battery's + terminal and the LED's anode (+); the second is - / cathode.
  polarized?: boolean;
  // Not offered in the circuit editor's parts bin (used by CirKit Kids builds only)
  kidsOnly?: boolean;
}

export const COMPONENT_DEFS: Record<ComponentType, ComponentDef> = {
  resistor: { label: 'Resistor', cells: 4, pins: 2, defaultRotation: 0, value: { label: 'Resistance', unit: 'Ω', default: 1000 } },
  capacitor: { label: 'Capacitor', cells: 4, pins: 2, defaultRotation: 0, value: { label: 'Capacitance', unit: 'F', default: 1e-6 } },
  inductor: { label: 'Inductor', cells: 4, pins: 2, defaultRotation: 0, value: { label: 'Inductance', unit: 'H', default: 1e-3 } },
  battery: { label: 'Battery', cells: 4, pins: 2, defaultRotation: 0, polarized: true, value: { label: 'Voltage', unit: 'V', default: 9 } },
  switch: { label: 'Switch', cells: 4, pins: 2, defaultRotation: 0, toggles: true },
  led: { label: 'LED', cells: 4, pins: 2, defaultRotation: 0, polarized: true, value: { label: 'Forward voltage', unit: 'V', default: 2 } },
  lamp: { label: 'Lamp', cells: 4, pins: 2, defaultRotation: 0, value: { label: 'Resistance', unit: 'Ω', default: 100 } },
  // Points down by default, with its single lead end at the top
  ground: { label: 'Ground', cells: 2, pins: 1, defaultRotation: 90 },
  // Modelled as its winding resistance; speed follows the voltage (see simulation.ts)
  motor: { label: 'Motor', cells: 4, pins: 2, defaultRotation: 0, value: { label: 'Resistance', unit: 'Ω', default: 20 } },
  port: { label: 'Hub port', cells: 4, pins: 2, defaultRotation: 0, toggles: true, kidsOnly: true },
};

export const COMPONENT_TYPES = Object.keys(COMPONENT_DEFS) as ComponentType[];

// What the circuit editor's parts bin offers
export const EDITOR_TYPES = COMPONENT_TYPES.filter(type => !COMPONENT_DEFS[type].kidsOnly);

export const iconFor = (c: Pick<CircuitComponent, 'type' | 'closed'>) =>
  c.type === 'switch' && c.closed ? '/icons/switch-closed.svg' : `/icons/${c.type}.svg`;

// SI prefixes, largest first
const PREFIXES: [string, number][] = [
  ['G', 1e9], ['M', 1e6], ['k', 1e3], ['', 1], ['m', 1e-3], ['µ', 1e-6], ['n', 1e-9], ['p', 1e-12],
];

// 4700 Ω -> "4.7 kΩ", 0.000001 F -> "1 µF"
export const formatValue = (value: number, unit: string) => {
  if (value === 0) return `0 ${unit}`;
  const [prefix, factor] = PREFIXES.find(([, f]) => Math.abs(value) >= f) ?? PREFIXES[PREFIXES.length - 1];
  const scaled = Number((value / factor).toPrecision(3));
  return `${scaled} ${prefix}${unit}`;
};

// Reads what people type: "4.7k", "4k7", "4.7 kΩ", "10u", "10µF", "1e-6", "100 m".
// Returns null if it isn't a valid non-negative number.
export const parseValue = (text: string, unit: string): number | null => {
  let s = text.trim().replace(/\s+/g, '');
  if (unit && s.toLowerCase().endsWith(unit.toLowerCase())) s = s.slice(0, -unit.length);
  if (unit === 'Ω') s = s.replace(/ohms?$/i, '');
  s = s.replace(/^(\d+)([GMkmuµnp])(\d+)$/, '$1.$3$2'); // 4k7 -> 4.7k
  const match = s.match(/^(\d*\.?\d+(?:e[-+]?\d+)?)([GMkKmuµnp]?)$/);
  if (!match) return null;
  const prefix = match[2] === 'u' ? 'µ' : match[2] === 'K' ? 'k' : match[2];
  const factor = PREFIXES.find(([p]) => p === prefix)?.[1] ?? 1;
  const value = parseFloat(match[1]) * factor;
  return Number.isFinite(value) && value >= 0 ? value : null;
};
