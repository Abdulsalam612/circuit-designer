import type { CircuitLayout } from '@/types/circuit';

// The circuit in the landing page hero: battery → switch → resistor → LED, drawn on the
// same 20 px grid as the editor and solved by the real simulator (lib/simulation.ts).
// Visitors flip the switch and swap the resistor to see the LED light, dim or overload.
// tests/simulation.test.ts checks these three outcomes, so the hero never shows nonsense.

export const HERO_RESISTOR_CHOICES = [
  { ohms: 1000, label: '1 kΩ' },
  { ohms: 330, label: '330 Ω' },
  { ohms: 100, label: '100 Ω' },
] as const;

export const HERO_DEFAULT_OHMS = 330;

// Bounding box of the drawing, for the SVG viewBox
export const HERO_VIEWBOX = { x: 20, y: 20, width: 440, height: 280 };

export const heroLayout = (closed: boolean, ohms: number): CircuitLayout => ({
  components: [
    // Battery on the left edge, + (pin 0) at the top
    { id: 'battery', type: 'battery', x: 60, y: 160, rotation: 90, value: 9 },
    { id: 'switch', type: 'switch', x: 160, y: 60, rotation: 0, closed },
    { id: 'resistor', type: 'resistor', x: 320, y: 60, rotation: 0, value: ohms },
    // LED on the right edge, anode (pin 0) at the top so current flows clockwise
    { id: 'led', type: 'led', x: 420, y: 160, rotation: 90, value: 2 },
  ],
  wires: [
    { id: 'w1', x1: 60, y1: 120, x2: 60, y2: 60 },
    { id: 'w2', x1: 60, y1: 60, x2: 120, y2: 60 },
    { id: 'w3', x1: 200, y1: 60, x2: 280, y2: 60 },
    { id: 'w4', x1: 360, y1: 60, x2: 420, y2: 60 },
    { id: 'w5', x1: 420, y1: 60, x2: 420, y2: 120 },
    { id: 'w6', x1: 420, y1: 200, x2: 420, y2: 260 },
    { id: 'w7', x1: 420, y1: 260, x2: 60, y2: 260 },
    { id: 'w8', x1: 60, y1: 260, x2: 60, y2: 200 },
  ],
});
