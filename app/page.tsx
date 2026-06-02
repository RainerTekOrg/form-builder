"use client";

import { useState, useCallback, useEffect } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { Header } from "@/src/components/layout/Header";
import { Palette } from "@/src/components/canvas/Palette";
import { FormBuilder } from "@/src/components/canvas/FormBuilder";
import { PropertiesPanel } from "@/src/components/canvas/PropertiesPanel";
import { Playground } from "@/src/components/preview/Playground";
import { useBuilderSetup } from "@/src/components/canvas/useBuilderSetup";
import { generateKey, flattenKeys } from "@/src/serializer/key";
import { expandGroup } from "@/src/serializer/groups";
import { serialize } from "@/src/serializer/serialize";
import { deserialize } from "@/src/serializer/deserialize";
import { downloadJson } from "@/src/bridge/export";
import { createBridge } from "@/src/bridge/postMessage";
import type { GroupPayload, FormPayload } from "@/src/contract/types";

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

  // Bridge lifecycle
  useEffect(() => {
    const bridge = createBridge(
      (payload: FormPayload) => {
        const native = deserialize(payload);
        builderStore.setData({
          schema: native,
          entitiesAttributesErrors: {},
          schemaError: undefined,
        });
      },
      (payload: GroupPayload) => {
        setStagedGroups((prev) => [
          ...prev.filter((g) => g.id !== payload.groupId),
          { id: payload.groupId, label: payload.groupId, payload },
        ]);
      },
    );

    const cleanup = bridge.attach();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedEntityId) {
          e.preventDefault();
          deleteEntity(selectedEntityId);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const schema = builderStore.getSchema();
        const payload = serialize(schema);
        bridge.emitSaved("*", payload);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        // coltorapps doesn't expose undo directly; could be added via event store
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (!selectedEntityId) return;
        e.preventDefault();
        const current = builderStore.getSchema().root;
        const idx = current.indexOf(selectedEntityId);
        if (idx === -1) return;
        const dir = e.key === "ArrowUp" ? -1 : 1;
        const newIdx = Math.max(0, Math.min(current.length - 1, idx + dir));
        if (newIdx !== idx) {
          moveEntity(selectedEntityId, newIdx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanup();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [builderStore, deleteEntity, moveEntity, selectedEntityId]);

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
        const root = [...builderStore.getSchema().root];
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
    const payload = serialize(schema);
    downloadJson(payload);
  }, [builderStore]);

  const handleSave = useCallback(() => {
    const schema = builderStore.getSchema();
    const payload = serialize(schema);
    const json = JSON.stringify(payload, null, 2);
    console.log("[save]", json);
    // In-iframe emission is handled via the bridge's emitSaved in keydown handler
  }, [builderStore]);

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
        <div className="flex flex-1 overflow-hidden">
          <Playground builderStore={builderStore} />
        </div>
      )}
    </div>
  );
}
