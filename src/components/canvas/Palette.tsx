"use client";

import { forwardRef, useState, useImperativeHandle, useRef } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const fieldTypeGroups = [
  {
    label: "Inputs",
    items: [
      { widget: "text", entity: "textField", label: "Text Field", icon: Type },
      { widget: "textarea", entity: "textareaField", label: "Text Area", icon: AlignLeft },
      { widget: "number", entity: "numberField", label: "Number", icon: Hash },
      { widget: "integer", entity: "integerField", label: "Integer", icon: Hash },
    ],
  },
  {
    label: "Choice",
    items: [
      { widget: "select", entity: "selectField", label: "Select", icon: List },
      { widget: "multiselect", entity: "multiSelectField", label: "Multi Select", icon: List },
      { widget: "boolean", entity: "booleanField", label: "Checkbox", icon: CheckSquare },
    ],
  },
  {
    label: "Date / Time",
    items: [
      { widget: "date", entity: "dateField", label: "Date", icon: Calendar },
      { widget: "datetime", entity: "datetimeField", label: "Date Time", icon: Calendar },
    ],
  },
  {
    label: "Media",
    items: [
      { widget: "file", entity: "fileField", label: "File Upload", icon: FileUp },
      { widget: "signature", entity: "signatureField", label: "Signature", icon: Pen },
    ],
  },
  {
    label: "Layout",
    items: [
      { widget: "section", entity: "section", label: "Section", icon: Layers },
      { widget: "repeating", entity: "repeating", label: "Repeating", icon: Repeat },
    ],
  },
  {
    label: "Special",
    items: [
      { widget: "computed", entity: "computedField", label: "Computed", icon: FunctionSquare },
    ],
  },
];

function PaletteItem({
  widget,
  entity,
  label,
  icon: Icon,
  onAdd,
}: {
  widget: string;
  entity: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onAdd: (entity: string, label: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${entity}`,
    data: { entity, label },
  });

  const handleClick = () => {
    if (isDragging) return;
    onAdd(entity, label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDragging) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAdd(entity, label);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        "cursor-grab active:cursor-grabbing text-left",
        isDragging && "opacity-50",
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-mono shrink-0">
        {widget}
      </Badge>
    </div>
  );
}

interface PaletteProps {
  onFieldAdd: (entityOrGroup: string, label?: string) => void;
  stagedGroups?: Array<{ id: string; label: string; payload?: { schema?: { properties?: Record<string, unknown> } } }>;
}

export const Palette = forwardRef<{ focusSearch: () => void }, PaletteProps>(function Palette(
  { onFieldAdd, stagedGroups = [] },
  ref,
) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchRef.current?.focus();
      searchRef.current?.select();
    },
  }), []);

  const filtered = fieldTypeGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.entity.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-full flex-col border-r bg-muted/30">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold mb-2">Fields</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchRef}
            placeholder="Search fields…  ( / )"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-4 py-3">
        {filtered.map((group) => (
          <div key={group.label} className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span>{group.label}</span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                ({group.items.length})
              </span>
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <PaletteItem
                  key={item.entity}
                  widget={item.widget}
                  entity={item.entity}
                  label={item.label}
                  icon={item.icon}
                  onAdd={onFieldAdd}
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
              {stagedGroups.map((group) => {
                const fields = Object.keys(group.payload?.schema?.properties ?? {});
                const fieldCount = fields.length;
                const preview = fields.length > 0 ? fields.join(", ") : "(no fields)";
                return (
                  <Tooltip key={group.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onFieldAdd(`group:${group.id}`)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                      >
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{group.label}</span>
                        <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-mono shrink-0">
                          {fieldCount > 0 ? `group · ${fieldCount}` : "group"}
                        </Badge>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">{group.label}</p>
                      <p className="text-xs text-muted-foreground">{preview}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && stagedGroups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No fields match your search.
          </p>
        )}
        <div className="h-3" />
      </ScrollArea>
    </aside>
  );
});
