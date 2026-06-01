import { describe, it, expect } from "vitest";
import { generateKey, namespaceKey, flattenKeys, KEY_REGEX } from "@/src/serializer/key";
import type { Schema } from "@coltorapps/builder";

describe("generateKey", () => {
  it("slugifies a simple label", () => {
    expect(generateKey("Full Name", new Set())).toBe("full_name");
  });

  it("handles collision with _2, _3 suffixes", () => {
    const existing = new Set(["full_name"]);
    expect(generateKey("Full Name", existing)).toBe("full_name_2");
    existing.add("full_name_2");
    expect(generateKey("Full Name", existing)).toBe("full_name_3");
  });

  it("produces deterministic keys for same label", () => {
    const empty = new Set<string>();
    const key1 = generateKey("Email Address", empty);
    const key2 = generateKey("Email Address", new Set([key1]));
    expect(key1).toBe("email_address");
    expect(key2).toBe("email_address_2");
  });

  it("handles labels with special characters", () => {
    const result = generateKey("What's your (favorite) color?", new Set());
    expect(result).toBe("what_s_your_favorite_color");
  });

  it("adds f_ prefix when key starts with number", () => {
    const result = generateKey("123 ABC", new Set());
    expect(result).toBe("f_123_abc");
  });

  it("returns 'field' for empty label", () => {
    expect(generateKey("", new Set())).toBe("field");
    expect(generateKey("   ", new Set())).toBe("field");
  });

  it("supports existing keys with _2 suffix correctly", () => {
    const existing = new Set(["field"]);
    expect(generateKey("", existing)).toBe("field_2");
  });

  it("generates valid KEY_REGEX keys", () => {
    const labels = [
      "Simple Label",
      "123 starts with number",
      "Special !@#$ characters removed",
      "UPPERCASE stuff",
      "",
    ];
    for (const label of labels) {
      const key = generateKey(label, new Set());
      expect(KEY_REGEX.test(key)).toBe(true);
    }
  });
});

describe("namespaceKey", () => {
  it("joins parent and child keys with a dot", () => {
    expect(namespaceKey("customer", "name")).toBe("customer.name");
    expect(namespaceKey("form", namespaceKey("section", "field"))).toBe("form.section.field");
  });
});

describe("flattenKeys", () => {
  it("returns empty set for empty schema", () => {
    const result = flattenKeys({ root: [], entities: {} });
    expect(result.size).toBe(0);
  });

  it("collects keys from all entities", () => {
    const schema = {
      root: ["e1", "e2"] as readonly string[],
      entities: {
        e1: { type: "textField", attributes: { key: "first_name" } },
        e2: { type: "numberField", attributes: { key: "age" } },
      },
    };
    const result = flattenKeys(schema);
    expect(result.has("first_name")).toBe(true);
    expect(result.has("age")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("traverses children", () => {
    const schema = {
      root: ["e1"] as readonly string[],
      entities: {
        e1: {
          type: "section",
          attributes: { key: "customer" },
          children: ["e2", "e3"],
        },
        e2: { type: "textField", attributes: { key: "customer.name" } },
        e3: { type: "textField", attributes: { key: "customer.email" } },
      },
    };
    const result = flattenKeys(schema);
    expect(result.has("customer")).toBe(true);
    expect(result.has("customer.name")).toBe(true);
    expect(result.has("customer.email")).toBe(true);
    expect(result.size).toBe(3);
  });
});
