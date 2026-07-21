/**
 * Ids of every entity that lives inside a repeating group (recursively, so nested
 * containers are covered).
 *
 * A repeating group stores its data as an ARRAY of row objects on the repeating entity
 * itself; its child field entities are only templates for a row and must never contribute
 * a value on their own. If they do (e.g. re-hydrated from a stale default), they leak into
 * `record.data` as flat-dotted top-level keys like `samples.cfu_plate` alongside the real
 * `samples` array — polluting the saved record and the report context.
 *
 * Shared by extractValues (don't emit them) and applyDefaults (don't re-hydrate them).
 */
export function collectRepeatingDescendantIds(
  entities: Record<string, { type: string; children?: string[] }>,
): Set<string> {
  const out = new Set<string>();
  const walk = (id: string) => {
    const entity = entities[id];
    if (!entity?.children) return;
    for (const childId of entity.children) {
      out.add(childId);
      walk(childId);
    }
  };
  for (const [id, entity] of Object.entries(entities)) {
    if (entity.type === "repeating") walk(id);
  }
  return out;
}
