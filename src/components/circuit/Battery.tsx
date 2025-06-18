"use client";

import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';

interface BatteryProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  draggable?: boolean;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
}

const Battery = ({
  id,
  x,
  y,
  rotation,
  draggable,
  onDragEnd,
  onClick,
  isSelected
}: BatteryProps) => {
  const [image] = useImage('/icons/battery.svg');
  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onClick}
      id={id}
    >
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={68}
          height={28}
          stroke="#3498db"
          strokeWidth={2}
          cornerRadius={6}
        />
      )}
      <Image image={image} width={60} height={20} alt="" />
    </Group>
  );
};

export default Battery;
