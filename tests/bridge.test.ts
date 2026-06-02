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

  it("calls onLoadForm when LOAD_FORM is received", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    bridge.attach();

    const handler = getHandler();
    expect(handler).toBeDefined();
    handler({ data: { type: "LOAD_FORM", payload: sampleForm }, origin: "http://localhost:5173" });

    expect(loadForm).toHaveBeenCalledWith(sampleForm);
  });

  it("calls onLoadGroup when LOAD_GROUP is received", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const bridge = createBridge(loadForm, loadGroup);
    bridge.attach();

    const handler = getHandler();
    handler({ data: { type: "LOAD_GROUP", payload: sampleGroup }, origin: "http://localhost:5173" });

    expect(loadGroup).toHaveBeenCalledWith(sampleGroup);
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

  it("emitSaved posts FORMAT_SAVED message to parent", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.emitSaved("http://localhost:5173", sampleForm);

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "FORM_SAVED", payload: sampleForm },
      "http://localhost:5173",
    );
  });

  it("emitError posts ERROR message to parent", () => {
    const bridge = createBridge(vi.fn(), vi.fn());
    bridge.emitError("http://localhost:5173", "BAD_ORIGIN", "test error");

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "ERROR", code: "BAD_ORIGIN", message: "test error" },
      "http://localhost:5173",
    );
  });
});
