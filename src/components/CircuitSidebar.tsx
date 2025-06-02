"use client"

import React from 'react';
import styles from './CircuitSidebar.module.css';

type ComponentType = 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'switch';

interface CircuitComponentProps {
  type: ComponentType;
  label: string;
  icon: string; // Path to icon or component symbol
}

const components: CircuitComponentProps[] = [
  { type: 'resistor', label: 'Resistor', icon: '/icons/resistor.svg' },
  { type: 'capacitor', label: 'Capacitor', icon: '/icons/capacitor.svg' },
  { type: 'inductor', label: 'Inductor', icon: '/icons/inductor.svg' },
  { type: 'battery', label: 'Battery', icon: '/icons/battery.svg' },
  { type: 'switch', label: 'Switch', icon: '/icons/switch.svg' },
];

const CircuitSidebar = () => {
  return (
    <div className={styles.sidebar}>
      <h3 className="text-black font-bold text-lg">Components</h3>
      <div className={styles.componentList}>
        {components.map((component) => (
          <div 
            key={component.type}
            className={`${styles.componentItem} componentItem`}
            data-component-type={component.type}
          >
            {/* Fallback to text if icon not available */}
            {component.icon ? (
              <img src={component.icon} alt={component.label} />
            ) : (
              <div className={styles.iconPlaceholder}>{component.label[0]}</div>
            )}
            <span>{component.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircuitSidebar;
