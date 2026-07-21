"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useInterpreterStore, InterpreterEntity, useBuilderStoreData } from "@coltorapps/builder-react";
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
  /** When true, the content flows at its natural height (no inner scroll) so the host
   *  page can scroll and size the iframe (embedded fill mode). */
  autoHeight?: boolean;
  onInterpreterReady?: (interpreter: InterpreterStore<typeof formBuilder>) => void;
}

type SchemaEntity = {
  type: string;
  attributes?: Record<string, unknown>;
  children?: string[];
};

type FieldWidthEntry = {
  entityId: string;
  width: FieldWidth;
};

const ENTITY_DEFAULT_WIDTH: Record<string, FieldWidth> = {
  textField: "half",
  numberField: "half",
  integerField: "half",
  selectField: "half",
  multiSelectField: "half",
  booleanField: "half",
  dateField: "half",
  datetimeField: "half",
  textareaField: "full",
  fileField: "full",
  signatureField: "full",
  section: "full",
  repeating: "full",
  computedField: "full",
};

// A 6-column grid is the common denominator of halves, thirds, and two-thirds.
const WIDTH_UNITS: Record<FieldWidth, number> = {
  full: 6,
  "two-thirds": 4,
  half: 3,
  third: 2,
};

// Static classes (never build these dynamically — Tailwind must see the literals).
const SPAN_CLASS: Record<FieldWidth, string> = {
  full: "sm:col-span-6",
  "two-thirds": "sm:col-span-4",
  half: "sm:col-span-3",
  third: "sm:col-span-2",
};

const ROW_UNITS = 6;

function getFieldWidth(
  entityType: string,
  attributes?: Record<string, unknown>,
): FieldWidth {
  const explicit = attributes?.["fieldWidth"] as FieldWidth | undefined;
  if (explicit && explicit in WIDTH_UNITS) return explicit;
  return ENTITY_DEFAULT_WIDTH[entityType] ?? "half";
}

/**
 * Pack fields into rows of at most 6 width-units so every field honors its
 * chosen width (full / two-thirds / half / third) without leaving mid-row gaps.
 * A field that would overflow the current row starts a new one; a full-width
 * field always sits on its own row.
 */
export function groupFieldsByWidth(
  root: readonly string[],
  entities: Record<string, SchemaEntity>,
): FieldWidthEntry[][] {
  const rows: FieldWidthEntry[][] = [];
  let currentRow: FieldWidthEntry[] = [];
  let used = 0;

  const flush = () => {
    if (currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      used = 0;
    }
  };

  for (const entityId of root) {
    const entity = entities[entityId];
    const width = getFieldWidth(entity?.type ?? "", entity?.attributes);
    const units = WIDTH_UNITS[width];

    if (width === "full") {
      flush();
      rows.push([{ entityId, width }]);
      continue;
    }
    if (used + units > ROW_UNITS) flush();
    currentRow.push({ entityId, width });
    used += units;
  }

  flush();
  return rows;
}

export function Playground({
  builderStore,
  hideHeader = false,
  autoHeight = false,
  onInterpreterReady,
}: PlaygroundProps) {
  // STABLE schema reference. useInterpreterStore memoizes the interpreter on [builder,
  // schema] and rebuilds it — wiping every entered value — whenever the schema reference
  // changes. builderStore.getSchema() returns a FRESH object on each render, so passing it
  // directly recreated the interpreter on any re-render (e.g. the setIsValid that fires
  // when a required field is filled), silently discarding what the user just entered.
  // useBuilderStoreData caches the schema and only yields a new reference when the store
  // actually changes (a new form is loaded / edited), which is exactly when we DO want a
  // fresh interpreter.
  const { schema } = useBuilderStoreData(builderStore);
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
      entities: Record<string, { type: string; attributes: Record<string, unknown>; children?: string[] }>;
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
      entities: schemaEntities,
    };
  }, [allValues, builderStore]);

  const rawEntities = (schema as unknown as {
    entities: Record<string, SchemaEntity>;
  }).entities;

  const fieldGroups = useMemo(
    () => groupFieldsByWidth(schema.root, rawEntities),
    [schema, rawEntities],
  );

  const renderField = (entityId: string) => (
    <InterpreterEntity
      key={entityId}
      interpreterStore={interpreter}
      entityId={entityId}
      components={interactiveEntityComponents}
    />
  );

  const totalFields = Object.keys(rawEntities).length;

  const formBody = !hasEntities ? (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <Eye className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="text-sm font-medium mb-1">Nothing to preview</h3>
        <p className="text-xs text-muted-foreground">Add some fields in the Build tab first.</p>
      </div>
    </div>
  ) : (
    <FormValueContext.Provider value={formValueContext}>
      <div className="flex justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-card rounded-xl border border-border shadow-sm p-5 md:p-8 space-y-6">
          {fieldGroups.map((row, i) => {
            const visible = row.filter((e) => visibility[e.entityId] !== false);
            if (visible.length === 0) return null;
            // A field left alone on its row reads better stretched to full width
            // than sitting at a lonely partial width.
            const singleInRow = visible.length === 1;
            return (
              <div key={i} className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                {visible.map((entry) => (
                  <div
                    key={entry.entityId}
                    className={singleInRow ? SPAN_CLASS.full : SPAN_CLASS[entry.width]}
                  >
                    {renderField(entry.entityId)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </FormValueContext.Provider>
  );

  return (
    <main className={autoHeight ? "flex flex-col w-full" : "flex h-full flex-col overflow-hidden w-full"}>
      {!hideHeader && (
        <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* <Eye className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Preview</h2> */}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-mono">
              {totalFields} field{totalFields !== 1 ? "s" : ""}
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

      {autoHeight ? (
        <div className="w-full">{formBody}</div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">{formBody}</ScrollArea>
      )}
    </main>
  );
}
