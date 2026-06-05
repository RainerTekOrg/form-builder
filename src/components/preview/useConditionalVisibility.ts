"use client";

import type { BuilderStore, Schema } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import type { UiCondition } from "@/src/contract/types";

type EntityMap = Record<string, { type: string; attributes: Record<string, unknown>; children?: string[] }>;

export function evaluateCondition(
  condition: UiCondition,
  getFieldValue: (fieldKey: string) => unknown,
  keyToEntityId: Map<string, string>,
): boolean {
  const entityId = keyToEntityId.get(condition.field);
  if (!entityId) return false;
  const currentValue = getFieldValue(entityId);

  switch (condition.operator) {
    case "eq":
      return currentValue === condition.value;
    case "neq":
      return currentValue !== condition.value;
    case "gt":
      return typeof currentValue === "number" && typeof condition.value === "number" && currentValue > condition.value;
    case "gte":
      return typeof currentValue === "number" && typeof condition.value === "number" && currentValue >= condition.value;
    case "lt":
      return typeof currentValue === "number" && typeof condition.value === "number" && currentValue < condition.value;
    case "lte":
      return typeof currentValue === "number" && typeof condition.value === "number" && currentValue <= condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(currentValue);
    case "nin":
      return Array.isArray(condition.value) && !condition.value.includes(currentValue);
    case "empty":
      return currentValue === undefined || currentValue === null || currentValue === "";
    case "notEmpty":
      return currentValue !== undefined && currentValue !== null && currentValue !== "";
  }
}

export function computeVisibilityMap(
  allEntities: EntityMap,
  getFieldValue: (entityId: string) => unknown,
  keyToEntityId: Map<string, string>,
): Record<string, boolean> {
  const conditionResults: Record<string, boolean | undefined> = {};

  // First pass: evaluate all conditions
  for (const [entityId, entity] of Object.entries(allEntities)) {
    const condition = entity.attributes.condition as UiCondition | undefined;
    if (condition) {
      conditionResults[entityId] = evaluateCondition(condition, getFieldValue, keyToEntityId);
    }
  }

  // Second pass: determine visibility (visible if no condition or condition is met)
  const visibility: Record<string, boolean> = {};
  for (const entityId of Object.keys(allEntities)) {
    visibility[entityId] = conditionResults[entityId] !== false;
  }

  return visibility;
}

export function useConditionalVisibility(
  allValues: Record<string, unknown>,
  builderStore: BuilderStore<typeof formBuilder>,
): Record<string, boolean> {
  const schema = builderStore.getSchema() as Schema<typeof formBuilder>;
  const allEntities = (schema as unknown as { entities: EntityMap }).entities;

  const keyToEntityId = new Map<string, string>();
  for (const [id, entity] of Object.entries(allEntities)) {
    const k = entity.attributes.key as string | undefined;
    if (k) keyToEntityId.set(k, id);
  }

  return computeVisibilityMap(
    allEntities,
    (entityId) => allValues[entityId],
    keyToEntityId,
  );
}
