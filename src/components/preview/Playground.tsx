"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useInterpreterStore, InterpreterEntity } from "@coltorapps/builder-react";
import type { BuilderStore, InterpreterStore, Schema } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import type { FieldWidth } from "@/src/contract/types";
import { interactiveEntityComponents } from "./entity-components";
import { useConditionalVisibility } from "./useConditionalVisibility";
import FormValueContext from "./FormValueContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, RotateCcw } from "lucide-react";

interface PlaygroundProps {
  builderStore: BuilderStore<typeof formBuilder>;
  hideHeader?: boolean;
  onInterpreterReady?: (interpreter: InterpreterStore<typeof formBuilder>) => void;
}

type FieldWidthEntry = {
  entityId: string;
  width: FieldWidth;
};

function getFieldWidth(entity: { attributes?: Record<string, unknown> } | undefined): FieldWidth {
  return (entity?.attributes?.["fieldWidth"] as FieldWidth) ?? "full";
}

function groupFieldsByWidth(
  root: readonly string[],
  schema: Schema<typeof formBuilder>,
): (FieldWidthEntry | FieldWidthEntry[])[] {
  const groups: (FieldWidthEntry | FieldWidthEntry[])[] = [];
  let currentRow: FieldWidthEntry[] = [];

  for (const entityId of root) {
    const entity = (schema as unknown as {
      entities: Record<string, { attributes?: Record<string, unknown> }>;
    }).entities[entityId];
    const width = getFieldWidth(entity);

    if (width === "full") {
      if (currentRow.length > 0) {
        groups.push(currentRow);
        currentRow = [];
      }
      groups.push({ entityId, width });
    } else {
      currentRow.push({ entityId, width });
    }
  }

  if (currentRow.length > 0) {
    groups.push(currentRow);
  }

  return groups;
}

export function Playground({
  builderStore,
  hideHeader = false,
  onInterpreterReady,
}: PlaygroundProps) {
  const schema = builderStore.getSchema();
  const hasEntities = schema.root.length > 0;

  const interpreter = useInterpreterStore(formBuilder, schema);

  useEffect(() => {
    if (onInterpreterReady && hasEntities) {
      onInterpreterReady(interpreter);
    }
  }, [interpreter, hasEntities, onInterpreterReady]);

  const handleReset = useCallback(() => {
    interpreter.resetEntitiesValues();
    interpreter.resetEntitiesErrors();
  }, [interpreter]);

  const handleValidateAll = useCallback(() => {
    const schema = builderStore.getSchema();
    const queue = [...schema.root];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const entityId = queue.shift()!;
      if (seen.has(entityId)) continue;
      seen.add(entityId);
      interpreter.validateEntityValue(entityId);
      const entity = (schema as unknown as {
        entities: Record<string, { children?: string[] }>;
      }).entities[entityId];
      if (entity?.children) queue.push(...entity.children);
    }
  }, [interpreter, builderStore]);

  const allValues = interpreter.getEntitiesValues();
  const visibility = useConditionalVisibility(allValues, builderStore);

  const formValueContext = useMemo(() => {
    const schemaEntities = (builderStore.getSchema() as unknown as {
      entities: Record<string, { attributes: Record<string, unknown> }>;
    }).entities;
    const keyToId = new Map<string, string>();
    for (const [id, entity] of Object.entries(schemaEntities)) {
      const k = entity.attributes.key as string | undefined;
      if (k) keyToId.set(k, id);
    }
    return {
      getFieldValue: (fieldKey: string) => {
        const entityId = keyToId.get(fieldKey);
        if (!entityId) return undefined;
        return allValues[entityId];
      },
    };
  }, [allValues, builderStore]);

  const fieldGroups = useMemo(
    () => groupFieldsByWidth(schema.root, schema),
    [schema],
  );

  return (
    <main className="flex h-full flex-col overflow-hidden">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-mono">
              {schema.root.length} field{schema.root.length !== 1 ? "s" : ""}
            </Badge>
            {hasEntities && (
              <>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleValidateAll}>
                  Validate
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        {!hasEntities ? (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-8">
            <div className="text-center max-w-xs">
              <Eye className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="text-sm font-medium mb-1">Nothing to preview</h3>
              <p className="text-xs text-muted-foreground">
                Add some fields in the Build tab first.
              </p>
            </div>
          </div>
        ) : (
          <FormValueContext.Provider value={formValueContext}>
          <div className="max-w-2xl mx-auto p-4">
            <div className="space-y-4">
              {fieldGroups.map((group, i) => {
                if (Array.isArray(group)) {
                  const visible = group.filter((e) => visibility[e.entityId] !== false);
                  if (visible.length === 0) return null;
                  const totalCols = group.reduce((sum, entry) => {
                    const c = entry.width === "full" ? 1 : entry.width === "half" ? 2 : entry.width === "two-thirds" ? 3 : 3;
                    return Math.max(sum, c);
                  }, 1);
                  const maxCols = Math.min(totalCols, 3);
                  return (
                    <div
                      key={i}
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}
                    >
                      {visible.map((entry) => {
                        const colSpan = entry.width === "full" ? maxCols : entry.width === "half" ? Math.max(1, Math.floor(maxCols / 2)) : entry.width === "two-thirds" ? Math.max(1, Math.floor(maxCols * 2 / 3)) : maxCols;
                        return (
                          <div key={entry.entityId} style={{ gridColumn: `span ${colSpan}` }}>
                            <InterpreterEntity
                              interpreterStore={interpreter}
                              entityId={entry.entityId}
                              components={interactiveEntityComponents}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                if (visibility[group.entityId] === false) return null;
                return (
                  <div key={group.entityId}>
                    <InterpreterEntity
                      interpreterStore={interpreter}
                      entityId={group.entityId}
                      components={interactiveEntityComponents}
                    />
                  </div>
                );
              })}
            </div>
            <div className="h-4" />
          </div>
          </FormValueContext.Provider>
        )}
      </ScrollArea>
    </main>
  );
}
