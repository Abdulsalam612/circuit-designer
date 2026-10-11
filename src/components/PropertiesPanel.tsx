"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeftRight, RotateCw } from "lucide-react";
import type { CircuitComponent } from "@/types/circuit";
import { COMPONENT_DEFS, formatValue, parseValue } from "@/lib/components";
import { formatAmps, formatVolts, formatWatts, type PartReading } from "@/lib/simulation";

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
        className={`w-full rounded-md border px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:ring-2 ${
          invalid ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
        }`}
      />
      {invalid ? (
        <p className="mt-1 text-xs text-red-500">Enter a number, e.g. 4.7k or 10u</p>
      ) : (
        <p className="mt-1 text-xs text-gray-400">Prefixes: p n µ(u) m k M G</p>
      )}
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, selectionCount = 0, onChange, onRotate, onFlip, reading }) => {
  if (!component) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <div className="text-gray-300 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <p className="text-sm">
          {selectionCount > 1 ? `${selectionCount} items selected` : "Select a component to view properties"}
        </p>
      </div>
    );
  }

  const def = COMPONENT_DEFS[component.type];
  return (
    <div className="space-y-5">
      <div>
        <span className="block text-xs text-gray-500">Type</span>
        <span className="font-medium text-gray-900">{def.label}</span>
      </div>

      {reading && component.type !== "ground" && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <span className="block text-xs font-semibold text-green-700 mb-2">Live readings</span>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-gray-500">Voltage</dt><dd className="font-mono text-gray-900">{formatVolts(reading.voltage)}</dd>
            <dt className="text-gray-500">Current</dt><dd className="font-mono text-gray-900">{formatAmps(reading.current)}</dd>
            <dt className="text-gray-500">Power</dt><dd className="font-mono text-gray-900">{formatWatts(reading.power)}</dd>
            {reading.brightness !== undefined && (
              <>
                <dt className="text-gray-500">Brightness</dt>
                <dd className="font-mono text-gray-900">{Math.round(reading.brightness * 100)}%</dd>
              </>
            )}
          </dl>
          {reading.overloaded && <p className="mt-2 text-xs font-semibold text-red-600">Too much current – this LED would burn out.</p>}
        </div>
      )}

      {def.value && component.value !== undefined && (
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">{def.value.label}</span>
          <ValueInput
            value={component.value}
            unit={def.value.unit}
            onCommit={(value) => onChange?.({ value })}
          />
        </label>
      )}

      {def.toggles && (
        <div>
          <span className="block text-xs text-gray-500 mb-1">State</span>
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-sm">
            {[false, true].map(closed => (
              <button
                key={String(closed)}
                onClick={() => onChange?.({ closed })}
                className={`px-3 py-1.5 ${
                  !!component.closed === closed ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {closed ? "Closed" : "Open"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="block text-xs text-gray-500 mb-1">Rotation</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-gray-800">{component.rotation}&deg;</span>
          <button
            onClick={onRotate}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            <RotateCw className="h-3.5 w-3.5" /> Rotate (R)
          </button>
        </div>
      </div>

      {def.polarized && (
        <div>
          <span className="block text-xs text-gray-500 mb-1">Direction</span>
          <button
            onClick={onFlip}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> Flip direction
          </button>
          <p className="mt-1 text-xs text-gray-400">
            {component.type === "battery"
              ? "Swaps the + and − ends. The red + marks the positive end."
              : "Current only flows from the flat side of the triangle to the bar."}
          </p>
        </div>
      )}

      <div>
        <span className="block text-xs text-gray-500">Position</span>
        <span className="font-mono text-gray-800">x: {Math.round(component.x)}, y: {Math.round(component.y)}</span>
      </div>
    </div>
  );
};

export default PropertiesPanel;
