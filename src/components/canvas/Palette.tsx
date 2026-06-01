"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Type, AlignLeft, Hash, List, CheckSquare, Calendar, FileUp, Pen, Layers, Repeat, FunctionSquare } from "lucide-react";

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

interface PaletteProps {
  onFieldAdd: (fieldType: string) => void;
}

export function Palette({ onFieldAdd }: PaletteProps) {
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
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => onFieldAdd(item.type)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-grab active:cursor-grabbing text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <Badge
                      variant="secondary"
                      className="h-5 text-[10px] px-1.5 font-mono"
                    >
                      {item.type}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No fields match your search.
          </p>
        )}
      </ScrollArea>
    </aside>
  );
}
