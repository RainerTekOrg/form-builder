/**
 * Normalize raw extracted fields into safe, builder-ready field specs:
 * valid snake_case unique keys (across the whole tree), known types, options
 * for choice fields, and children only on section/repeating containers.
 */
import { EXTRACTABLE_FIELD_TYPES, type ExtractableFieldType, type ExtractedField } from './types';

const TYPES = new Set<string>(EXTRACTABLE_FIELD_TYPES);

export function sanitizeKey(raw: string, fallback: string): string {
  let key = (raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');
  if (!/^[a-z]/.test(key)) key = `f_${key}`;
  return key || fallback;
}

export function normalizeFields(fields: ExtractedField[]): ExtractedField[] {
  const used = new Set<string>();

  const one = (f: ExtractedField, idx: number): ExtractedField => {
    const type: ExtractableFieldType = TYPES.has(f.type) ? f.type : 'text';

    let key = sanitizeKey(f.key || f.label || `field_${idx + 1}`, `field_${idx + 1}`);
    while (used.has(key)) key = `${key}_${used.size + 1}`;
    used.add(key);

    const needsOptions = type === 'select' || type === 'multiselect';
    const options = needsOptions
      ? (f.options ?? [])
          .filter((o) => o && (o.value || o.label))
          .map((o) => ({ value: sanitizeKey(o.value || o.label, 'option'), label: o.label || o.value }))
      : undefined;

    const isContainer = type === 'section' || type === 'repeating';
    const children =
      isContainer && Array.isArray(f.children) && f.children.length
        ? f.children.map((c, ci) => one(c, ci))
        : undefined;

    return {
      key,
      label: (f.label || key).trim(),
      type,
      required: Boolean(f.required),
      placeholder: f.placeholder || undefined,
      helpText: f.helpText || undefined,
      options: options && options.length ? options : undefined,
      children: children && children.length ? children : undefined,
    };
  };

  return fields.map((f, i) => one(f, i));
}
