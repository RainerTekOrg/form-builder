"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldCardProps {
  entityId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
  children: ReactNode;
}

export function FieldCard({
  isSelected,
  onSelect,
  onDelete,
  dragHandleProps,
  children,
}: FieldCardProps) {
  return (
    <Card
      className={cn(
        "group relative transition-all duration-150",
        "hover:border-primary/40 hover:shadow-sm",
        isSelected && "ring-2 ring-primary border-primary shadow-sm",
      )}
    >
      <div
        className="flex items-start gap-2 p-3 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onSelect(); } }}
      >
        <button
          {...dragHandleProps}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {children}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete field"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </Card>
  );
}
