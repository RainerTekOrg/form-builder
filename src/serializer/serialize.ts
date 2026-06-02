import type { Schema } from "@coltorapps/builder";
import type { FormPayload, JsonSchema, JsonSchemaProperty, UiSchema, UiSchemaEntry } from "@/src/contract/types";
import { fieldTypeMetaMap, type FieldType } from "@/src/contract/field-types";

type ColtorappsSchema = Schema;

const entityToFieldType: Record<string, FieldType> = {
  textField: "text",
  textareaField: "textarea",
  numberField: "number",
  integerField: "integer",
  selectField: "select",
  multiSelectField: "multiselect",
  booleanField: "boolean",
  dateField: "date",
  datetimeField: "datetime",
  fileField: "file",
  signatureField: "signature",
  section: "section",
  repeating: "repeating",
  computedField: "computed",
};

export function serialize(schema: ColtorappsSchema): FormPayload {
  const jsonSchema: JsonSchema = { type: "object" };
  const uiSchema: UiSchema = {};
  const properties: Record<string, JsonSchemaProperty> = {};
  const required: string[] = [];
  let orderCounter = 0;

  function buildUiEntry(
    entityId: string,
    entities: Record<string, ColtorappsSchema["entities"][string]>,
    key: string,
  ): UiSchemaEntry | null {
    const entity = entities[entityId];
    if (!entity) return null;

    const attrs = entity.attributes as Record<string, unknown>;
    const label = (attrs.label as string) ?? "";
    const fieldType = entityToFieldType[entity.type] ?? "text";
    const meta = fieldTypeMetaMap[fieldType];
    const options = attrs.options as Array<{ value: string; label: string }> | undefined;

    const uiEntry: UiSchemaEntry = {
      "ui:label": label,
      "ui:widget": meta.widget,
      "ui:order": orderCounter++,
      "x-coltorapps-key": key,
    };

    if (attrs.placeholder) uiEntry["ui:placeholder"] = attrs.placeholder as string;
    if (attrs.helpText) uiEntry["ui:help"] = attrs.helpText as string;
    if (attrs.unit) uiEntry["ui:unit"] = attrs.unit as string;
    if (attrs.condition) uiEntry["ui:condition"] = attrs.condition as UiSchemaEntry["ui:condition"];
    if (options && options.length > 0) uiEntry["ui:options"] = options;

    const xGroup = attrs["x-group"];
    if (xGroup) uiEntry["x-group"] = xGroup as UiSchemaEntry["x-group"];

    return uiEntry;
  }

  function walkEntity(
    entityId: string,
    entities: Record<string, ColtorappsSchema["entities"][string]>,
    keyPrefix?: string,
  ): JsonSchemaProperty | undefined {
    const entity = entities[entityId];
    if (!entity) return undefined;

    const attrs = entity.attributes as Record<string, unknown>;
    const rawKey = (attrs.key as string) ?? entityId;
    const dottedKey = keyPrefix && !rawKey.startsWith(keyPrefix)
      ? `${keyPrefix}.${rawKey}`
      : rawKey;
    const fieldType = entityToFieldType[entity.type] ?? "text";
    const meta = fieldTypeMetaMap[fieldType];
    const children = (entity as { children?: string[] }).children;

    // Build and store UI entry for this entity
    const uiEntry = buildUiEntry(entityId, entities, dottedKey);
    if (uiEntry) {
      uiSchema[dottedKey] = uiEntry;
    }

    let jsonProp: JsonSchemaProperty;

    if (meta.isContainer && fieldType === "section") {
      jsonProp = { type: "object" };
      if (children && children.length > 0) {
        const nestedProps: Record<string, JsonSchemaProperty> = {};
        const nestedRequired: string[] = [];
        for (const childId of children) {
          const childJson = walkEntity(childId, entities, dottedKey);
          if (childJson) {
            const childEntity = entities[childId];
            const childAttrs = childEntity?.attributes as Record<string, unknown> ?? {};
            const childFullKey = (childAttrs.key as string) ?? childId;
            const childName = childFullKey.includes(".") ? childFullKey.split(".").pop()! : childFullKey;
            nestedProps[childName] = childJson;
            if (childAttrs.required === true) nestedRequired.push(childName);
          }
        }
        if (Object.keys(nestedProps).length > 0) jsonProp.properties = nestedProps;
        if (nestedRequired.length > 0) jsonProp.required = nestedRequired;
      }
    } else if (meta.isContainer && fieldType === "repeating") {
      jsonProp = { type: "array" };
      if (children && children.length > 0) {
        const itemsProps: Record<string, JsonSchemaProperty> = {};
        for (const childId of children) {
          const childJson = walkEntity(childId, entities, dottedKey);
          if (childJson) {
            const childEntity = entities[childId];
            const childAttrs = childEntity?.attributes as Record<string, unknown> ?? {};
            const childFullKey = (childAttrs.key as string) ?? childId;
            const childName = childFullKey.includes(".") ? childFullKey.split(".").pop()! : childFullKey;
            itemsProps[childName] = childJson;
          }
        }
        jsonProp.items = Object.keys(itemsProps).length > 0
          ? { type: "object", properties: itemsProps }
          : { type: "object" };
      } else {
        jsonProp.items = { type: "object" };
      }
    } else if (meta.isComputed) {
      jsonProp = { type: "string", readOnly: true };
    } else {
      jsonProp = { type: meta.jsonType as JsonSchemaProperty["type"] };
    }

    const validation = attrs.validation as Array<{ type: string; value: number | string }> | undefined;
    if (validation && !meta.isContainer) {
      for (const rule of validation) {
        switch (rule.type) {
          case "min": jsonProp.minimum = rule.value as number; break;
          case "max": jsonProp.maximum = rule.value as number; break;
          case "minLength": jsonProp.minLength = rule.value as number; break;
          case "maxLength": jsonProp.maxLength = rule.value as number; break;
          case "pattern": jsonProp.pattern = rule.value as string; break;
          case "format": jsonProp.format = rule.value as string; break;
        }
      }
    }

    const options = attrs.options as Array<{ value: string; label: string }> | undefined;
    if (options && options.length > 0 && (fieldType === "select" || fieldType === "multiselect")) {
      jsonProp.enum = options.map((o) => o.value);
    }

    return jsonProp;
  }

  for (const entityId of schema.root) {
    const entity = schema.entities[entityId];
    if (!entity) continue;

    const attrs = entity.attributes as Record<string, unknown>;
    const rawKey = (attrs.key as string) ?? entityId;

    const jsonProp = walkEntity(entityId, schema.entities);
    if (jsonProp) {
      properties[rawKey] = jsonProp;
      if (attrs.required === true) {
        required.push(rawKey);
      }
    }
  }

  if (Object.keys(properties).length > 0) jsonSchema.properties = properties;
  if (required.length > 0) jsonSchema.required = required;

  return { schema: jsonSchema, uiSchema };
}
