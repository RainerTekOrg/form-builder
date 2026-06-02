import type { FormPayload, GroupPayload, InboundMessage, OutboundMessage } from "@/src/contract/types";

const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);

type LoadFormHandler = (payload: FormPayload) => void;
type LoadGroupHandler = (payload: GroupPayload) => void;

export function createBridge(
  onLoadForm: LoadFormHandler,
  onLoadGroup: LoadGroupHandler,
) {
  function handleMessage(event: MessageEvent) {
    if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(event.origin)) {
      return;
    }

    const data = event.data as InboundMessage;
    if (!data || !data.type) return;

    switch (data.type) {
      case "LOAD_FORM":
        onLoadForm(data.payload);
        break;
      case "LOAD_GROUP":
        onLoadGroup(data.payload);
        break;
    }
  }

  function emitSaved(targetOrigin: string, payload: FormPayload) {
    if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(targetOrigin)) {
      console.warn(`[bridge] Blocked FORM_SAVED to untrusted origin: ${targetOrigin}`);
      return;
    }
    const message: OutboundMessage = { type: "FORM_SAVED", payload };
    window.parent.postMessage(message, targetOrigin);
  }

  function emitError(targetOrigin: string, code: string, message: string) {
    const msg: OutboundMessage = { type: "ERROR", code, message };
    window.parent.postMessage(msg, targetOrigin);
  }

  function attach() {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }

  return { attach, emitSaved, emitError };
}
