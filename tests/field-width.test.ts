import { describe, it, expect } from "vitest";
import { groupFieldsByWidth } from "@/src/components/preview/Playground";

type E = { type: string; attributes?: Record<string, unknown> };

/** Build an entities map + root order from a list of [id, type, explicitWidth?]. */
function make(defs: Array<[string, string, string?]>) {
  const entities: Record<string, E> = {};
  const root: string[] = [];
  for (const [id, type, width] of defs) {
    entities[id] = { type, attributes: width ? { fieldWidth: width } : {} };
    root.push(id);
  }
  return { root, entities };
}

const widths = (rows: ReturnType<typeof groupFieldsByWidth>) =>
  rows.map((r) => r.map((e) => e.width));

describe("groupFieldsByWidth — 6-unit responsive row packing", () => {
  it("pairs two default half-width fields into one row", () => {
    const { root, entities } = make([
      ["a", "textField"],
      ["b", "numberField"],
    ]);
    expect(widths(groupFieldsByWidth(root, entities))).toEqual([["half", "half"]]);
  });

  it("packs three thirds into one row and honors the explicit width", () => {
    const { root, entities } = make([
      ["a", "textField", "third"],
      ["b", "textField", "third"],
      ["c", "textField", "third"],
    ]);
    expect(widths(groupFieldsByWidth(root, entities))).toEqual([
      ["third", "third", "third"],
    ]);
  });

  it("starts a new row when the next field would overflow 6 units", () => {
    // two-thirds (4) + half (3) = 7 > 6 → half wraps to a new row
    const { root, entities } = make([
      ["a", "textField", "two-thirds"],
      ["b", "textField", "half"],
    ]);
    expect(widths(groupFieldsByWidth(root, entities))).toEqual([
      ["two-thirds"],
      ["half"],
    ]);
  });

  it("puts full-width fields on their own row and breaks the run", () => {
    const { root, entities } = make([
      ["a", "textField"], // half
      ["b", "textareaField"], // full (default)
      ["c", "numberField"], // half
    ]);
    expect(widths(groupFieldsByWidth(root, entities))).toEqual([
      ["half"],
      ["full"],
      ["half"],
    ]);
  });

  it("falls back to the type default when no explicit width is set", () => {
    const { root, entities } = make([["a", "section"]]);
    expect(widths(groupFieldsByWidth(root, entities))).toEqual([["full"]]);
  });
});
