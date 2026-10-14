"use client"

import React from 'react';
import Image from 'next/image';
import styles from './CircuitSidebar.module.css';
import { COMPONENT_DEFS, EDITOR_TYPES, iconFor } from '@/lib/components';
import type { ComponentType } from '@/types/circuit';

interface CircuitSidebarProps {
  // Which parts to offer (lesson challenges limit them); all editor parts by default
  types?: ComponentType[];
}

// The parts bin. Each tile is dragged onto the board with interact.js, which finds tiles by
// the `componentItem` class and `data-component-type` – keep both.
const CircuitSidebar = ({ types = EDITOR_TYPES }: CircuitSidebarProps) => {
  const components = types.map(type => ({
    type,
    label: COMPONENT_DEFS[type].label,
    icon: iconFor({ type }),
  }));
  return (
    <div className={styles.sidebar}>
      <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-ink">Parts</h3>
      <p className="mt-0.5 text-xs text-ink-muted">Drag a part onto the board</p>
      <div className={styles.componentList}>
        {components.map((component) => (
          <div
            key={component.type}
            className={`${styles.componentItem} componentItem`}
            data-component-type={component.type}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={component.icon}
                alt=""
                width={56}
                height={22}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span>{component.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircuitSidebar;
