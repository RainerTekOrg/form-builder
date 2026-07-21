"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BuilderStore, InterpreterStore, Schema } from "@coltorapps/builder";
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

/**
 * Required fields whose value is still empty. Shared by the live validity gate and the
 * submit guard so both agree. Returns entity id + label so the caller can flag each field.
 *
 * Required-ness is NOT enforced by an entity's own `validate` (e.g. a select validates as
 * `z.string().optional()`), so an empty required field would otherwise pass client-side and
 * only be rejected by the backend with a vague message. This is the single source of truth.
 */
function collectMissingRequired(
  interpreter: InterpreterStore<typeof formBuilder>,
  builderStore: BuilderStore<typeof formBuilder>,
  topLevelRequired: string[],
): Array<{ entityId: string; label: string }> {
  const allValues = interpreter.getEntitiesValues();
  const entities = (builderStore.getSchema() as Schema<typeof formBuilder> as unknown as {
    entities: Record<string, { type: string; attributes: Record<string, unknown> }>;
  }).entities;

  const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
  const labelOf = (e: { attributes: Record<string, unknown> }) =>
    (e.attributes.label as string) || (e.attributes.key as string) || "This field";

  const keyToId = new Map<string, string>();
  for (const [id, ent] of Object.entries(entities)) {
    const k = ent.attributes.key as string | undefined;
    if (k) keyToId.set(k, id);
  }

  const missing: Array<{ entityId: string; label: string }> = [];
  const seen = new Set<string>();
  // Top-level required (from the JSON schema `required` array).
  for (const propName of topLevelRequired) {
    const entityId = keyToId.get(propName);
    if (!entityId || seen.has(entityId)) continue;
    if (isEmpty(allValues[entityId])) { missing.push({ entityId, label: labelOf(entities[entityId]) }); seen.add(entityId); }
  }
  // Nested required (a field's own `required` attribute — sections / repeating children).
  for (const [entityId, entity] of Object.entries(entities)) {
    if (entity.type === "section" || entity.type === "repeating") continue;
    const req = entity.attributes.required;
    if ((req === true || req === "true") && !seen.has(entityId) && isEmpty(allValues[entityId])) {
      missing.push({ entityId, label: labelOf(entity) });
      seen.add(entityId);
    }
  }
  return missing;
}

