"use client";

import { Group, Image } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';

interface InductorProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  draggable?: boolean;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
}

const Inductor = ({
  id,
  x,
  y,
  rotation,
  draggable,
  onDragEnd,
  onClick,
}: InductorProps) => {
  const [image] = useImage('/icons/inductor.svg');
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
      <Image image={image} width={60} height={20} alt="" />
    </Group>
  );
};

export default Inductor;
