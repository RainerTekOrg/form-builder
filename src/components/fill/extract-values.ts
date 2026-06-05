import type { BuilderStore, InterpreterStore, Schema } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";

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
    entities: Record<string, { type: string; attributes: Record<string, unknown> }>;
  }).entities;

  const values: Record<string, unknown> = {};

  for (const [entityId, raw] of Object.entries(allValues)) {
    const entity = entities[entityId];
    if (!entity) continue;
    if (entity.type === "section" || entity.type === "repeating") continue;
    if (raw === undefined || raw === null) continue;

    const propertyName = entity.attributes.key as string | undefined;
    if (!propertyName) continue;
    values[propertyName] = raw;
  }

  return { values };
}
