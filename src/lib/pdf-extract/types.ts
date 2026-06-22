/**
 * PDF → form-field extraction: shared types + the structured-output JSON schema.
 *
 * The same JSON schema drives Anthropic's `output_config.format` and OpenAI's
 * `response_format.json_schema`, so every provider returns the identical shape.
 */

/** Builder field types the extractor may emit (subset of the form-builder vocabulary). */
export const EXTRACTABLE_FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'integer',
  'select',
  'multiselect',
  'boolean',
  'date',
  'datetime',
  'section',
  'repeating',
] as const;

export type ExtractableFieldType = (typeof EXTRACTABLE_FIELD_TYPES)[number];

/** Map an extracted field type → the coltorapps builder entity name (for addEntity). */
export const FIELD_TYPE_TO_ENTITY: Record<ExtractableFieldType, string> = {
  text: 'textField',
  textarea: 'textareaField',
  number: 'numberField',
  integer: 'integerField',
  select: 'selectField',
  multiselect: 'multiSelectField',
  boolean: 'booleanField',
  date: 'dateField',
  datetime: 'datetimeField',
  section: 'section',
  repeating: 'repeating',
};

export interface ExtractedOption {
  value: string;
  label: string;
}

export interface ExtractedField {
  /** snake_case identifier, /^[a-z][a-z0-9_]*$/ — normalized on the way out. */
  key: string;
  label: string;
  type: ExtractableFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  /** Choice options (select / multiselect). */
  options?: ExtractedOption[];
  /** For `section` / `repeating` containers: the fields nested inside them. */
  children?: ExtractedField[];
}

export interface ExtractResult {
  title?: string;
  fields: ExtractedField[];
  provider: string;
  model: string;
  warnings?: string[];
}

/**
 * JSON Schema for the structured response. Kept within the structured-output
 * intersection both providers support: object/array/string/boolean + enum +
 * additionalProperties:false (no min/max/length constraints).
 */
const OPTIONS_SCHEMA = {
  type: 'array',
  description: 'Only for select / multiselect.',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: { value: { type: 'string' }, label: { type: 'string' } },
    required: ['value', 'label'],
  },
} as const;

/** A leaf field inside a section/repeating container (no further nesting). */
const CHILD_FIELD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    key: { type: 'string', description: 'snake_case identifier.' },
    label: { type: 'string' },
    type: { type: 'string', enum: [...EXTRACTABLE_FIELD_TYPES] },
    required: { type: 'boolean' },
    placeholder: { type: 'string' },
    helpText: { type: 'string' },
    options: OPTIONS_SCHEMA,
  },
  required: ['key', 'label', 'type'],
} as const;

export const FIELD_LIST_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', description: 'A short title for the form, inferred from the document.' },
    fields: {
      type: 'array',
      description: 'Every input the form collects from a person, in document order.',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          key: { type: 'string', description: 'snake_case identifier, e.g. "sample_id".' },
          label: { type: 'string' },
          type: { type: 'string', enum: [...EXTRACTABLE_FIELD_TYPES] },
          required: { type: 'boolean' },
          placeholder: { type: 'string' },
          helpText: { type: 'string' },
          options: OPTIONS_SCHEMA,
          children: {
            type: 'array',
            description:
              'For type "section" or "repeating" ONLY: the fields nested inside this group/table. Leave empty for normal fields.',
            items: CHILD_FIELD_SCHEMA,
          },
        },
        required: ['key', 'label', 'type'],
      },
    },
  },
  required: ['fields'],
} as const;
