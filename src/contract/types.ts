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
}

export interface UiSchema {
  [key: string]: UiSchemaEntry | undefined;
}

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
  schema: JsonSchema;
  uiSchema: UiSchema;
}

export interface GroupPayload extends FormPayload {
  groupId: string;
  version: number;
}

export type InboundMessage =
  | { type: "LOAD_FORM"; payload: FormPayload }
  | { type: "LOAD_GROUP"; payload: GroupPayload };

export type OutboundMessage =
  | { type: "FORM_SAVED"; payload: FormPayload }
  | { type: "ERROR"; code: string; message: string };
