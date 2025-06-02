"use client"

import { Line, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface CapacitorProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  draggable?: boolean;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
}

const Capacitor = ({ 
  id, 
  x, 
  y, 
  rotation, 
  draggable, 
  onDragEnd, 
  onClick,
  isSelected 
}: CapacitorProps) => {
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
      {/* Capacitor plates */}
      <Line
        points={[0, 10, 20, 10]}
        stroke={isSelected ? "#3498db" : "black"}
        strokeWidth={isSelected ? 2 : 1}
      />
      <Line
        points={[40, 10, 60, 10]}
        stroke={isSelected ? "#3498db" : "black"}
        strokeWidth={isSelected ? 2 : 1}
      />
      <Line
        points={[20, 0, 20, 20]}
        stroke={isSelected ? "#3498db" : "black"}
        strokeWidth={isSelected ? 2 : 1}
      />
      <Line
        points={[40, 0, 40, 20]}
        stroke={isSelected ? "#3498db" : "black"}
        strokeWidth={isSelected ? 2 : 1}
      />
    </Group>
  );
};

export default Capacitor;
