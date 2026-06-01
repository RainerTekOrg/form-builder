import type { FormPayload } from "@/src/contract/types";

export interface ExpandedEntity {
  type: string;
  attributes: Record<string, unknown>;
  parentId?: string;
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

  for (const key of keys) {
    const prop = props[key];
    const ui = uiSchema[key];
    const namespacedKey = parentKey ? `${parentKey}.${key}` : key;

    const entityType = mapJsonTypeToEntityType(prop.type, ui?.["ui:widget"]);
    const attrs: Record<string, unknown> = {};

    if (ui?.["ui:label"]) attrs["label"] = ui["ui:label"];
    attrs["key"] = namespacedKey;
    if (ui?.["ui:placeholder"]) attrs["placeholder"] = ui["ui:placeholder"];
    if (ui?.["ui:help"]) attrs["helpText"] = ui["ui:help"];
    if (ui?.["ui:unit"]) attrs["unit"] = ui["ui:unit"];
    if (ui?.["ui:options"]) attrs["options"] = ui["ui:options"];
    if (prop.enum) attrs["options"] = prop.enum.map((v) => ({ value: v, label: v }));

    const xGroup = ui?.["x-group"];
    if (xGroup) {
      attrs["x-group"] = xGroup;
    }

    entities.push({ type: entityType, attributes: attrs });
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
  if (jsonType === "array") return "repeating";

  return "textField";
}
