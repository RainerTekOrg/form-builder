// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { formBuilder } from "@/src/builder/form-builder";
import { createBuilderStore } from "@coltorapps/builder";
import { applyDefaults, buildKeyToEntityMap } from "@/src/components/fill/apply-defaults";
import { extractValues } from "@/src/components/fill/extract-values";
import { createBridge } from "@/src/bridge/postMessage";
import { simpleForm } from "./fixtures/simple-form";
import { usp797Form } from "./fixtures/usp-797-em";
import type { FillPayload, FilledPayload } from "@/src/contract/types";

afterEach(() => {
  cleanup();
});

function makeStore() {
  return createBuilderStore(formBuilder, {
    initialData: { schema: { root: [], entities: {} }, entitiesAttributesErrors: {}, schemaError: undefined },
  });
}

function addTextField(store: ReturnType<typeof makeStore>, label: string, key?: string) {
  return store.addEntity({
    type: "textField",
    attributes: { label, key: key ?? label.toLowerCase().replace(/\s+/g, "_"), required: false } as never,
  } as never);
}

function addNumberField(store: ReturnType<typeof makeStore>, label: string, key?: string) {
  return store.addEntity({
    type: "numberField",
    attributes: { label, key: key ?? label.toLowerCase().replace(/\s+/g, "_"), required: false } as never,
  } as never);
}

describe("applyDefaults", () => {
  it("resolves by x-coltorapps-key when present", () => {
    const store = makeStore();
    const a = addTextField(store, "Company Name", "customer.company_name");
    const uiSchema = {
      "customer.company_name": {
        "ui:label": "Company Name",
        "ui:widget": "text",
        "ui:order": 1,
        "x-coltorapps-key": "customer.company_name",
      },
    };

    const interpreter = { setEntityValue: vi.fn() };
    const payload: FillPayload = {
      schema: { type: "object" },
      uiSchema,
      defaults: { "customer.company_name": "Acme Corp" },
    };

    const applied = applyDefaults(interpreter as never, store, payload);
    expect(applied).toBe(1);
    expect(interpreter.setEntityValue).toHaveBeenCalledWith(a.id, "Acme Corp");
  });

  it("falls back to property name when x-coltorapps-key is missing", () => {
    const store = makeStore();
    const a = addTextField(store, "Company Name", "company_name");
    const uiSchema = {
      company_name: {
        "ui:label": "Company Name",
        "ui:widget": "text",
        "ui:order": 1,
        // no x-coltorapps-key
      },
    };

    const interpreter = { setEntityValue: vi.fn() };
    const payload: FillPayload = {
      schema: { type: "object" },
      uiSchema,
      defaults: { company_name: "Acme Corp" },
    };

    const applied = applyDefaults(interpreter as never, store, payload);
    expect(applied).toBe(1);
    expect(interpreter.setEntityValue).toHaveBeenCalledWith(a.id, "Acme Corp");
  });

  it("ignores unknown keys and returns 0", () => {
    const store = makeStore();
    addTextField(store, "Field A", "field_a");
    const interpreter = { setEntityValue: vi.fn() };
    const payload: FillPayload = {
      schema: { type: "object" },
      uiSchema: {
        field_a: { "ui:label": "Field A", "ui:widget": "text", "ui:order": 1 },
      },
      defaults: { nonsense: "ignored", also_nonsense: 42 },
    };

    const applied = applyDefaults(interpreter as never, store, payload);
    expect(applied).toBe(0);
    expect(interpreter.setEntityValue).not.toHaveBeenCalled();
  });

  it("returns 0 when defaults is undefined", () => {
    const store = makeStore();
    addTextField(store, "Field A", "field_a");
    const interpreter = { setEntityValue: vi.fn() };
    const payload: FillPayload = {
      schema: { type: "object" },
      uiSchema: {
        field_a: { "ui:label": "Field A", "ui:widget": "text", "ui:order": 1 },
      },
    };

    const applied = applyDefaults(interpreter as never, store, payload);
    expect(applied).toBe(0);
  });

  it("applies multiple defaults across many entities", () => {
    const store = makeStore();
    addTextField(store, "Field A", "field_a");
    addNumberField(store, "Field B", "field_b");
    addTextField(store, "Field C", "field_c");

    const uiSchema = {
      field_a: { "ui:label": "A", "ui:widget": "text", "ui:order": 1 },
      field_b: { "ui:label": "B", "ui:widget": "number", "ui:order": 2 },
      field_c: { "ui:label": "C", "ui:widget": "text", "ui:order": 3 },
    };

    const interpreter = { setEntityValue: vi.fn() };
    const payload: FillPayload = {
      schema: { type: "object" },
      uiSchema,
      defaults: { field_a: "hello", field_b: 42, field_c: "world" },
    };

    const applied = applyDefaults(interpreter as never, store, payload);
    expect(applied).toBe(3);
    expect(interpreter.setEntityValue).toHaveBeenCalledTimes(3);
  });
});

describe("buildKeyToEntityMap", () => {
  it("builds a map preferring x-coltorapps-key then property name", () => {
    const store = makeStore();
    const a = addTextField(store, "Field A", "field_a");
    const b = addTextField(store, "Field B", "field_b");
    const uiSchema = {
      field_a: {
        "ui:label": "A",
        "x-coltorapps-key": "canonical_a",
      },
      field_b: {
        "ui:label": "B",
        // no canonical key — falls back to property name
      },
    };

    const schema = store.getSchema();
    const map = buildKeyToEntityMap(schema, uiSchema);

    expect(map.get("canonical_a")).toBe(a.id);
    expect(map.get("field_b")).toBe(b.id);
    expect(map.has("field_a")).toBe(false); // overridden by canonical
  });
});

