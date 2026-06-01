export const KEY_REGEX = /^[a-z][a-z0-9_]*$/;

export function generateKey(label: string, existingKeys: Set<string>): string {
  let base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!base) base = "field";
  if (!/^[a-z]/.test(base)) base = `f_${base}`;

  let key = base;
  let i = 2;
  while (existingKeys.has(key)) {
    key = `${base}_${i}`;
    i++;
  }

  return key;
}

export function namespaceKey(parentKey: string, childKey: string): string {
  return `${parentKey}.${childKey}`;
}

export function flattenKeys(schema: {
  root: readonly string[];
  entities: Record<string, { type: string; attributes?: Record<string, unknown> }>;
}): Set<string> {
  const keys = new Set<string>();
  const seen = new Set<string>();
  const queue = [...schema.root];

  while (queue.length > 0) {
    const entityId = queue.shift()!;
    if (seen.has(entityId)) continue;
    seen.add(entityId);

    const entity = schema.entities[entityId];
    if (!entity) continue;

    const key = entity.attributes?.["key"] as string | undefined;
    if (key) keys.add(key);

    const children = (entity as { children?: string[] }).children;
    if (children) queue.push(...children);
  }

  return keys;
}
