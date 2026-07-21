import type { BuilderStore, InterpreterStore, Schema } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { collectRepeatingDescendantIds } from "@/src/serializer/repeating-descendants";

/**
 * Extract a values object keyed by property name (matching `schema.properties`)
 * from a coltorapps interpreter store.
 *
 * Container entities (section, repeating) and their `children` are excluded
 * — only leaf fields contribute values. `undefined` / `null` values are also
 * omitted.
 *
 * Exported for testability.
 */
export function extractValues(
  interpreter: InterpreterStore<typeof formBuilder>,
  builderStore: BuilderStore<typeof formBuilder>,
): { values: Record<string, unknown> } {
  const schema = builderStore.getSchema() as Schema<typeof formBuilder>;
  const allValues = interpreter.getEntitiesValues();
  const entities = (schema as unknown as {
    entities: Record<string, { type: string; attributes: Record<string, unknown>; children?: string[] }>;
  }).entities;

  // Fields inside a repeating group belong to its per-row array, never the top level.
  const repeatingDescendants = collectRepeatingDescendantIds(entities);

  const values: Record<string, unknown> = {};

  for (const [entityId, raw] of Object.entries(allValues)) {
    const entity = entities[entityId];
    if (!entity) continue;
    // Sections are containers; their leaf children contribute their own (flat-dotted)
    // values, so the section entity itself emits nothing.
    if (entity.type === "section") continue;
    // A repeating group's child fields only exist to shape a row — the group's own value
    // (the row array) already carries them, so skip them to avoid leaking flat-dotted
    // duplicates like `samples.cfu_plate` alongside the real `samples` array.
    if (repeatingDescendants.has(entityId)) continue;

    const propertyName = entity.attributes.key as string | undefined;
    if (!propertyName) continue;

    // Repeating groups carry an ARRAY of row objects on the entity value itself.
    if (entity.type === "repeating") {
      if (Array.isArray(raw) && raw.length > 0) values[propertyName] = raw;
      continue;
    }

    if (raw === undefined || raw === null) continue;
    values[propertyName] = raw;
  }

  return { values };
}
