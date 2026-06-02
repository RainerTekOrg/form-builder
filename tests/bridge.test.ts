import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createBridge } from "@/src/bridge/postMessage";
import type { FormPayload, GroupPayload } from "@/src/contract/types";

describe("createBridge", () => {
  const sampleForm: FormPayload = {
    schema: { type: "object", properties: { name: { type: "string" } } },
    uiSchema: { name: { "ui:label": "Name", "x-coltorapps-key": "name" } },
  };

  const sampleGroup: GroupPayload = {
    ...sampleForm,
    groupId: "grp_1",
    version: 1,
  };

  let handlers: { loadForm: ReturnType<typeof vi.fn>; loadGroup: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    handlers = {
      loadForm: vi.fn(),
      loadGroup: vi.fn(),
    };
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      parent: { postMessage: vi.fn() },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("attaches a message listener", () => {
    const bridge = createBridge(handlers.loadForm, handlers.loadGroup);
    const cleanup = bridge.attach();
    expect(window.addEventListener).toHaveBeenCalledWith("message", expect.any(Function));
    cleanup();
    expect(window.removeEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });
});