export function FillPage({ embed = false }: { embed?: boolean }) {
  const builderStore = useBuilderStore(formBuilder);
  const bridgeRef = useRef<ReturnType<typeof createBridge> | null>(null);
  const interpreterRef = useRef<InterpreterStore<typeof formBuilder> | null>(null);
  // Embedded in the portal (?embed=1): the host owns the Submit button (its own
  // header), so we hide our FillHeader and submit on a REQUEST_SUBMIT message.
  // Taken as a prop (resolved from searchParams on the server) so SSR and the client
  // agree — deriving it from `window` here would cause a hydration mismatch.
  const isEmbed = embed;
  const handleSubmitRef = useRef<() => void>(() => {});

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
      undefined,
      // REQUEST_SUBMIT (host owns the Submit button): validate + emit FORM_FILLED.
      () => handleSubmitRef.current(),
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

      const hasErrors = Object.values(interpreter.getEntitiesErrors()).some((e) => Boolean(e));
      if (hasErrors) {
        setIsValid(false);
        return;
      }

      // One source of truth for "required but empty" — shared with the submit guard.
      setIsValid(collectMissingRequired(interpreter, builderStore, topLevelRequired).length === 0);
    };

    update();

    // Debounced VALUES_CHANGED so the host can draft-autosave without a save-per-keystroke.
    let valuesTimer: ReturnType<typeof setTimeout> | null = null;
    let dirtySinceEmit = false;

    // Emit the current values NOW and cancel any pending debounce. Called both by the
    // debounce timer and by the "about to leave" flush below, so a value entered <1s
    // before the user navigates away isn't lost with the un-fired timer.
    const emitNow = () => {
      if (valuesTimer) { clearTimeout(valuesTimer); valuesTimer = null; }
      if (!dirtySinceEmit) return;
      dirtySinceEmit = false;
      try {
        const { values } = extractValues(interpreter, builderStore);
        bridgeRef.current?.emitValuesChanged(values);
      } catch {
        // ignore — autosave is best-effort
      }
    };
    const emitValuesDebounced = () => {
      dirtySinceEmit = true;
      if (valuesTimer) clearTimeout(valuesTimer);
      valuesTimer = setTimeout(emitNow, 1000);
    };

    // Flush the pending draft the moment focus leaves the form or the page is being
    // hidden/unloaded — covers clicking the host's Back/Save button (focus leaves the
    // iframe → window blur), switching/closing the tab, and full navigation. Without this
    // the last edit could sit in the un-fired 1s debounce and never reach the host.
    const flushOnLeave = () => emitNow();
    const onVisibility = () => { if (document.visibilityState === "hidden") emitNow(); };

    const unsub = interpreter.subscribe(() => {
      update();
      emitValuesDebounced();
    });
    window.addEventListener("pagehide", flushOnLeave);
    window.addEventListener("blur", flushOnLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      unsub();
      window.removeEventListener("pagehide", flushOnLeave);
      window.removeEventListener("blur", flushOnLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      emitNow(); // final flush on teardown (e.g. the host reloaded/replaced the form)
    };
    // `interpreterAttached` is included so validity wires up even if the interpreter
    // attaches AFTER this effect first runs (otherwise the subscription is never set
    // and the Submit button stays disabled forever).
  }, [loadNonce, builderStore, interpreterAttached]);

  const handleSubmit = useCallback(async () => {
    const bridge = bridgeRef.current;
    const fillPayload = fillPayloadRef.current;
    const interpreter = interpreterRef.current;
    if (!bridge || !fillPayload || !interpreter) {
      toast.error("Form is not ready");
      return;
    }

    // Enforce REQUIRED before value-format validation: entity validators are `optional`,
    // so an empty required field passes validateEntitiesValues. Without this the host Save
    // would emit an incomplete record and the backend would bounce it with a vague error.
    // Name the missing fields and scroll to the first — but DON'T call setEntityError here:
    // a manually-set error marks the entity unprocessable, which then swallows the user's
    // next selection. The field's own onChange re-validates and shows its inline error.
    const missingRequired = collectMissingRequired(
      interpreter,
      builderStore,
      fillPayload.schema?.required ?? [],
    );
    if (missingRequired.length > 0) {
      if (typeof document !== "undefined") {
        document.getElementById(missingRequired[0].entityId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      const names = missingRequired.map((m) => m.label);
      toast.error(
        names.length === 1
          ? `${names[0]} is required.`
          : `Please fill required field${names.length > 1 ? "s" : ""}: ${names.slice(0, 4).join(", ")}${names.length > 4 ? "…" : ""}`,
      );
      return;
    }

    // Field-level format validation (min/max/pattern/email…). This is the library's own
    // validation, which clears itself when the value is corrected.
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

  // Keep the ref the bridge calls on REQUEST_SUBMIT pointed at the latest handler.
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Embed: report content height (debounced via rAF) so the host sizes the iframe and
  // the PAGE scrolls — not the iframe. Re-measures on load + as content grows/shrinks
  // (e.g. repeating rows added). Standalone (non-embed) keeps its own full-height scroll.
  useEffect(() => {
    if (!isEmbed || typeof document === "undefined") return;
    let raf = 0;
    const post = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        if (h > 0) bridgeRef.current?.emitContentHeight(h);
      });
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [isEmbed, loaded, loadNonce]);

  return (
    <div className={isEmbed ? "flex flex-col bg-background" : "flex h-dvh flex-col bg-background"}>
      {!isEmbed && (
        <FillHeader
          title={title}
          canSubmit={isValid && interpreterAttached}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
      <div className={isEmbed ? "w-full" : "flex flex-1 overflow-hidden w-full"}>
        {!loaded ? (
          <div className="flex items-center justify-center p-8">
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
            autoHeight={isEmbed}
            onInterpreterReady={handleInterpreterReady}
          />
        )}
      </div>
    </div>
  );
}
