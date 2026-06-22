"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InterpreterStore, Schema } from "@coltorapps/builder";
import { useBuilderStore } from "@coltorapps/builder-react";
import { formBuilder } from "@/src/builder/form-builder";
import { deserialize } from "@/src/serializer/deserialize";
import { createBridge } from "@/src/bridge/postMessage";
import { applyDefaults } from "./apply-defaults";
import { extractValues } from "./extract-values";
import { FillHeader } from "./FillHeader";
import { Playground } from "@/src/components/preview/Playground";
import { toast } from "sonner";
import type {
  FillPayload,
  FilledPayload,
  FormPayload,
  GroupPayload,
} from "@/src/contract/types";

export function FillPage() {
  const builderStore = useBuilderStore(formBuilder);
  const bridgeRef = useRef<ReturnType<typeof createBridge> | null>(null);
  const interpreterRef = useRef<InterpreterStore<typeof formBuilder> | null>(null);

  const [title, setTitle] = useState("Form");
  const [loaded, setLoaded] = useState(false);
  const [interpreterAttached, setInterpreterAttached] = useState(false);
  const [isValid, setIsValid] = useState(false);
  // Bumped on each LOAD_FILL so Playground remounts with a fresh interpreter
  // (the host re-LOADs to re-bake dependent options, e.g. company→location).
  // Also re-binds the values/validity subscription below to the new interpreter.
  const [loadNonce, setLoadNonce] = useState(0);
  const fillPayloadRef = useRef<FillPayload | null>(null);

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
          setLoaded(true);
          toast.success("Form loaded");
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          bridge.emitError("INVALID_FORM", message);
          toast.error(`Form load failed: ${message}`);
        }
      },
      (payload: GroupPayload) => {
        void payload;
        toast.info("Groups are not used in fill mode");
      },
      (payload: FillPayload) => {
        try {
          const native = deserialize(payload);
          builderStore.setData({
            schema: native,
            entitiesAttributesErrors: {},
            schemaError: undefined,
          });
          if (payload.title) setTitle(payload.title);
          fillPayloadRef.current = payload;
          setLoaded(true);
          // Force a fresh interpreter so re-LOADs (dependent-option re-bakes)
          // pick up the new schema and re-apply preserved defaults.
          setLoadNonce((n) => n + 1);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          bridge.emitError("INVALID_FORM", message);
          toast.error(`Form load failed: ${message}`);
        }
      },
      undefined,
      (origin) => {
        toast.error(`Rejected message from untrusted origin: ${origin}`);
      },
    );
    bridgeRef.current = bridge;
    const cleanup = bridge.attach();
    bridge.emitReady();
    return cleanup;
  }, [builderStore]);

  const handleInterpreterReady = useCallback(
    (interpreter: InterpreterStore<typeof formBuilder>) => {
      interpreterRef.current = interpreter;
      const payload = fillPayloadRef.current;
      if (payload?.defaults) {
        applyDefaults(interpreter, builderStore, payload);
      }
      setInterpreterAttached(true);
    },
    [builderStore],
  );

  useEffect(() => {
    if (!loadNonce) return;
    const interpreter = interpreterRef.current;
    if (!interpreter) return;

    const update = () => {
      const fillPayload = fillPayloadRef.current;
      const topLevelRequired = fillPayload?.schema?.required ?? [];
      const allValues = interpreter.getEntitiesValues();
      const allErrors = interpreter.getEntitiesErrors();
      const entities = (builderStore.getSchema() as Schema<typeof formBuilder> as unknown as {
        entities: Record<string, { type: string; attributes: Record<string, unknown>; children?: string[] }>;
      }).entities;

      const hasErrors = Object.values(allErrors).some((e) => Boolean(e));
      if (hasErrors) {
        setIsValid(false);
        return;
      }

      // Build key -> entityId map once
      const keyToId = new Map<string, string>();
      for (const [id, ent] of Object.entries(entities)) {
        const k = ent.attributes.key as string | undefined;
        if (k) keyToId.set(k, id);
      }

      // Check top-level required fields
      const missingTopLevel = topLevelRequired.some((propName) => {
        const entityId = keyToId.get(propName);
        if (!entityId) return false;
        const value = allValues[entityId];
        return value === undefined || value === null || value === "";
      });
      if (missingTopLevel) {
        setIsValid(false);
        return;
      }

      // Check nested required fields (inside sections / repeating groups)
      let nestedMissing = false;
      for (const [entityId, entity] of Object.entries(entities)) {
        if (entity.type === "section" || entity.type === "repeating") continue;
        if (entity.attributes.required === true || entity.attributes.required === "true") {
          const value = allValues[entityId];
          if (value === undefined || value === null || value === "") {
            nestedMissing = true;
            break;
          }
        }
      }

      setIsValid(!nestedMissing);
    };

    update();
    const unsub = interpreter.subscribe(() => update());
    return () => {
      unsub();
    };
  }, [loadNonce, builderStore]);

  const handleSubmit = useCallback(async () => {
    const bridge = bridgeRef.current;
    const fillPayload = fillPayloadRef.current;
    const interpreter = interpreterRef.current;
    if (!bridge || !fillPayload || !interpreter) {
      toast.error("Form is not ready");
      return;
    }

    const result = await interpreter.validateEntitiesValues();
    if (!result.success) {
      toast.error("Please fix the errors above");
      return;
    }

    const { values } = extractValues(interpreter, builderStore);
    const filled: FilledPayload = {
      values,
      schema: fillPayload.schema,
      uiSchema: fillPayload.uiSchema,
    };
    const sent = bridge.emitFilled(filled);
    if (sent) {
      toast.success("Form submitted");
    } else {
      toast.error("No host connected to receive the submission");
    }
  }, [builderStore]);

  const handleCancel = useCallback(() => {
    bridgeRef.current?.emitFillCancelled();
    toast.info("Cancelled");
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <FillHeader
        title={title}
        canSubmit={isValid && interpreterAttached}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
      <div className="flex flex-1 overflow-hidden w-full">
        {!loaded ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <p className="text-sm text-muted-foreground">
                Waiting for the host to send a form…
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                The LIMS host should post a <code className="text-xs">LOAD_FILL</code> message.
              </p>
            </div>
          </div>
        ) : (
          <Playground
            key={loadNonce}
            builderStore={builderStore}
            hideHeader
            onInterpreterReady={handleInterpreterReady}
          />
        )}
      </div>
    </div>
  );
}
