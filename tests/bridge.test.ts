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

  beforeEach(() => {
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
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    const cleanup = bridge.attach();
    expect(window.addEventListener).toHaveBeenCalledWith("message", expect.any(Function));
    cleanup();
    expect(window.removeEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });
});
