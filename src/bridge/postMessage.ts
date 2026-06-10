import type {
  FillPayload,
  FilledPayload,
  FormPayload,
  GroupPayload,
  InboundMessage,
  OutboundMessage,
} from "@/src/contract/types";

const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);

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
type SetConfigHandler = (payload: { allowedFieldTypes?: string[]; theme?: "light" | "dark" }) => void;
type ForeignOriginHandler = (origin: string) => void;
type TriggerSaveHandler = () => void;

export interface Bridge {
  attach: () => () => void;
  emitSaved: (payload: FormPayload) => boolean;
  emitFilled: (payload: FilledPayload) => boolean;
  emitFillCancelled: () => boolean;
  emitError: (code: string, message: string) => boolean;
  emitReady: () => boolean;
  emitDirtyState: (isDirty: boolean) => boolean;
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

    const re = new RegExp(`^${pattern.replace(/\*/g, ".*").replace(/[.+?^${}()|[\]\\]/g, "\\$&")}$`);
    return re.test(origin);
  } catch {
    return false;
  }
}

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.length === 0) return true;
  return ALLOWED_ORIGINS.some((allowed) => matchOrigin(origin, allowed));
}

function resolveEmitTarget(): string {
  if (parentOrigin) return parentOrigin;
  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.some(hasWildcard)) {
    return ALLOWED_ORIGINS[0];
  }
  return "*";
}

export function createBridge(
  onLoadForm: LoadFormHandler,
  onLoadGroup: LoadGroupHandler,
  onLoadFill?: LoadFillHandler,
  onSetConfig?: SetConfigHandler,
  onForeignOrigin?: ForeignOriginHandler,
  onTriggerSave?: TriggerSaveHandler,
): Bridge {
  let parentOrigin: string | null = null;

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
    }
  }

  function emitSaved(payload: FormPayload): boolean {
    if (!parentOrigin) {
      console.warn("[bridge] No parent origin captured yet; cannot emitSaved. Did the host send a message first?");
      return false;
    }
    const message: OutboundMessage = { type: "FORM_SAVED", payload };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitFilled(payload: FilledPayload): boolean {
    if (!parentOrigin) {
      console.warn("[bridge] No parent origin captured yet; cannot emitFilled.");
      return false;
    }
    const message: OutboundMessage = { type: "FORM_FILLED", payload };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitFillCancelled(): boolean {
    if (!parentOrigin) {
      console.warn("[bridge] No parent origin captured yet; cannot emitFillCancelled.");
      return false;
    }
    const message: OutboundMessage = { type: "FILL_CANCELLED" };
    window.parent.postMessage(message, parentOrigin);
    return true;
  }

  function emitError(code: string, message: string): boolean {
    if (!parentOrigin) {
      console.warn(`[bridge] No parent origin captured yet; cannot emitError ${code}.`);
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
      console.warn("[bridge] emitReady falling back to '*' — no parent origin captured and no ALLOWED_ORIGINS configured");
    }
    window.parent.postMessage(message, targetOrigin);
    return true;
  }

  function emitDirtyState(isDirty: boolean): boolean {
    if (!parentOrigin) {
      console.warn("[bridge] No parent origin captured yet; cannot emitDirtyState.");
      return false;
    }
    const message: OutboundMessage = { type: "DIRTY_STATE", payload: { isDirty } };
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
    getParentOrigin: () => parentOrigin,
  };
}
