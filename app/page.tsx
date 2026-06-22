"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { Header } from "@/src/components/layout/Header";
import { Palette } from "@/src/components/canvas/Palette";
import { FormBuilder } from "@/src/components/canvas/FormBuilder";
import { PropertiesPanel } from "@/src/components/canvas/PropertiesPanel";
import { Playground } from "@/src/components/preview/Playground";
import { useBuilderSetup } from "@/src/components/canvas/useBuilderSetup";
import { useBuilderHistory } from "@/src/builder/useBuilderHistory";
import { FillPage } from "@/src/components/fill/FillPage";
import { PdfImportButton } from "@/src/components/import/PdfImportButton";
import { FIELD_TYPE_TO_ENTITY, type ExtractedField } from "@/src/lib/pdf-extract/types";
import { toast } from "sonner";
import { generateKey, flattenKeys } from "@/src/serializer/key";
import { expandGroup } from "@/src/serializer/groups";
import { serialize } from "@/src/serializer/serialize";
import { deserialize } from "@/src/serializer/deserialize";
import { downloadJson } from "@/src/bridge/export";
import { createBridge } from "@/src/bridge/postMessage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { GroupPayload, FormPayload } from "@/src/contract/types";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; embed?: string }>;
}) {
  const params = use(searchParams);
  if (params?.mode === "fill") {
    return <FillPage />;
  }

  return <BuildPage hideHeader={params?.embed === "1"} />;
}

