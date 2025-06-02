"use client"

import { Rect, Text, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface ResistorProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  draggable?: boolean;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
}

const Resistor = ({ 
  id, 
  x, 
  y, 
  rotation, 
  draggable, 
  onDragEnd, 
  onClick,
  isSelected 
}: ResistorProps) => {
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
      <Rect 
        width={60} 
        height={20} 
        fill="#f0f0f0" 
        stroke={isSelected ? "#3498db" : "black"}
        strokeWidth={isSelected ? 2 : 1}
      />
      <Text text="R" x={25} y={5} fontSize={12} />
    </Group>
  );
};

export default Resistor;
