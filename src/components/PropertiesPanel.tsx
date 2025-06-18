"use client";

import React from "react";

// Define the shape of a circuit component
export interface CircuitComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
}

interface PropertiesPanelProps {
  component: CircuitComponent | null;
}

const typeLabels: Record<string, string> = {
  resistor: "Resistor",
  capacitor: "Capacitor",
  inductor: "Inductor",
  battery: "Battery",
  switch: "Switch",
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component }) => {
  if (!component) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <div className="text-gray-300 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <p className="text-sm">Select a component to view properties</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div>
        <span className="block text-xs text-gray-500">Type</span>
        <span className="font-medium text-gray-900">{typeLabels[component.type] || component.type}</span>
      </div>
      <div>
        <span className="block text-xs text-gray-500">Position</span>
        <span className="font-mono text-gray-800">x: {Math.round(component.x)}, y: {Math.round(component.y)}</span>
      </div>
      <div>
        <span className="block text-xs text-gray-500">Rotation</span>
        <span className="font-mono text-gray-800">{component.rotation}&deg;</span>
      </div>
      <div>
        <span className="block text-xs text-gray-500">ID</span>
        <span className="font-mono text-gray-400">{component.id}</span>
      </div>
    </div>
  );
};

export default PropertiesPanel;
