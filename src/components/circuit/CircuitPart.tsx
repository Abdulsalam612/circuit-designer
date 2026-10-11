"use client"

import { Group, Image, Rect, Text } from 'react-konva';
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
  isSelected?: boolean;
}

const CircuitPart = ({
  component,
  draggable,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClick,
  isSelected
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
      id={id}
      name={CIRCUIT_PART_NAME}
    >
      <Group rotation={rotation} offsetX={width / 2} offsetY={height / 2}>
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
