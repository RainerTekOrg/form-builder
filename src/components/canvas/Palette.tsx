"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Type,
  AlignLeft,
  Hash,
  List,
  CheckSquare,
  Calendar,
  FileUp,
  Pen,
  Layers,
  Repeat,
  FunctionSquare,
  Package,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const fieldTypeGroups = [
  {
    label: "Inputs",
    items: [
      { type: "text", label: "Text Field", icon: Type },
      { type: "textarea", label: "Text Area", icon: AlignLeft },
      { type: "number", label: "Number", icon: Hash },
      { type: "integer", label: "Integer", icon: Hash },
    ],
  },
  {
    label: "Choice",
    items: [
      { type: "select", label: "Select", icon: List },
      { type: "multiselect", label: "Multi Select", icon: List },
      { type: "boolean", label: "Checkbox", icon: CheckSquare },
    ],
  },
  {
    label: "Date / Time",
    items: [
      { type: "date", label: "Date", icon: Calendar },
      { type: "datetime", label: "Date Time", icon: Calendar },
    ],
  },
  {
    label: "Media",
    items: [
      { type: "file", label: "File Upload", icon: FileUp },
      { type: "signature", label: "Signature", icon: Pen },
    ],
  },
  {
    label: "Layout",
    items: [
      { type: "section", label: "Section", icon: Layers },
      { type: "repeating", label: "Repeating", icon: Repeat },
    ],
  },
  {
    label: "Special",
    items: [
      { type: "computed", label: "Computed", icon: FunctionSquare },
    ],
  },
];

function PaletteItem({
  type,
  label,
  icon: Icon,
}: {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { fieldType: type },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => {
        /* add via dnd only */
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        "cursor-grab active:cursor-grabbing text-left",
        isDragging && "opacity-50",
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-mono shrink-0">
        {type}
      </Badge>
    </button>
  );
}

interface PaletteProps {
  onFieldAdd: (fieldType: string) => void;
  stagedGroups?: Array<{ id: string; label: string }>;
}

export function Palette({ onFieldAdd, stagedGroups = [] }: PaletteProps) {
  const [search, setSearch] = useState("");

  const filtered = fieldTypeGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.type.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-full flex-col border-r bg-muted/30">
      <div className="border-b px-3 py-3">
        <h2 className="text-sm font-semibold mb-2">Fields</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        {filtered.map((group) => (
          <div key={group.label} className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <PaletteItem
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        ))}

        {stagedGroups.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Groups
            </h3>
            <div className="space-y-0.5">
              {stagedGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onFieldAdd(`group:${group.id}`)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{group.label}</span>
                  <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-mono shrink-0">
                    group
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && stagedGroups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No fields match your search.
          </p>
        )}
      </ScrollArea>
    </aside>
  );
}
