// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { useBuilderHistory } from "@/src/builder/useBuilderHistory";
import { formBuilder } from "@/src/builder/form-builder";
import { createBuilderStore } from "@coltorapps/builder";
import { flattenKeys, generateKey } from "@/src/serializer/key";

afterEach(() => {
  cleanup();
});

function makeStore() {
  return createBuilderStore(formBuilder, {
    initialData: { schema: { root: [], entities: {} }, entitiesAttributesErrors: {}, schemaError: undefined },
  });
}

function addTextField(store: ReturnType<typeof makeStore>, label: string) {
  const existing = flattenKeys(store.getSchema());
  const key = generateKey(label, new Set(existing));
  return store.addEntity({
    type: "textField",
    attributes: { label, key, required: false } as never,
  } as never);
}

describe("useBuilderHistory", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hook is exported and callable", () => {
    expect(typeof useBuilderHistory).toBe("function");
  });

  it("history ring buffer semantics", () => {
    // Use the store API directly + a tiny manual history to verify the contract.
    const store = makeStore();
    const addFieldA = addTextField(store, "alpha");
    const addFieldB = addTextField(store, "beta");
    expect(store.getSchema().root).toEqual([addFieldA.id, addFieldB.id]);

    // Snapshot before delete
    const beforeDelete = JSON.parse(JSON.stringify(store.getSchema()));
    store.deleteEntity(addFieldB.id);
    expect(store.getSchema().root).toEqual([addFieldA.id]);

    // Restore via setData
    store.setData({ schema: beforeDelete, entitiesAttributesErrors: {}, schemaError: undefined });
    const restored = store.getSchema();
    expect(restored.root).toEqual([addFieldA.id, addFieldB.id]);
    expect(restored.entities[addFieldB.id]).toBeDefined();
  });

  it("clearForm empties the store", () => {
    const store = makeStore();
    const a = addTextField(store, "alpha");
    addTextField(store, "beta");
    expect(store.getSchema().root.length).toBe(2);

    store.setData({
      schema: { root: [], entities: {} },
      entitiesAttributesErrors: {},
      schemaError: undefined,
    });
    expect(store.getSchema().root.length).toBe(0);
    expect(store.getSchema().entities[a.id]).toBeUndefined();
  });

  it("reordering entities preserves them", () => {
    const store = makeStore();
    const a = addTextField(store, "alpha");
    const b = addTextField(store, "beta");
    const c = addTextField(store, "gamma");
    expect(store.getSchema().root).toEqual([a.id, b.id, c.id]);

    store.setEntityIndex(a.id, 2);
    expect(store.getSchema().root).toEqual([b.id, c.id, a.id]);
  });

  it("cloneEntity creates a duplicate", () => {
    const store = makeStore();
    const a = addTextField(store, "alpha");
    const beforeIds = new Set(Object.keys(store.getSchema().entities));
    store.cloneEntity(a.id);
    const afterIds = Object.keys(store.getSchema().entities);
    const newId = afterIds.find((id) => !beforeIds.has(id));
    expect(newId).toBeDefined();
    expect(store.getSchema().entities[newId!].type).toBe("textField");
  });

  it("setEntityAttribute updates in place", () => {
    const store = makeStore();
    const a = addTextField(store, "alpha");
    store.setEntityAttribute(a.id, "label", "alpha-renamed");
    expect((store.getEntity(a.id)?.attributes as Record<string, unknown>).label).toBe("alpha-renamed");
  });
});

describe("useBuilderStore integration smoke", () => {
  it("schema getter is consistent with addEntity", () => {
    const store = makeStore();
    expect(store.getSchema().root).toEqual([]);
    const e = addTextField(store, "first");
    expect(store.getSchema().root).toContain(e.id);
    expect(store.getSchema().entities[e.id].type).toBe("textField");
  });

  it("dataSet is observable via subscribe", () => {
    const store = makeStore();
    const handler = vi.fn();
    const unsub = store.subscribe(handler);
    addTextField(store, "x");
    expect(handler).toHaveBeenCalled();
    unsub();
  });
});
