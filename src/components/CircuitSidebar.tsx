"use client"

import React from 'react';
import Image from 'next/image';
import styles from './CircuitSidebar.module.css';
import { COMPONENT_DEFS, COMPONENT_TYPES, iconFor } from '@/lib/components';
import type { ComponentType } from '@/types/circuit';

interface CircuitSidebarProps {
  // Which parts to offer (lesson challenges limit them); all of them by default
  types?: ComponentType[];
}

const CircuitSidebar = ({ types = COMPONENT_TYPES }: CircuitSidebarProps) => {
  const components = types.map(type => ({
    type,
    label: COMPONENT_DEFS[type].label,
    icon: iconFor({ type }),
  }));
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
              <div className={styles.imageWrapper}>
                <Image 
                  src={component.icon} 
                  alt={component.label} 
                  width={24} 
                  height={24}
                  style={{ objectFit: 'contain' }}
                />
              </div>
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
