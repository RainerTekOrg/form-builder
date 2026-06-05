import type { FormPayload, JsonSchemaProperty } from "@/src/contract/types";

export interface ExpandedEntity {
  type: string;
  attributes: Record<string, unknown>;
  parentId?: string;
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

export function expandGroup(
  group: FormPayload,
  parentKey?: string,
): ExpandedEntity[] {
  const entities: ExpandedEntity[] = [];
  const props = group.schema.properties ?? {};
  const uiSchema = group.uiSchema;

  const keys = Object.keys(props).sort((a, b) => {
    const aOrder = uiSchema[a]?.["ui:order"] ?? 999;
    const bOrder = uiSchema[b]?.["ui:order"] ?? 999;
    return aOrder - bOrder;
  });

  const requiredFields = new Set(group.schema.required ?? []);

  for (const key of keys) {
    const prop = props[key];
    const ui = uiSchema[key];
    const namespacedKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequiredField = requiredFields.has(key);

    const entityType = mapJsonTypeToEntityType(prop.type, ui?.["ui:widget"]);
    const isContainer = prop.type === "object" || prop.type === "array";

    if (isContainer) {
      // Container entity (section or repeating group)
      const attrs: Record<string, unknown> = {};
      if (ui?.["ui:label"]) attrs["label"] = ui["ui:label"];
      attrs["key"] = namespacedKey;
      if (isRequiredField) attrs["required"] = true;
      if (ui?.["ui:condition"]) attrs["condition"] = ui["ui:condition"];
      if (ui?.["ui:width"]) attrs["fieldWidth"] = ui["ui:width"];

      const xGroup = ui?.["x-group"];
      if (xGroup) {
        attrs["x-group"] = xGroup;
      }

      entities.push({ type: entityType, attributes: attrs });

      // Recursively expand children
      const childProps = prop.type === "array" ? prop.items?.properties : prop.properties;
      if (childProps) {
        // Build a child uiSchema matching the child property names
        const childUiSchema: FormPayload["uiSchema"] = {};
        const prefix = namespacedKey + ".";
        for (const [uKey, uVal] of Object.entries(uiSchema)) {
          if (uKey.startsWith(prefix)) {
            childUiSchema[uKey.slice(prefix.length)] = uVal;
          }
        }
        const childGroup: FormPayload = {
          schema: { type: "object", properties: childProps },
          uiSchema: childUiSchema,
        };
        const children = expandGroup(childGroup, namespacedKey);
        entities.push(...children);
      }
    } else {
      // Leaf field
      const attrs: Record<string, unknown> = {};

      if (ui?.["ui:label"]) attrs["label"] = ui["ui:label"];
      attrs["key"] = namespacedKey;
      if (isRequiredField) attrs["required"] = true;
      if (ui?.["ui:placeholder"]) attrs["placeholder"] = ui["ui:placeholder"];
      if (ui?.["ui:help"]) attrs["helpText"] = ui["ui:help"];
      if (ui?.["ui:unit"]) attrs["unit"] = ui["ui:unit"];
      if (ui?.["ui:options"]) attrs["options"] = ui["ui:options"];
      if (prop.enum) attrs["options"] = prop.enum.map((v) => ({ value: v, label: v }));
      if (ui?.["ui:condition"]) attrs["condition"] = ui["ui:condition"];
      if (ui?.["ui:width"]) attrs["fieldWidth"] = ui["ui:width"];
      if (prop.default !== undefined) attrs["defaultValue"] = prop.default;

      const validation = extractValidation(prop);
      if (validation) attrs["validation"] = validation;

      const xGroup = ui?.["x-group"];
      if (xGroup) {
        attrs["x-group"] = xGroup;
      }

      entities.push({ type: entityType, attributes: attrs });
    }
  }

  return entities;
}

function mapJsonTypeToEntityType(
  jsonType: string | undefined,
  widget?: string,
): string {
  if (widget === "textarea") return "textareaField";
  if (widget === "select") return "selectField";
  if (widget === "multiselect") return "multiSelectField";
  if (widget === "checkbox") return "booleanField";
  if (widget === "date") return "dateField";
  if (widget === "datetime") return "datetimeField";
  if (widget === "file") return "fileField";
  if (widget === "signature") return "signatureField";
  if (widget === "number") {
    return jsonType === "integer" ? "integerField" : "numberField";
  }

  if (jsonType === "integer") return "integerField";
  if (jsonType === "number") return "numberField";
  if (jsonType === "boolean") return "booleanField";
  if (jsonType === "object") return "section";
  if (jsonType === "array") return "repeating";

  return "textField";
}