function BuildPage({ hideHeader = false }: { hideHeader?: boolean }) {
  const [mode, setMode] = useState<"build" | "preview">("build");
  const [stagedGroups, setStagedGroups] = useState<Array<{ id: string; label: string; payload: GroupPayload }>>([]);
  const [title, setTitle] = useState("Untitled form");
  const titleRef = useRef(title);
  useEffect(() => { titleRef.current = title; }, [title]);
  const [clearOpen, setClearOpen] = useState(false);
  const bridgeRef = useRef<ReturnType<typeof createBridge> | null>(null);
  const paletteRef = useRef<{ focusSearch: () => void } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [allowedFieldTypes, setAllowedFieldTypes] = useState<string[] | undefined>(undefined);
  const [_, forceRender] = useState(0);
  const saveFormRef = useRef(() => {});

  const {
    builderStore,
    selectedEntityId,
    setSelectedEntityId,
    addEntity,
    deleteEntity,
    moveEntity,
    cloneField,
    clearForm,
    detectCollision,
  } = useBuilderSetup();

  const { undo, redo, canUndo, canRedo } = useBuilderHistory();

  // Refs for values that change without needing bridge recreation
  const selectedEntityIdRef = useRef(selectedEntityId);
  selectedEntityIdRef.current = selectedEntityId;
  const deleteEntityRef = useRef<(id: string) => void>(deleteEntity);
  deleteEntityRef.current = deleteEntity;
  const undoRef = useRef(undo);
  undoRef.current = undo;
  const redoRef = useRef(redo);
  redoRef.current = redo;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Bridge lifecycle — runs once on mount, never recreated
  useEffect(() => {
    const bridge = createBridge(
      (payload: FormPayload) => {
        try {
          const native = deserialize(payload);
          builderStore.setData({
            schema: native,
            entitiesAttributesErrors: {},
            schemaError: undefined,
          });
          if (payload.title) setTitle(payload.title);
          setIsDirty(false);
          forceRender((n) => n + 1);
          toast.success("Form loaded");
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          bridge.emitError("INVALID_FORM", message);
          toast.error(`Form load failed: ${message}`);
        }
      },
      (payload: GroupPayload) => {
        setStagedGroups((prev) => [
          ...prev.filter((g) => g.id !== payload.groupId),
          { id: payload.groupId, label: payload.groupId, payload },
        ]);
        toast.success(`Group "${payload.groupId}" added to palette`);
      },
      undefined,
      (payload) => {
        if (payload.theme) {
          document.documentElement.classList.toggle("dark", payload.theme === "dark");
        }
        if (payload.allowedFieldTypes) {
          setAllowedFieldTypes(payload.allowedFieldTypes);
        }
        if (payload.mode === "preview" || payload.mode === "build") {
          setMode(payload.mode);
        }
      },
      (origin) => {
        toast.error(`Rejected message from untrusted origin: ${origin}`);
      },
      () => saveFormRef.current(),
    );
    bridgeRef.current = bridge;

    const cleanup = bridge.attach();

    bridge.emitReady();

    // Track dirty state: subscribe to schema changes
    const unsub = builderStore.subscribe((_data, events) => {
      const isSchemaChange = events.some(
        (e) =>
          e.name === "EntityAdded" ||
          e.name === "EntityUpdated" ||
          e.name === "EntityDeleted" ||
          e.name === "EntityCloned" ||
          e.name === "EntityAttributeUpdated" ||
          e.name === "RootUpdated" ||
          e.name === "SchemaUpdated",
      );
      const isLoad = events.some((e) => e.name === "DataSet");
      if (isSchemaChange) {
        setIsDirty(true);
        bridgeRef.current?.emitDirtyState(true);
      }
      if (isLoad) {
        setIsDirty(false);
        bridgeRef.current?.emitDirtyState(false);
      }
    });

    const saveForm = () => {
      const schema = builderStore.getSchema();
      const payload = serialize(schema);
      const sent = bridge.emitSaved(payload);
      if (sent) {
        setIsDirty(false);
        toast.success("Form saved");
      } else {
        toast.error("Form saved locally, but no host is connected to receive it. Use Export to download JSON.");
      }
    };
    saveFormRef.current = saveForm;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      const id = selectedEntityIdRef.current;
      const del = deleteEntityRef.current;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (id) {
          e.preventDefault();
          del(id);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveFormRef.current();
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redoRef.current();
        } else {
          undoRef.current();
        }
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (!id) return;
        e.preventDefault();
        const current = builderStore.getSchema().root;
        const idx = current.indexOf(id);
        if (idx === -1) return;
        const dir = e.key === "ArrowUp" ? -1 : 1;
        const newIdx = Math.max(0, Math.min(current.length - 1, idx + dir));
        if (newIdx !== idx) {
          builderStore.setEntityIndex(id, newIdx);
        }
      }

      if (e.key === "/" && modeRef.current === "build") {
        e.preventDefault();
        paletteRef.current?.focusSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanup();
      unsub();
      window.removeEventListener("keydown", handleKeyDown);
      bridgeRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFieldToParent = useCallback(
    (parentId: string | null, entityName: string, label: string) => {
      const entity = addEntity(entityName, { label });
      if (parentId && entity) {
        builderStore.setEntityParent(entity.id, parentId);
      }
      const collision = detectCollision(label);
      if (collision) {
        toast.info(`Key renamed to avoid collision with "${collision.originalKey}"`);
      }
    },
    [addEntity, detectCollision, builderStore],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id.toString();
      const overId = over.id.toString();

      if (activeId.startsWith("palette-")) {
        const data = active.data.current as { entity?: string; label?: string } | undefined;
        const entityName = data?.entity ?? "";
        const label = data?.label ?? entityName;
        if (!entityName) return;

        if (overId.startsWith("container-")) {
          const containerId = overId.replace("container-", "");
          addFieldToParent(containerId, entityName, label);
          return;
        }
        addEntity(entityName, { label });
        const collision = detectCollision(label);
        if (collision) {
          toast.info(`Key renamed to avoid collision with "${collision.originalKey}"`);
        }
        return;
      }

      if (overId.startsWith("container-")) {
        const containerId = overId.replace("container-", "");
        if (activeId !== containerId) {
          builderStore.setEntityParent(activeId, containerId);
        }
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
    [addEntity, addFieldToParent, detectCollision, moveEntity, builderStore],
  );

  const handleFieldAdd = useCallback(
    (entityOrGroup: string, label?: string) => {
      if (entityOrGroup.startsWith("group:")) {
        const groupId = entityOrGroup.replace("group:", "");
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
          toast.success(`Group "${groupId}" expanded (${entities.length} fields)`);
        }
        return;
      }
      addEntity(entityOrGroup, { label });
      const collision = detectCollision(label ?? entityOrGroup);
      if (collision) {
        toast.info(`Key renamed to avoid collision with "${collision.originalKey}"`);
      }
    },
    [addEntity, detectCollision, stagedGroups, builderStore],
  );

  // Insert AI-extracted PDF fields into the builder. Keys are de-duped against the
  // live schema; section/repeating containers are created first, then their
  // `children` are created and re-parented under them (structural nesting).
  const handlePdfImport = useCallback(
    (fields: ExtractedField[]): number => {
      const existingKeys = flattenKeys(builderStore.getSchema());
      let count = 0;

      const add = (f: ExtractedField, parentId: string | null) => {
        const entityName = FIELD_TYPE_TO_ENTITY[f.type] ?? "textField";
        const base = f.key && f.key.length ? f.key : f.label;
        const key = existingKeys.has(base) ? generateKey(base, existingKeys) : base;
        existingKeys.add(key);

        const attrs: Record<string, unknown> = { label: f.label, key };
        if (f.required) attrs.required = true;
        if (f.placeholder) attrs.placeholder = f.placeholder;
        if (f.helpText) attrs.helpText = f.helpText;
        if (f.options?.length) attrs.options = f.options;

        const entity = addEntity(entityName, attrs);
        if (!entity) return;
        count += 1;

        if (parentId) builderStore.setEntityParent(entity.id, parentId);

        if (f.children?.length && (f.type === "section" || f.type === "repeating")) {
          for (const child of f.children) add(child, entity.id);
        }
      };

      for (const f of fields) add(f, null);
      return count;
    },
    [addEntity, builderStore],
  );

  const handleExport = useCallback(() => {
    const schema = builderStore.getSchema();
    const payload = serialize(schema);
    const full = { title, ...payload };
    downloadJson(full);
  }, [builderStore, title]);

  const handleClear = useCallback(() => {
    if (builderStore.getSchema().root.length === 0) {
      toast.info("Form is already empty");
      return;
    }
    setClearOpen(true);
  }, [builderStore]);

  const handleClearConfirm = useCallback(() => {
    clearForm();
    setStagedGroups([]);
    setIsDirty(false);
    setClearOpen(false);
    toast.success("Form cleared");
  }, [clearForm]);

  return (
    <div className="flex h-dvh flex-col bg-background">
      {!hideHeader && (
        <Header
          mode={mode}
          onModeChange={setMode}
          onExport={handleExport}
          onSave={() => saveFormRef.current()}
          onClear={handleClear}
          isDirty={isDirty}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          title={title}
          onTitleChange={setTitle}
        />
      )}

      {mode === "build" ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 shrink-0 hidden md:block">
            <Palette ref={paletteRef} onFieldAdd={handleFieldAdd} stagedGroups={stagedGroups} allowedFieldTypes={allowedFieldTypes} />
          </div>
          <div className="flex-1 min-w-0">
            <FormBuilder
              builderStore={builderStore}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              onDeleteEntity={deleteEntity}
              onDragEnd={handleDragEnd}
              onAddField={addFieldToParent}
              allowedFieldTypes={allowedFieldTypes}
            />
          </div>
          <div className="w-80 shrink-0 hidden lg:block">
            <PropertiesPanel
              builderStore={builderStore}
              selectedEntityId={selectedEntityId}
              onDeleteEntity={deleteEntity}
              onCloneEntity={cloneField}
              onMoveEntity={(id, dir) => {
                const root = builderStore.getSchema().root;
                const idx = root.indexOf(id);
                if (idx === -1) return;
                const newIdx = Math.max(0, Math.min(root.length - 1, idx + dir));
                if (newIdx !== idx) moveEntity(id, newIdx);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Playground builderStore={builderStore} />
        </div>
      )}

      {mode === "build" && <PdfImportButton onImport={handlePdfImport} />}

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear form
            </DialogTitle>
            <DialogDescription>
              This will remove all fields and staged groups. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearConfirm}>
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
