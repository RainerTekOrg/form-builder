"use client";

import { useState, useCallback, useRef } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { Header } from "@/src/components/layout/Header";
import { Palette } from "@/src/components/canvas/Palette";
import { FormBuilder } from "@/src/components/canvas/FormBuilder";
import { PropertiesPanel } from "@/src/components/canvas/PropertiesPanel";
import { useBuilderSetup } from "@/src/components/canvas/useBuilderSetup";
import { generateKey, flattenKeys } from "@/src/serializer/key";
import { expandGroup } from "@/src/serializer/groups";
import type { GroupPayload } from "@/src/contract/types";

export default function Home() {
  const [mode, setMode] = useState<"build" | "preview">("build");
  const [stagedGroups, setStagedGroups] = useState<Array<{ id: string; label: string; payload: GroupPayload }>>([]);

  const {
    builderStore,
    selectedEntityId,
    setSelectedEntityId,
    addEntity,
    deleteEntity,
    moveEntity,
  } = useBuilderSetup();

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id.toString();
      const overId = over.id.toString();

      if (activeId.startsWith("palette-")) {
        const fieldType = activeId.replace("palette-", "");
        addEntity(fieldType);
        return;
      }

      if (activeId !== overId) {
        const schema = builderStore.getSchema();
        const root = [...schema.root];
        const oldIndex = root.indexOf(activeId);
        const newIndex = root.indexOf(overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          moveEntity(activeId, newIndex);
        }
      }
    },
    [addEntity, moveEntity, builderStore],
  );

  const handleFieldAdd = useCallback(
    (fieldTypeOrGroup: string) => {
      if (fieldTypeOrGroup.startsWith("group:")) {
        const groupId = fieldTypeOrGroup.replace("group:", "");
        const group = stagedGroups.find((g) => g.id === groupId);
        if (group) {
          const schema = builderStore.getSchema();
          const existingKeys = flattenKeys(schema);
          const entities = expandGroup(group.payload);
          for (const entity of entities) {
            const key = entity.attributes.key as string;
            const safeKey = existingKeys.has(key)
              ? generateKey(key, existingKeys)
              : key;
            existingKeys.add(safeKey);
            addEntity(entity.type, {
              ...entity.attributes,
              key: safeKey,
            });
          }
        }
        return;
      }
      addEntity(fieldTypeOrGroup);
    },
    [addEntity, stagedGroups, builderStore],
  );

  const handleExport = useCallback(() => {
    const schema = builderStore.getSchema();
    const json = JSON.stringify(schema, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-schema.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [builderStore]);

  const handleSave = useCallback(() => {
    console.log("Save triggered — will emit postMessage in a future phase.");
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header
        mode={mode}
        onModeChange={setMode}
        onExport={handleExport}
        onSave={handleSave}
      />

      {mode === "build" ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 shrink-0 hidden md:block">
            <Palette onFieldAdd={handleFieldAdd} stagedGroups={stagedGroups} />
          </div>
          <div className="flex-1 min-w-0">
            <FormBuilder
              builderStore={builderStore}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              onDeleteEntity={deleteEntity}
              onDragEnd={handleDragEnd}
            />
          </div>
          <div className="w-80 shrink-0 hidden lg:block">
            <PropertiesPanel
              builderStore={builderStore}
              selectedEntityId={selectedEntityId}
              onDeleteEntity={deleteEntity}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            Preview mode — will render fillable form in a future phase.
          </p>
        </div>
      )}
    </div>
  );
}
