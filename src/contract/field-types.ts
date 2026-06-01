export const fieldTypes = [
  "text",
  "textarea",
  "number",
  "integer",
  "select",
  "multiselect",
  "boolean",
  "date",
  "datetime",
  "file",
  "signature",
  "section",
  "repeating",
  "computed",
] as const;

export type FieldType = (typeof fieldTypes)[number];

export type FieldTypeMeta = {
  jsonType: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  widget: string;
  isContainer: boolean;
  isComputed: boolean;
  defaultAttrs: Record<string, unknown>;
};

export const fieldTypeMetaMap: Record<FieldType, FieldTypeMeta> = {
  text: {
    jsonType: "string",
    widget: "text",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  textarea: {
    jsonType: "string",
    widget: "textarea",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  number: {
    jsonType: "number",
    widget: "number",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  integer: {
    jsonType: "integer",
    widget: "number",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  select: {
    jsonType: "string",
    widget: "select",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  multiselect: {
    jsonType: "array",
    widget: "multiselect",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  boolean: {
    jsonType: "boolean",
    widget: "checkbox",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  date: {
    jsonType: "string",
    widget: "date",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  datetime: {
    jsonType: "string",
    widget: "datetime",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  file: {
    jsonType: "string",
    widget: "file",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  signature: {
    jsonType: "string",
    widget: "signature",
    isContainer: false,
    isComputed: false,
    defaultAttrs: {},
  },
  section: {
    jsonType: "object",
    widget: "section",
    isContainer: true,
    isComputed: false,
    defaultAttrs: {},
  },
  repeating: {
    jsonType: "array",
    widget: "repeating",
    isContainer: true,
    isComputed: false,
    defaultAttrs: {},
  },
  computed: {
    jsonType: "string",
    widget: "computed",
    isContainer: false,
    isComputed: true,
    defaultAttrs: {},
  },
};
