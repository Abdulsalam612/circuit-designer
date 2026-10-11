export type ComponentType = 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'switch';

// A component placed on the editor canvas
export interface CircuitComponent {
  id: string;
  type: ComponentType;
  // Centre of the component, always on a grid point
  x: number;
  y: number;
  rotation: number;
}

// A straight wire between two grid points (always horizontal or vertical).
// Wires don't store what they're attached to: anything whose ends share a grid
// point is connected, so connections can never go out of sync with positions.
export interface Wire {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
