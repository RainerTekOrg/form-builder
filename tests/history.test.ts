import { describe, expect, it } from "vitest";
import { createHistory } from "@/src/builder/history";

describe("createHistory", () => {
  it("starts with one present and no past/future", () => {
    const h = createHistory(0);
    expect(h.canUndo()).toBe(false);
    expect(h.canRedo()).toBe(false);
    expect(h.size()).toEqual({ past: 0, future: 0 });
  });

  it("snapshot moves present to past, future is cleared", () => {
    const h = createHistory(0);
    h.snapshot(1);
    expect(h.canUndo()).toBe(true);
    expect(h.canRedo()).toBe(false);
    expect(h.size()).toEqual({ past: 1, future: 0 });
  });

  it("undo returns previous value, redo returns next", () => {
    const h = createHistory(0);
    h.snapshot(1);
    h.snapshot(2);
    expect(h.undo()).toBe(1);
    expect(h.canUndo()).toBe(true);
    expect(h.canRedo()).toBe(true);
    expect(h.undo()).toBe(0);
    expect(h.canUndo()).toBe(false);
    expect(h.redo()).toBe(1);
    expect(h.redo()).toBe(2);
    expect(h.canRedo()).toBe(false);
  });

  it("new snapshot after undo clears future (linear history)", () => {
    const h = createHistory("a");
    h.snapshot("b");
    h.snapshot("c");
    h.undo();
    h.undo();
    expect(h.canRedo()).toBe(true);
    h.snapshot("d");
    expect(h.canRedo()).toBe(false);
    expect(h.size()).toEqual({ past: 1, future: 0 });
  });

  it("returns null when undo/redo have nothing to do", () => {
    const h = createHistory("a");
    expect(h.undo()).toBeNull();
    expect(h.redo()).toBeNull();
  });

  it("respects maxDepth by trimming oldest entries", () => {
    const h = createHistory(0, 3);
    h.snapshot(1);
    h.snapshot(2);
    h.snapshot(3);
    h.snapshot(4);
    expect(h.size()).toEqual({ past: 3, future: 0 });
    expect(h.undo()).toBe(3);
    expect(h.undo()).toBe(2);
    expect(h.undo()).toBe(1);
    expect(h.undo()).toBeNull();
  });

  it("snapshot with identical value is a no-op", () => {
    const obj = { x: 1 };
    const h = createHistory(obj);
    h.snapshot(obj);
    expect(h.canUndo()).toBe(false);
  });

  it("reset clears history and sets new present", () => {
    const h = createHistory("a");
    h.snapshot("b");
    h.snapshot("c");
    h.reset("d");
    expect(h.size()).toEqual({ past: 0, future: 0 });
    expect(h.canUndo()).toBe(false);
    expect(h.canRedo()).toBe(false);
    h.snapshot("e");
    expect(h.undo()).toBe("d");
  });

  it("works with object snapshots (schema reference equality)", () => {
    const s1 = { entities: { a: { id: "a" } }, root: ["a"] };
    const s2 = { entities: { a: { id: "a" }, b: { id: "b" } }, root: ["a", "b"] };
    const s3 = { entities: { a: { id: "a" }, b: { id: "b" }, c: { id: "c" } }, root: ["a", "b", "c"] };
    const h = createHistory(s1);
    h.snapshot(s2);
    h.snapshot(s3);
    expect(h.undo()).toBe(s2);
    expect(h.undo()).toBe(s1);
    expect(h.redo()).toBe(s2);
    expect(h.redo()).toBe(s3);
  });
});
