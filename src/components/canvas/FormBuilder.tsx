"use client";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BuilderEntities } from "@coltorapps/builder-react";
import type { BuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { DndItem } from "./DndItem";
import { entityComponents } from "@/src/components/entities/entity-components";
import { BuilderStoreProvider } from "./builder-store-context";
import { Plus, Type, AlignLeft, Hash, List, CheckSquare, Calendar, FileUp, Pen, Layers, Repeat, FunctionSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const fieldTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  integer: Hash,
  select: List,
  multiselect: List,
  boolean: CheckSquare,
  date: Calendar,
  datetime: Calendar,
  file: FileUp,
  signature: Pen,
  section: Layers,
  repeating: Repeat,
  computed: FunctionSquare,
};

const fieldTypeLabels: Record<string, string> = {
  text: "Text Field",
  textarea: "Text Area",
  number: "Number",
  integer: "Integer",
  select: "Select",
  multiselect: "Multi Select",
  boolean: "Checkbox",
  date: "Date",
  datetime: "Date Time",
  file: "File Upload",
  signature: "Signature",
  section: "Section",
  repeating: "Repeating",
  computed: "Computed",
};

function EmptyCanvas() {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-droppable" });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20"
      }`}
    >
      <div className="text-center max-w-xs">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">Empty form</h3>
        <p className="text-xs text-muted-foreground">
          Drag a field from the palette or click one to add it to your form.
        </p>
      </div>
    </div>
  );
}

interface FormBuilderProps {
  builderStore: BuilderStore<typeof formBuilder>;
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onDeleteEntity: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function FormBuilder({
  builderStore,
  selectedEntityId,
  onSelectEntity,
  onDeleteEntity,
  onDragEnd,
}: FormBuilderProps) {
  const schema = builderStore.getSchema();
  const hasEntities = schema.root.length > 0;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const entityIds = hasEntities ? [...schema.root] : [];

  return (
    <BuilderStoreProvider store={builderStore}>
    <main className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
        <h2 className="text-sm font-semibold">Canvas</h2>
        <Badge variant="secondary" className="text-xs font-mono">
          {schema.root.length} field{schema.root.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {hasEntities ? (
            <div
              role="region"
              aria-label="Form canvas"
              aria-live="polite"
              aria-atomic="false"
              className="space-y-2 max-w-2xl mx-auto"
            >
              <SortableContext
                items={entityIds}
                strategy={verticalListSortingStrategy}
              >
                <BuilderEntities
                  builderStore={builderStore}
                  components={entityComponents}
                >
                  {({ entity, children }) => (
                    <BuilderStoreProvider store={builderStore}>
                      <DndItem
                        entityId={entity.id}
                        isSelected={entity.id === selectedEntityId}
                        onSelect={() => onSelectEntity(entity.id)}
                        onDelete={() => onDeleteEntity(entity.id)}
                      >
                        {children}
                      </DndItem>
                    </BuilderStoreProvider>
                  )}
                </BuilderEntities>
              </SortableContext>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto h-full">
              <EmptyCanvas />
            </div>
          )}

          <DragOverlay>
            {activeId && activeId.startsWith("palette-") ? (
              (() => {
                const fieldType = activeId.replace("palette-", "");
                const Icon = fieldTypeIcons[fieldType] ?? Type;
                const label = fieldTypeLabels[fieldType] ?? fieldType;
                return (
                  <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-lg text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>Add {label}</span>
                    <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-mono">
                      {fieldType}
                    </Badge>
                  </div>
                );
              })()
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
    </BuilderStoreProvider>
  );
}
