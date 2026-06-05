"use client";

import { useState, useCallback } from "react";
import { useBuilderStore } from "@coltorapps/builder-react";
import { formBuilder } from "@/src/builder/form-builder";
import { generateKey, flattenKeys } from "@/src/serializer/key";

export type EntityType = (typeof formBuilder)["entities"][number]["name"];

export function useBuilderSetup() {
  const builderStore = useBuilderStore(formBuilder);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const schema = builderStore.getSchema();
  const existingKeys = flattenKeys(schema);

  const addEntity = useCallback(
    (type: string, overrides?: Record<string, unknown>) => {
      const label = (overrides?.label as string) ?? type;
      const key = generateKey(label, new Set(existingKeys));

      const entity = builderStore.addEntity({
        type: type as EntityType,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attributes: { label, key, ...overrides } as any,
      });

      setSelectedEntityId(entity.id);
      return entity;
    },
    [builderStore, existingKeys],
  );

  const detectCollision = useCallback(
    (label: string): { originalKey: string; renamedKey: string } | null => {
      const originalKey = generateKey(label, new Set());
      const existing = new Set(existingKeys);
      if (!existing.has(originalKey)) return null;
      const renamedKey = generateKey(label, existing);
      return { originalKey, renamedKey };
    },
    [existingKeys],
  );

  const deleteEntity = useCallback(
    (entityId: string) => {
      builderStore.deleteEntity(entityId);
      if (selectedEntityId === entityId) {
        setSelectedEntityId(null);
      }
    },
    [builderStore, selectedEntityId],
  );

  const moveEntity = useCallback(
    (entityId: string, toIndex: number) => {
      builderStore.setEntityIndex(entityId, toIndex);
    },
    [builderStore],
  );

  const cloneField = useCallback(
    (entityId: string) => {
      const before = builderStore.getSchema();
      const beforeIds = new Set(Object.keys(before.entities));
      builderStore.cloneEntity(entityId);

      const after = builderStore.getSchema();
      const newId = Object.keys(after.entities).find((id) => !beforeIds.has(id));
      if (!newId) return null;

      const sourceAttrs = before.entities[entityId]?.attributes as Record<string, unknown> | undefined;
      const sourceLabel = (sourceAttrs?.label as string) ?? "Field";
      const existingKeys = flattenKeys(after);
      const label = `${sourceLabel} (copy)`;
      const key = generateKey(label, new Set(existingKeys));
      builderStore.setEntityAttribute(newId, "label", label);
      builderStore.setEntityAttribute(newId, "key", key);
      setSelectedEntityId(newId);
      return after.entities[newId];
    },
    [builderStore],
  );

  const clearForm = useCallback(() => {
    builderStore.setData({
      schema: { root: [], entities: {} },
      entitiesAttributesErrors: {},
      schemaError: undefined,
    });
    setSelectedEntityId(null);
  }, [builderStore]);

  return {
    builderStore,
    selectedEntityId,
    setSelectedEntityId,
    addEntity,
    deleteEntity,
    moveEntity,
    cloneField,
    clearForm,
    detectCollision,
  };
}
