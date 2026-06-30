import type {
  FillPayload,
  FilledPayload,
  FormPayload,
  GroupPayload,
  InboundMessage,
  OutboundMessage,
} from "@/src/contract/types";

const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? "")
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

let emitReadyWarned = false;

if (ALLOWED_ORIGINS.length === 0 && process.env.NODE_ENV === "production") {
  console.warn(
    "[bridge] NEXT_PUBLIC_ALLOWED_ORIGINS is not set. In production, all incoming postMessage origins will be accepted. " +
    "Set this environment variable to a comma-separated list of trusted origins (e.g. https://lims.manne.work).",
  );
}

type LoadFormHandler = (payload: FormPayload) => void;
type LoadGroupHandler = (payload: GroupPayload) => void;
type LoadFillHandler = (payload: FillPayload) => void;
type SetConfigHandler = (payload: { allowedFieldTypes?: string[]; theme?: "light" | "dark"; mode?: "build" | "preview" }) => void;
type ForeignOriginHandler = (origin: string) => void;
type TriggerSaveHandler = () => void;
type RequestSubmitHandler = () => void;

export interface Bridge {
  attach: () => () => void;
  emitSaved: (payload: FormPayload) => boolean;
  emitFilled: (payload: FilledPayload) => boolean;
  emitFillCancelled: () => boolean;
  emitError: (code: string, message: string) => boolean;
  emitReady: () => boolean;
  emitDirtyState: (isDirty: boolean) => boolean;
  emitValuesChanged: (values: Record<string, unknown>) => boolean;
  emitContentHeight: (height: number) => boolean;
  getParentOrigin: () => string | null;
}

function hasWildcard(pattern: string): boolean {
  return pattern.includes("*");
}

function matchOrigin(origin: string, pattern: string): boolean {
  if (pattern === origin) return true;
  if (!hasWildcard(pattern)) return false;

  try {
    const originUrl = new URL(origin);

    if (pattern.startsWith("https://*.")) {
      const suffix = pattern.slice("https://*.".length);
      return originUrl.protocol === "https:" && originUrl.hostname.endsWith(`.${suffix}`);
    }

    if (pattern.startsWith("http://*.")) {
      const suffix = pattern.slice("http://*.".length);
      return originUrl.protocol === "http:" && originUrl.hostname.endsWith(`.${suffix}`);
    }

    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(2);
      return originUrl.hostname.endsWith(`.${suffix}`);
    }

    if (pattern === "*") return true;

    const re = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);
    return re.test(origin);
  } catch {
    return false;
  }
}

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.length === 0) return true;
  return ALLOWED_ORIGINS.some((allowed) => matchOrigin(origin, allowed));
}

export function createBridge(
  onLoadForm: LoadFormHandler,
  onLoadGroup: LoadGroupHandler,
  onLoadFill?: LoadFillHandler,
  onSetConfig?: SetConfigHandler,
  onForeignOrigin?: ForeignOriginHandler,
  onTriggerSave?: TriggerSaveHandler,
  onRequestSubmit?: RequestSubmitHandler,
): Bridge {
  let parentOrigin: string | null = null;

  function resolveEmitTarget(): string {
    if (parentOrigin) return parentOrigin;
    if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.some(hasWildcard)) {
      return ALLOWED_ORIGINS[0];
    }
    return "*";
  }

  function handleMessage(event: MessageEvent) {
    if (!isOriginAllowed(event.origin)) {
      onForeignOrigin?.(event.origin);
      return;
    }

    parentOrigin = event.origin;

    const data = event.data as InboundMessage;
    if (!data || !data.type) return;

    switch (data.type) {
      case "LOAD_FORM":
        onLoadForm(data.payload);
        break;
      case "LOAD_GROUP":
        onLoadGroup(data.payload);
        break;
      case "LOAD_FILL":
        onLoadFill?.(data.payload);
        break;
      case "SET_CONFIG":
        onSetConfig?.(data.payload);
        break;
      case "TRIGGER_SAVE":
        onTriggerSave?.();
        break;
      case "REQUEST_SUBMIT":
        onRequestSubmit?.();
        break;
    }
  }

  function emitSaved(payload: FormPayload): boolean {
    if (!parentOrigin) {
      console.warn("[bridge] No parent origin captured yet; cannot emitSaved (standalone mode)");
      return false;
    }
    const message: OutboundMessage = { type: "FORM_SAVED", payload };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitFilled(payload: FilledPayload): boolean {
    if (!parentOrigin) {
      console.warn("[bridge] No parent origin captured yet; cannot emitFilled (standalone mode)");
      return false;
    }
    const message: OutboundMessage = { type: "FORM_FILLED", payload };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitFillCancelled(): boolean {
    if (!parentOrigin) {
      return false;
    }
    const message: OutboundMessage = { type: "FILL_CANCELLED" };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitError(code: string, message: string): boolean {
    if (!parentOrigin) {
      console.warn(`[bridge] No parent origin captured yet; cannot emitError ${code} (standalone mode)`);
      return false;
    }
    const msg: OutboundMessage = { type: "ERROR", code, message };
    window.parent.postMessage(msg, parentOrigin);
    return true;
  }

  function emitReady(): boolean {
    const message: OutboundMessage = { type: "BUILDER_READY" };
    const targetOrigin = resolveEmitTarget();
    if (targetOrigin === "*" && !emitReadyWarned && process.env.NODE_ENV !== "production") {
      emitReadyWarned = true;
      if (ALLOWED_ORIGINS.length > 0) {
        console.info("[bridge] emitReady sent to '*' because ALLOWED_ORIGINS contains wildcard patterns (standalone dev mode)");
      } else {
        console.warn("[bridge] emitReady sent to '*' — NEXT_PUBLIC_ALLOWED_ORIGINS not set (postMessage targetOrigin does not support wildcards)");
      }
    }
    window.parent.postMessage(message, targetOrigin);
    return true;
  }

  function emitDirtyState(isDirty: boolean): boolean {
    if (!parentOrigin) {
      return false;
    }
    const message: OutboundMessage = { type: "DIRTY_STATE", payload: { isDirty } };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitValuesChanged(values: Record<string, unknown>): boolean {
    if (!parentOrigin) {
      return false;
    }
    const message: OutboundMessage = { type: "VALUES_CHANGED", payload: { values } };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitContentHeight(height: number): boolean {
    if (!parentOrigin) {
      return false;
    }
    const message: OutboundMessage = { type: "CONTENT_HEIGHT", payload: { height } };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function attach() {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }

  return {
    attach,
    emitSaved,
    emitFilled,
    emitFillCancelled,
    emitError,
    emitReady,
    emitDirtyState,
    emitValuesChanged,
    emitContentHeight,
    getParentOrigin: () => parentOrigin,
  };
}
