"use client"

import { Circle, Group, Image, Rect, Text } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';
import type { CircuitComponent } from '@/types/circuit';
import { GRID_SIZE } from '@/lib/grid';
import { COMPONENT_DEFS, formatValue, iconFor } from '@/lib/components';

// Konva name used to tell component clicks apart from clicks on the empty grid
export const CIRCUIT_PART_NAME = 'circuit-part';

// Symbols are drawn this tall (icons are 100x40, i.e. 2.5 times wider than tall)
export const PART_HEIGHT = 32;

// Drawn size of a part, in canvas units before zoom
export const partSize = (type: CircuitComponent['type']) => ({
  width: GRID_SIZE * COMPONENT_DEFS[type].cells,
  height: PART_HEIGHT,
});

interface CircuitPartProps {
  component: CircuitComponent; // x, y is the centre of the part, on a grid point
  draggable?: boolean;
  // Drag handling (snapping, group moves, collision checks) lives in the canvas
  onDragStart?: (e: KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
  // While simulating: how brightly a lamp/LED is lit (0..1), and whether the part has
  // a problem (amber outline)
  brightness?: number;
  hasWarning?: boolean;
}

// Glow colours for lit parts
const GLOW = { led: '#ef4444', lamp: '#facc15' } as const;

const CircuitPart = ({
  component,
  draggable,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isSelected,
  brightness = 0,
  hasWarning
}: CircuitPartProps) => {
  const { id, type, x, y, rotation, value } = component;
  const [image] = useImage(iconFor(component));
  const { width, height } = partSize(type);
  const def = COMPONENT_DEFS[type];

  // Value label beside the part, kept upright whatever the rotation
  const vertical = rotation % 180 !== 0;
  const label = def.value && value !== undefined ? formatValue(value, def.value.unit) : null;

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={id}
      name={CIRCUIT_PART_NAME}
    >
      {/* Light from a lit lamp or LED, drawn behind the symbol */}
      {brightness > 0.01 && (type === 'led' || type === 'lamp') && (
        <Circle
          x={0}
          y={0}
          radius={type === 'lamp' ? 14 + 10 * brightness : 9 + 7 * brightness}
          fill={GLOW[type]}
          opacity={0.25 + 0.55 * brightness}
          shadowColor={GLOW[type]}
          shadowBlur={12 + 18 * brightness}
          shadowOpacity={0.9}
          listening={false}
        />
      )}
      <Group rotation={rotation} offsetX={width / 2} offsetY={height / 2}>
        {hasWarning && (
          <Rect
            x={-6}
            y={-6}
            width={width + 12}
            height={height + 12}
            stroke="#f59e0b"
            strokeWidth={2}
            dash={[5, 3]}
            cornerRadius={8}
            listening={false}
          />
        )}
        {isSelected && (
          <Rect
            x={-4}
            y={-4}
            width={width + 8}
            height={height + 8}
            stroke="#3498db"
            strokeWidth={2}
            cornerRadius={6}
          />
        )}
        <Image image={image} width={width} height={height} alt="" />
        {/* Marks the battery's + end */}
        {type === 'battery' && (
          <Text text="+" x={6} y={-2} fontSize={13} fontStyle="bold" fill="#dc2626" listening={false} />
        )}
      </Group>
      {label && (
        <Text
          text={label}
          fontSize={11}
          fill="#4b5563"
          listening={false}
          {...(vertical
            ? { x: height / 2 + 4, y: -6 }
            : { x: -width / 2, y: height / 2 + 2, width, align: 'center' })}
        />
      )}
    </Group>
  );
};

export default CircuitPart;