describe("extractValues", () => {
  it("keys values by property name (entity.attributes.key)", () => {
    const store = makeStore();
    const a = addTextField(store, "Full Name", "full_name");
    const b = addNumberField(store, "Age", "age");

    // Fake interpreter: getEntitiesValues returns { entityId: value }
    const fakeInterpreter = {
      getEntitiesValues: () => ({
        [a.id]: "Alice",
        [b.id]: 30,
      }),
    } as never;

    const { values } = extractValues(fakeInterpreter, store);
    expect(values).toEqual({ full_name: "Alice", age: 30 });
  });

  it("omits undefined and null values", () => {
    const store = makeStore();
    const a = addTextField(store, "A", "a");
    const b = addTextField(store, "B", "b");
    const c = addTextField(store, "C", "c");

    const fakeInterpreter = {
      getEntitiesValues: () => ({
        [a.id]: "set",
        [b.id]: undefined,
        [c.id]: null,
      }),
    } as never;

    const { values } = extractValues(fakeInterpreter, store);
    expect(values).toEqual({ a: "set" });
  });

  it("excludes container entities (section, repeating)", () => {
    const store = makeStore();
    const text = addTextField(store, "Inside", "inside");
    const section = store.addEntity({
      type: "section" as never,
      attributes: { label: "Container", key: "container" } as never,
    } as never);

    const fakeInterpreter = {
      getEntitiesValues: () => ({
        [text.id]: "value-inside",
        [section.id]: "should-be-ignored",
      }),
    } as never;

    const { values } = extractValues(fakeInterpreter, store);
    expect(values).toEqual({ inside: "value-inside" });
  });
});

describe("bridge — LOAD_FILL message", () => {
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

  function getHandler() {
    return addEventListenerSpy.mock.calls[0]?.[1];
  }

  it("dispatches LOAD_FILL to onLoadFill handler", () => {
    const loadForm = vi.fn();
    const loadGroup = vi.fn();
    const loadFill = vi.fn();
    const bridge = createBridge(loadForm, loadGroup, loadFill);
    bridge.attach();

    const handler = getHandler();
    const fillPayload: FillPayload = {
      title: "Sampling Record",
      schema: { type: "object" },
      uiSchema: {},
      defaults: {},
    };
    handler({
      data: { type: "LOAD_FILL", payload: fillPayload },
      origin: "http://localhost:5173",
    });

    expect(loadFill).toHaveBeenCalledWith(fillPayload);
    expect(loadForm).not.toHaveBeenCalled();
    expect(loadGroup).not.toHaveBeenCalled();
  });

  it("captures parent origin from LOAD_FILL", () => {
    const bridge = createBridge(vi.fn(), vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({
      data: { type: "LOAD_FILL", payload: { schema: { type: "object" }, uiSchema: {} } },
      origin: "https://lims.example",
    });
    expect(bridge.getParentOrigin()).toBe("https://lims.example");
  });

  it("emitFilled posts FORM_FILLED to captured origin", () => {
    const bridge = createBridge(vi.fn(), vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({
      data: { type: "LOAD_FILL", payload: { schema: { type: "object" }, uiSchema: {} } },
      origin: "https://lims.example",
    });

    const filled: FilledPayload = {
      values: { full_name: "Alice" },
      schema: { type: "object" },
      uiSchema: { full_name: { "ui:label": "Full Name" } },
    };
    const result = bridge.emitFilled(filled);
    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "FORM_FILLED", payload: filled },
      "https://lims.example",
    );
  });

  it("emitFillCancelled posts FILL_CANCELLED to captured origin", () => {
    const bridge = createBridge(vi.fn(), vi.fn(), vi.fn());
    bridge.attach();
    const handler = getHandler();
    handler({
      data: { type: "LOAD_FILL", payload: { schema: { type: "object" }, uiSchema: {} } },
      origin: "https://lims.example",
    });

    const result = bridge.emitFillCancelled();
    expect(result).toBe(true);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: "FILL_CANCELLED" },
      "https://lims.example",
    );
  });

  it("emitFilled returns false and warns when no parent origin captured", () => {
    const bridge = createBridge(vi.fn(), vi.fn(), vi.fn());
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = bridge.emitFilled({
      values: {},
      schema: { type: "object" },
      uiSchema: {},
    });
    expect(result).toBe(false);
    expect(postMessageSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("dispatches LOAD_FILL to a real simpleForm payload", () => {
    const loadFill = vi.fn();
    const bridge = createBridge(vi.fn(), vi.fn(), loadFill);
    bridge.attach();
    const handler = getHandler();
    handler({
      data: { type: "LOAD_FILL", payload: { ...simpleForm, defaults: { full_name: "Bob" } } },
      origin: "https://lims.example",
    });
    expect(loadFill).toHaveBeenCalledTimes(1);
    expect(loadFill.mock.calls[0][0].defaults).toEqual({ full_name: "Bob" });
  });

  it("dispatches LOAD_FILL to a real usp797Form payload", () => {
    const loadFill = vi.fn();
    const bridge = createBridge(vi.fn(), vi.fn(), loadFill);
    bridge.attach();
    const handler = getHandler();
    handler({
      data: { type: "LOAD_FILL", payload: { ...usp797Form } },
      origin: "https://lims.example",
    });
    expect(loadFill).toHaveBeenCalledTimes(1);
  });
});
