"use client";

import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { FieldCard } from "@/src/components/ui/field-card";

interface DndItemProps {
  entityId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  children: ReactNode;
}

export function DndItem({
  entityId,
  isSelected,
  onSelect,
  onDelete,
  children,
}: DndItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entityId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
    >
      <FieldCard
        entityId={entityId}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        {children}
      </FieldCard>
    </div>
  );
}
