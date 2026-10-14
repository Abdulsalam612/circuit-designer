import type { CircuitLayout } from '@/types/circuit';
import { simulate, type SimulationWarning } from '@/lib/simulation';

// The CirKit Kids hub drives its ports the way real robot hubs do: with PWM, switching each
// output fully on and off very fast. "Motor A at 50%" = port A on half the time.
//
// The DC solver has no time-dependent parts in these builds, so the average behaviour is
// exactly the duty-weighted average of the circuit with each port on and off. With several
// ports at part power we average over every on/off combination (2^n solves, n is tiny).

export interface HubOutput {
  // Average motor speed (-1..1) and lamp/LED brightness (0..1), by component id
  speeds: Record<string, number>;
  brightness: Record<string, number>;
  // Problems while the ports are switched on (e.g. a short circuit)
  warnings: SimulationWarning[];
}

const MAX_PWM_PORTS = 6;

export const driveHub = (layout: CircuitLayout, levels: Record<string, number>): HubOutput => {
  const ports = layout.components.filter(c => c.type === 'port');
  const levelOf = (name: string | undefined) => Math.min(1, Math.max(0, levels[name ?? ''] ?? 0));

  // Ports at 0 or 1 are fixed; only part-power ones need both states
  const pwm = ports.filter(p => { const l = levelOf(p.port); return l > 0 && l < 1; }).slice(0, MAX_PWM_PORTS);
  const speeds: Record<string, number> = {};
  const brightness: Record<string, number> = {};
  let warnings: SimulationWarning[] = [];

  for (let mask = 0; mask < 1 << pwm.length; mask++) {
    let weight = 1;
    const on = new Set<string>();
    for (const p of ports) {
      const level = levelOf(p.port);
      const i = pwm.indexOf(p);
      if (i === -1) {
        if (level >= 1) on.add(p.id);
      } else if (mask & (1 << i)) {
        on.add(p.id);
        weight *= level;
      } else {
        weight *= 1 - level;
      }
    }
    if (weight === 0) continue;

    const result = simulate({
      ...layout,
      components: layout.components.map(c => (c.type === 'port' ? { ...c, closed: on.has(c.id) } : c)),
    });
    for (const c of layout.components) {
      const r = result.readings[c.id];
      if (!r) continue;
      if (r.speed !== undefined) speeds[c.id] = (speeds[c.id] ?? 0) + weight * r.speed;
      if (r.brightness !== undefined) brightness[c.id] = (brightness[c.id] ?? 0) + weight * r.brightness;
    }
    // Report problems from the combination with every powered port on
    if (mask === (1 << pwm.length) - 1) warnings = result.warnings;
  }
  return { speeds, brightness, warnings };
};
