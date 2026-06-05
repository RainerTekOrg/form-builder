import type { BuilderStore, Schema } from "@coltorapps/builder";
import type { FillPayload, UiSchema, UiSchemaEntry } from "@/src/contract/types";
import { formBuilder } from "@/src/builder/form-builder";

export interface InterpreterLike {
  setEntityValue(entityId: string, value: unknown): void;
}

/**
 * Apply pre-filled defaults from a `LOAD_FILL` payload to the coltorapps
 * interpreter. Returns the number of values actually applied.
 *
 * Lookup order for each default key:
 *   1. `x-coltorapps-key` in the uiSchema entry
 *   2. Property name in `schema.properties`
 *
 * Unknown keys are silently ignored.
 */
export function applyDefaults(
  interpreter: InterpreterLike,
  builderStore: BuilderStore<typeof formBuilder>,
  payload: FillPayload,
): number {
  if (!payload.defaults) return 0;
  const schema = builderStore.getSchema() as Schema<typeof formBuilder>;
  const uiSchema = payload.uiSchema;

  const keyToEntityId = buildKeyToEntityMap(schema, uiSchema);

  let applied = 0;
  for (const [key, value] of Object.entries(payload.defaults)) {
    const entityId = keyToEntityId.get(key);
    if (entityId) {
      interpreter.setEntityValue(entityId, value);
      applied++;
    }
  }

  // Apply builder-defined default values for fields not overridden by host defaults
  const seenKeys = new Set(Object.keys(payload.defaults ?? {}));
  const schemaEntities = (schema as unknown as {
    entities: Record<string, { attributes: Record<string, unknown> }>;
  }).entities;
  for (const [entityId, entity] of Object.entries(schemaEntities)) {
    const propertyName = entity.attributes.key as string | undefined;
    if (!propertyName || seenKeys.has(propertyName)) continue;
    const defaultValue = entity.attributes.defaultValue;
    if (defaultValue !== undefined) {
      interpreter.setEntityValue(entityId, defaultValue);
      applied++;
    }
  }

  return applied;
}

/**
 * Build a map from canonical key (x-coltorapps-key or property name)
 * to entityId, walking the schema's entities once.
 *
 * Exported for testability.
 */
export function buildKeyToEntityMap(
  schema: Schema<typeof formBuilder>,
  uiSchema: UiSchema,
): Map<string, string> {
  const map = new Map<string, string>();
  const entities = (schema as unknown as {
    entities: Record<string, { attributes: Record<string, unknown> }>;
  }).entities;

  for (const entityId of Object.keys(entities)) {
    const entity = entities[entityId];
    const propertyName = entity.attributes.key as string | undefined;
    if (!propertyName) continue;

    const uiEntry = uiSchema[propertyName] as UiSchemaEntry | undefined;
    const canonicalKey = (uiEntry?.["x-coltorapps-key"] as string) ?? propertyName;
    map.set(canonicalKey, entityId);
  }
  return map;
}
