export interface JsonSchema {
  type: "object";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  $schema?: string;
}

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  readOnly?: boolean;
  default?: unknown;
}

export interface UiSchema {
  [key: string]: UiSchemaEntry | undefined;
}

export type FieldWidth = "full" | "half" | "third" | "two-thirds";

export interface UiSchemaEntry {
  "ui:label"?: string;
  "ui:widget"?: string;
  "ui:help"?: string;
  "ui:placeholder"?: string;
  "ui:order"?: number;
  "ui:section"?: string;
  "ui:hidden"?: boolean;
  "ui:condition"?: UiCondition;
  "ui:unit"?: string;
  "ui:options"?: UiOption[];
  "ui:width"?: FieldWidth;
  "x-coltorapps-key"?: string;
  "x-group"?: GroupProvenance;
}

export interface UiCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "empty" | "notEmpty";
  value: unknown;
}

export interface UiOption {
  value: string;
  label: string;
}

export interface GroupProvenance {
  sourceGroupId: string;
  sourceGroupVersion: number;
}

export interface FormPayload {
  title?: string;
  schema: JsonSchema;
  uiSchema: UiSchema;
}

export interface GroupPayload extends FormPayload {
  groupId: string;
  version: number;
}

export interface FillPayload {
  title?: string;
  schema: JsonSchema;
  uiSchema: UiSchema;
  /**
   * Pre-filled values supplied by the host. Keys are the canonical
   * `x-coltorapps-key` from the uiSchema, with fallback to the property
   * name in `schema.properties`. Unknown keys are silently ignored.
   */
  defaults?: Record<string, unknown>;
}

export interface FilledPayload {
  values: Record<string, unknown>;
  schema: JsonSchema;
  uiSchema: UiSchema;
}

export type InboundMessage =
  | { type: "LOAD_FORM"; payload: FormPayload }
  | { type: "LOAD_GROUP"; payload: GroupPayload }
  | { type: "LOAD_FILL"; payload: FillPayload }
  | { type: "SET_CONFIG"; payload: { allowedFieldTypes?: string[]; theme?: "light" | "dark"; mode?: "build" | "preview" } }
  | { type: "TRIGGER_SAVE" };

export type OutboundMessage =
  | { type: "FORM_SAVED"; payload: FormPayload }
  | { type: "FORM_FILLED"; payload: FilledPayload }
  | { type: "FILL_CANCELLED" }
  | { type: "ERROR"; code: string; message: string }
  | { type: "BUILDER_READY" }
  | { type: "DIRTY_STATE"; payload: { isDirty: boolean } }
  // Emitted (debounced) in fill mode whenever entered values change, so the host
  // can react to dependent fields (e.g. re-baking a dependent select's options).
  | { type: "VALUES_CHANGED"; payload: { values: Record<string, unknown> } };
