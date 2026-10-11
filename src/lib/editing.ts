import type { CircuitLayout } from '@/types/circuit';
import { normalizeWires, planMove } from './wires';

// Turns a component 90° clockwise, with its wires following. Returns null if the
// turned part (or its rerouted wires) wouldn't fit.
export const rotateComponent = (layout: CircuitLayout, id: string): CircuitLayout | null => {
  const component = layout.components.find(c => c.id === id);
  if (!component) return null;
  const rotated = { ...component, rotation: (component.rotation + 90) % 360 };
  const components = layout.components.map(c => (c.id === id ? rotated : c));
  const wires = planMove(layout.components, layout.wires, components);
  return wires ? { components, wires: normalizeWires(wires, components) } : null;
};

// Reverses a part in place (half turn) while its wires stay put, so each wire ends up
// on the other end. For batteries and LEDs this swaps + and -.
export const flipComponent = (layout: CircuitLayout, id: string): CircuitLayout => ({
  ...layout,
  components: layout.components.map(c => (c.id === id ? { ...c, rotation: (c.rotation + 180) % 360 } : c)),
});
