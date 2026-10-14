"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeftRight, RotateCw } from "lucide-react";
import type { CircuitComponent } from "@/types/circuit";
import { COMPONENT_DEFS, formatValue, parseValue } from "@/lib/components";
import { formatAmps, formatVolts, formatWatts, type PartReading } from "@/lib/simulation";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import StatusLed from "@/components/ui/StatusLed";

// Small grey label above each property
const LABEL = "mb-1.5 block text-xs font-medium text-ink-muted";

interface PropertiesPanelProps {
  component: CircuitComponent | null;
  // Number of items selected (components and wires), for the multi-select message
  selectionCount?: number;
  onChange?: (patch: Partial<Pick<CircuitComponent, "value" | "closed">>) => void;
  onRotate?: () => void;
  // Reverse a polarized part (battery, LED)
  onFlip?: () => void;
  // Live values while the simulation runs
  reading?: PartReading | null;
}

// Text box for a value with units. Accepts "4.7k", "4k7", "10u", "100 mΩ"... and saves
// on Enter or when the box loses focus; Escape puts the old value back.
const ValueInput = ({ value, unit, onCommit }: { value: number; unit: string; onCommit: (v: number) => void }) => {
  const [text, setText] = useState(formatValue(value, unit));
  const [invalid, setInvalid] = useState(false);

  // Show the new value when a different component is selected, or after undo/redo
  useEffect(() => {
    setText(formatValue(value, unit));
    setInvalid(false);
  }, [value, unit]);

  const commit = () => {
    const parsed = parseValue(text, unit);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setText(formatValue(parsed, unit));
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => { setText(e.target.value); setInvalid(false); }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") { setText(formatValue(value, unit)); setInvalid(false); }
        }}
        aria-invalid={invalid}
        className={`${inputClass} tabular py-2 text-sm`}
      />
      {invalid ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">Enter a number, e.g. 4.7k or 10u</p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-muted">Prefixes: p n µ(u) m k M G</p>
      )}
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, selectionCount = 0, onChange, onRotate, onFlip, reading }) => {
  if (!component) {
    return (
      <div className="mt-6 rounded-card border border-dashed border-line-strong px-4 py-6 text-center">
        <p className="text-sm text-ink-muted">
          {selectionCount > 1
            ? `${selectionCount} items selected. Press Delete to remove them, or drag to move them together.`
            : "Click a part to change its value, rotate it or see its readings."}
        </p>
      </div>
    );
  }

  const def = COMPONENT_DEFS[component.type];
  return (
    <div className="space-y-5">
      <div>
        <span className={LABEL}>Part</span>
        <span className="font-display text-lg font-semibold tracking-[-0.01em] text-ink">{def.label}</span>
      </div>

      {reading && component.type !== "ground" && (
        <div className={`rounded-card border p-3.5 ${reading.overloaded ? "border-danger/30 bg-danger-tint" : "border-signal/25 bg-signal-tint"}`}>
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink">
            <StatusLed state={reading.overloaded ? "warning" : "active"} />
            Live readings
          </span>
          <dl className="tabular grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-ink-muted">Voltage</dt><dd className="font-medium text-ink">{formatVolts(reading.voltage)}</dd>
            <dt className="text-ink-muted">Current</dt><dd className="font-medium text-ink">{formatAmps(reading.current)}</dd>
            <dt className="text-ink-muted">Power</dt><dd className="font-medium text-ink">{formatWatts(reading.power)}</dd>
            {reading.brightness !== undefined && (
              <>
                <dt className="text-ink-muted">Brightness</dt>
                <dd className="font-medium text-ink">{Math.round(reading.brightness * 100)}%</dd>
              </>
            )}
            {reading.speed !== undefined && (
              <>
                <dt className="text-ink-muted">Speed</dt>
                <dd className="font-medium text-ink">
                  {Math.round(Math.abs(reading.speed) * 100)}%{reading.speed < -0.005 ? " backwards" : ""}
                </dd>
              </>
            )}
          </dl>
          {reading.overloaded && <p className="mt-2 text-xs font-semibold text-danger">Too much current – this LED would burn out.</p>}
        </div>
      )}

      {def.value && component.value !== undefined && (
        <label className="block">
          <span className={LABEL}>{def.value.label}</span>
          <ValueInput
            value={component.value}
            unit={def.value.unit}
            onCommit={(value) => onChange?.({ value })}
          />
        </label>
      )}

      {def.toggles && (
        <div>
          <span className={LABEL}>State</span>
          <div className="inline-flex rounded-control border border-line-strong bg-paper p-0.5 text-sm" role="group" aria-label="Switch state">
            {[false, true].map(closed => (
              <button
                key={String(closed)}
                onClick={() => onChange?.({ closed })}
                aria-pressed={!!component.closed === closed}
                className={`rounded-[8px] px-3 py-1 transition-colors ${
                  !!component.closed === closed ? "bg-surface font-medium text-ink shadow-key" : "text-ink-muted hover:text-ink"
                }`}
              >
                {closed ? "Closed" : "Open"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className={LABEL}>Rotation</span>
        <div className="flex items-center gap-3">
          <span className="tabular w-10 text-ink">{component.rotation}&deg;</span>
          <button onClick={onRotate} className={buttonClass("secondary", "sm")}>
            <RotateCw className="h-3.5 w-3.5" /> Rotate (R)
          </button>
        </div>
      </div>

      {def.polarized && (
        <div>
          <span className={LABEL}>Direction</span>
          <button onClick={onFlip} className={buttonClass("secondary", "sm")}>
            <ArrowLeftRight className="h-3.5 w-3.5" /> Flip direction
          </button>
          <p className="mt-1.5 text-xs text-ink-muted">
            {component.type === "battery"
              ? "Swaps the + and − ends. The red + marks the positive end."
              : "Current only flows from the flat side of the triangle to the bar."}
          </p>
        </div>
      )}

      <div>
        <span className={LABEL}>Position</span>
        <span className="tabular text-sm text-ink-muted">x {Math.round(component.x)}, y {Math.round(component.y)}</span>
      </div>
    </div>
  );
};

export default PropertiesPanel;
