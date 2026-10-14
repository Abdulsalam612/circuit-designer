export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'battery'
  | 'switch'
  | 'led'
  | 'lamp'
  | 'ground'
  // A DC motor: spins faster the more voltage it gets, backwards if reversed
  | 'motor'
  // One output of a CirKit Kids hub: a switch that the child's block program turns on and off
  | 'port';

// A component placed on the editor canvas
export interface CircuitComponent {
  id: string;
  type: ComponentType;
  // Centre of the component, always on a grid point
  x: number;
  y: number;
  rotation: number;
  // Main electrical value in base SI units (ohms, farads, henries, volts...), for types
  // that have one (see COMPONENT_DEFS)
  value?: number;
  // Switches only: whether the switch is closed (conducting)
  closed?: boolean;
  // Hub ports only: the port's name ('A', 'B'…) that blocks refer to
  port?: string;
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

// Everything that makes up a circuit drawing
export interface CircuitLayout {
  components: CircuitComponent[];
  wires: Wire[];
}
