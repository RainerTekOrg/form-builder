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

  return {
    builderStore,
    selectedEntityId,
    setSelectedEntityId,
    addEntity,
    deleteEntity,
    moveEntity,
  };
}
