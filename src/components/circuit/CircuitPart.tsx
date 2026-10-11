"use client"

import { useRef } from 'react';
import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';
import type { ComponentType } from '@/types/circuit';
import { GRID_SIZE, PART_CELLS, snapToGrid, type Point } from '@/lib/grid';

// Konva name used to tell component clicks apart from clicks on the empty grid
export const CIRCUIT_PART_NAME = 'circuit-part';

// Symbol size in canvas units (before zoom). With the part centred on a grid point,
// both lead ends also sit on grid points, including after a 90° rotation.
export const PART_WIDTH = GRID_SIZE * PART_CELLS;
export const PART_HEIGHT = PART_WIDTH * 0.4; // icons are 100x40

interface CircuitPartProps {
  id: string;
  type: ComponentType;
  x: number; // centre of the part, on a grid point
  y: number;
  rotation: number;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
  // Whether the part may move its centre to this grid point
  canPlaceAt?: (centre: Point) => boolean;
}

const CircuitPart = ({
  id,
  type,
  x,
  y,
  rotation,
  draggable,
  onDragStart,
  onDragEnd,
  onClick,
  isSelected,
  canPlaceAt
}: CircuitPartProps) => {
  const [image] = useImage(`/icons/${type}.svg`);
  // Last grid point the part was allowed to occupy during the current drag
  const lastValid = useRef<Point>({ x, y });

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    lastValid.current = e.target.position();
    onDragStart?.();
  };

  // Move in grid steps while dragging, and stay put rather than enter an occupied spot
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const snapped = { x: snapToGrid(node.x()), y: snapToGrid(node.y()) };
    if (!canPlaceAt || canPlaceAt(snapped)) {
      lastValid.current = snapped;
    }
    node.position(lastValid.current);
  };

  return (
    <Group
      x={x}
      y={y}
      offsetX={PART_WIDTH / 2}
      offsetY={PART_HEIGHT / 2}
      rotation={rotation}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={onDragEnd}
      onClick={onClick}
      id={id}
      name={CIRCUIT_PART_NAME}
    >
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={PART_WIDTH + 8}
          height={PART_HEIGHT + 8}
          stroke="#3498db"
          strokeWidth={2}
          cornerRadius={6}
        />
      )}
      <Image image={image} width={PART_WIDTH} height={PART_HEIGHT} alt="" />
    </Group>
  );
};

export default CircuitPart;
