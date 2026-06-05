import { createBuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import type { FormPayload, JsonSchemaProperty, UiSchemaEntry } from "@/src/contract/types";
import { generateKey } from "./key";

const fieldTypeToEntity: Record<string, string> = {
  text: "textField",
  textarea: "textareaField",
  number: "numberField",
  integer: "integerField",
  select: "selectField",
  multiselect: "multiSelectField",
  boolean: "booleanField",
  date: "dateField",
  datetime: "datetimeField",
  file: "fileField",
  signature: "signatureField",
  section: "section",
  repeating: "repeating",
  computed: "computedField",
};

const allowedAttrs = new Set([
  "key", "label", "required", "placeholder", "helpText",
  "options", "validation", "unit", "condition", "formula",
  "fieldWidth", "defaultValue",
]);

function guessEntityType(widget: string | undefined, jsonType?: string): string {
  if (widget && fieldTypeToEntity[widget]) return fieldTypeToEntity[widget];
  if (jsonType === "integer") return "integerField";
  if (jsonType === "number") return "numberField";
  if (jsonType === "boolean") return "booleanField";
  if (jsonType === "array") return "repeating";
  if (jsonType === "object") return "section";
  return "textField";
}

function extractValidation(json: JsonSchemaProperty): Array<{ type: string; value: number | string }> | undefined {
  const rules: Array<{ type: string; value: number | string }> = [];
  if (json.minimum !== undefined) rules.push({ type: "min", value: json.minimum });
  if (json.maximum !== undefined) rules.push({ type: "max", value: json.maximum });
  if (json.minLength !== undefined) rules.push({ type: "minLength", value: json.minLength });
  if (json.maxLength !== undefined) rules.push({ type: "maxLength", value: json.maxLength });
  if (json.pattern !== undefined) rules.push({ type: "pattern", value: json.pattern });
  if (json.format !== undefined) rules.push({ type: "format", value: json.format });
  return rules.length > 0 ? rules : undefined;
}

function buildAttributes(
  ui: UiSchemaEntry | undefined,
  json: JsonSchemaProperty,
  key: string,
): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};

  attrs.key = key;
  if (ui?.["ui:label"]) attrs.label = ui["ui:label"];
  if (ui?.["ui:placeholder"]) attrs.placeholder = ui["ui:placeholder"];
  if (ui?.["ui:help"]) attrs.helpText = ui["ui:help"];
  if (ui?.["ui:condition"]) attrs.condition = ui["ui:condition"];
  if (ui?.["ui:unit"]) attrs.unit = ui["ui:unit"];
  if (ui?.["ui:width"]) attrs.fieldWidth = ui["ui:width"];
  if (ui?.["ui:options"]) attrs.options = ui["ui:options"];

  if (json.enum) {
    attrs.options = json.enum.map((v: string) => ({ value: v, label: v }));
  }

  if (json.default !== undefined) attrs.defaultValue = json.default;

  const validation = extractValidation(json);
  if (validation) attrs.validation = validation;

  return attrs;
}

function stripUnknown(attrs: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(attrs)) {
    if (allowedAttrs.has(key)) clean[key] = val;
  }
  return clean;
}

function isRequired(key: string, required?: string[]): boolean {
  return required?.includes(key) ?? false;
}

export function deserialize(payload: FormPayload) {
  const { schema, uiSchema } = payload;
  const store = createBuilderStore(formBuilder);
  const existingKeys = new Set<string>();

  function walkProperties(
    props: Record<string, JsonSchemaProperty> | undefined,
    req: string[] | undefined,
    parentId?: string,
    keyPrefix?: string,
  ): void {
    if (!props) return;

    const entries = Object.entries(props).sort(([aKey], [bKey]) => {
      const aFullKey = keyPrefix ? `${keyPrefix}.${aKey}` : aKey;
      const bFullKey = keyPrefix ? `${keyPrefix}.${bKey}` : bKey;
      const aOrder = (uiSchema as Record<string, UiSchemaEntry | undefined>)[aFullKey]?.["ui:order"] ?? 999;
      const bOrder = (uiSchema as Record<string, UiSchemaEntry | undefined>)[bFullKey]?.["ui:order"] ?? 999;
      return aOrder - bOrder;
    });

    for (const [propKey, jsonProp] of entries) {
      const fullUiKey = keyPrefix ? `${keyPrefix}.${propKey}` : propKey;
      const ui = (uiSchema as Record<string, UiSchemaEntry | undefined>)[fullUiKey];
      const coltorappsKey = ui?.["x-coltorapps-key"] ?? propKey;
      const entityType = guessEntityType(ui?.["ui:widget"], jsonProp.type);
      const isRequiredField = isRequired(propKey, req ?? schema.required);

      if (jsonProp.type === "object" && entityType === "section") {
        if (existingKeys.has(coltorappsKey)) continue;
        existingKeys.add(coltorappsKey);

        const section = store.addEntity({
          type: "section" as never,
          attributes: {
            label: ui?.["ui:label"] ?? coltorappsKey,
            key: coltorappsKey,
            required: isRequiredField,
          } as never,
        } as never);

        if (parentId) {
          store.setEntityParent(section.id, parentId);
        }

        if (jsonProp.properties) {
          walkProperties(jsonProp.properties, jsonProp.required, section.id, coltorappsKey);
        }
        continue;
      }

      if (jsonProp.type === "array" && entityType === "repeating") {
        if (existingKeys.has(coltorappsKey)) continue;
        existingKeys.add(coltorappsKey);

        const repeating = store.addEntity({
          type: "repeating" as never,
          attributes: {
            label: ui?.["ui:label"] ?? coltorappsKey,
            key: coltorappsKey,
          } as never,
        } as never);

        if (parentId) {
          store.setEntityParent(repeating.id, parentId);
        }

        if (jsonProp.items?.properties) {
          walkProperties(jsonProp.items.properties, [], repeating.id, coltorappsKey);
        }
        continue;
      }

      const buildEntity = (key: string) => {
        existingKeys.add(key);
        const attrs = buildAttributes(ui, jsonProp, key);
        attrs.required = isRequiredField;
        const entity = store.addEntity({
          type: entityType as never,
          attributes: stripUnknown(attrs) as never,
        } as never);
        if (parentId) {
          store.setEntityParent(entity.id, parentId);
        }
      };

      if (existingKeys.has(coltorappsKey)) {
        const newKey = generateKey(ui?.["ui:label"] ?? coltorappsKey, existingKeys);
        buildEntity(newKey);
      } else {
        buildEntity(coltorappsKey);
      }
    }
  }

  walkProperties(schema.properties, schema.required);

  return store.getSchema();
}
