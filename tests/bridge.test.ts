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

  let addEventListenerSpy: ReturnType<typeof vi.fn>;
  let removeEventListenerSpy: ReturnType<typeof vi.fn>;
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();
    postMessageSpy = vi.fn();
    vi.stubGlobal("window", {
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      parent: { postMessage: postMessageSpy },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("attaches and detaches message listener", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    const cleanup = bridge.attach();
    expect(addEventListenerSpy).toHaveBeenCalledWith("message", expect.any(Function));
    cleanup();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("message", expect.any(Function));
  });

  function getHandler() {
    return addEventListenerSpy.mock.calls[0]?.[1];
  }

  it("calls onLoadForm when LOAD_FORM is received and captures parent origin", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    bridge.attach();

    const handler = getHandler();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "http://localhost:5173" });

    expect(loadForm).toHaveBeenCalledWith(sampleForm);
    expect(bridge.getParentOrigin()).toBe("http://localhost:5173");
  });

  it("calls onLoadGroup when LOAD_GROUP is received", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    bridge.attach();

    const handler = getHandler();
    handler({ data: { type: "LOAD_GROUP", payload: sampleGroup }, origin: "http://localhost:5173" });

    expect(loadGroup).toHaveBeenCalledWith(sampleGroup);
    expect(bridge.getParentOrigin()).toBe("http://localhost:5173");
  });

  it("ignores messages with unknown type", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    bridge.attach();

    const handler = getHandler();
    handler({ data: { type: "UNKNOWN" }, origin: "http://localhost:5173" });

    expect(loadForm).not.toHaveBeenCalled();
    expect(loadGroup).not.toHaveBeenCalled();
  });

  it("ignores messages with no data", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    bridge.attach();

    const handler = getHandler();
    handler({ data: null, origin: "http://localhost:5173" });

    expect(loadForm).not.toHaveBeenCalled();
  });

  it("calls onLoadFill when LOAD_FILL is received", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const loadFill = vi.fn();
    const bridge = createBridge(loadForm, loadGroup, loadFill);
    bridge.attach();

    const handler = getHandler();
    const fillPayload = { ...sampleForm };
    handler({ data: { type: "LOAD_FILL", payload: fillPayload }, origin: "http://localhost:5173" });

    expect(loadFill).toHaveBeenCalledWith(fillPayload);
  });

  it("ignores LOAD_FILL if onLoadFill is not provided", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    expect(() => {
      handler({ data: { type: "LOAD_FILL", payload: sampleForm }, origin: "http://localhost:5173" });
    }).not.toThrow();
  });

  it("emitSaved posts FORM_SAVED to captured parent origin", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "http://localhost:5173" });

    const result = bridge.emitSaved(sampleForm);

    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "FORM_SAVED", payload: sampleForm },
      "http://localhost:5173",
    );
  });

  it("emitError posts ERROR to captured parent origin", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "http://localhost:5173" });

    const result = bridge.emitError("BAD_ORIGIN", "test error");

    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "ERROR", code: "BAD_ORIGIN", message: "test error" },
      "http://localhost:5173",
    );
  });

  it("emitSaved returns false and warns when no parent origin captured", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = bridge.emitSaved(sampleForm);

    expect(result).toBe(false);
    expect(postMessageSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("emitError returns false and warns when no parent origin captured", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = bridge.emitError("CODE", "msg");

    expect(result).toBe(false);
    expect(postMessageSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("getParentOrigin returns null before any inbound message", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    expect(bridge.getParentOrigin()).toBeNull();
  });

  it("emitReady posts BUILDER_READY to parent", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "http://localhost:5173" });

    const result = bridge.emitReady();

    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "BUILDER_READY" },
      "http://localhost:5173",
    );
  });

  it("emitReady sends to * if no parent origin captured", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();

    const result = bridge.emitReady();

    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "BUILDER_READY" },
      "*",
    );
  });

  it("emitDirtyState posts DIRTY_STATE to captured parent origin", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "http://localhost:5173" });

    const result = bridge.emitDirtyState(true);

    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "DIRTY_STATE", payload: { isDirty: true } },
      "http://localhost:5173",
    );
  });

  it("calls onSetConfig when SET_CONFIG is received", () => {
    const onSetConfig = vi.fn();
    const bridge = createBridge(vi.fn(), vi.fn(), undefined, onSetConfig);
    bridge.attach();
    const handler = getHandler();
    handler({ data: { type: "SET_CONFIG", payload: { theme: "dark" } }, origin: "http://localhost:5173" });

    expect(onSetConfig).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("ignores SET_CONFIG if onSetConfig is not provided", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    expect(() => {
      handler({ data: { type: "SET_CONFIG", payload: { theme: "dark" } }, origin: "http://localhost:5173" });
    }).not.toThrow();
  });

  it("forwards foreign origins to onForeignOrigin callback", async () => {
    const onForeignOrigin = vi.fn();
    const originalEnv = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
    process.env.NEXT_PUBLIC_ALLOWED_ORIGINS = "https://lims.manne.work";
    vi.resetModules();
    const { createBridge: createBridgeFresh } = await import("@/src/bridge/postMessage");
    const bridge = createBridgeFresh(vi.fn(), vi.fn(), undefined, undefined, onForeignOrigin);
    bridge.attach();
    const handler = getHandler();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "https://evil.example" });

    expect(onForeignOrigin).toHaveBeenCalledWith("https://evil.example");
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
    } else {
      process.env.NEXT_PUBLIC_ALLOWED_ORIGINS = originalEnv;
    }
  });
});
