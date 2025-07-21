import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableAreaProps {
  id: string;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({ id }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: isOver ? 'rgba(0, 100, 255, 0.05)' : 'transparent',
    transition: 'background-color 0.2s ease',
    position: 'absolute',
    top: 0,
    left: 0,
  };

  return (
    <div ref={setNodeRef} style={style} />
  );
};