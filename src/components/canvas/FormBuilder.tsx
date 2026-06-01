"use client";

import { useBuilderStore, BuilderEntities } from "@coltorapps/builder-react";
import { formBuilder } from "@/src/builder/form-builder";
import { GripVertical, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FormBuilderProps {
  onSelectEntity: (entityId: string | null) => void;
  selectedEntityId: string | null;
}

export function FormBuilder({ onSelectEntity, selectedEntityId }: FormBuilderProps) {
  const builderStore = useBuilderStore(formBuilder);
  const schema = builderStore.getSchema();

  const hasEntities = schema.root.length > 0;

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
        <h2 className="text-sm font-semibold">Canvas</h2>
        <Badge variant="secondary" className="text-xs font-mono">
          {schema.root.length} field{schema.root.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!hasEntities ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">Empty form</h3>
              <p className="text-xs text-muted-foreground">
                Click a field type in the palette to add it to your form.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl mx-auto">
            {schema.root.map((entityId) => {
              const entity = schema.entities[entityId];
              const isSelected = entityId === selectedEntityId;
              return (
                <Card
                  key={entityId}
                  className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? "ring-2 ring-primary border-primary" : ""
                  }`}
                  onClick={() => onSelectEntity(entityId)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(entity.attributes as Record<string, unknown>)?.["label"] as string ?? "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {entity.type} — {(entity.attributes as Record<string, unknown>)?.["key"] as string ?? ""}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
