import { describe, it, expect } from "vitest";
import { serialize } from "@/src/serializer/serialize";
import { deserialize } from "@/src/serializer/deserialize";
import { simpleForm } from "./fixtures/simple-form";
import { sectionedForm } from "./fixtures/sectioned-form";
import { repeatingForm } from "./fixtures/repeating-form";
import { groupedForm } from "./fixtures/grouped-form";
import { usp797Form } from "./fixtures/usp-797-em";
import type { FormPayload } from "@/src/contract/types";

const fixtures: Array<{ name: string; data: FormPayload }> = [
  { name: "simple-form", data: simpleForm },
  { name: "sectioned-form", data: sectionedForm },
  { name: "repeating-form", data: repeatingForm },
  { name: "grouped-form", data: groupedForm },
  { name: "usp-797-em", data: usp797Form },
];

function normalize(payload: FormPayload): FormPayload {
  return JSON.parse(JSON.stringify(payload));
}

describe("serializer round-trip", () => {
  it.each(fixtures)("round-trips $name", ({ data }) => {
    const normalized = normalize(data);

    // deserialize -> serialize
    const coltorappsSchema = deserialize(normalized);
    const result = serialize(coltorappsSchema);

    // Check top-level structure
    expect(result.schema.type).toBe("object");

    // Properties match
    const originalKeys = Object.keys(normalized.schema.properties ?? {});
    const resultKeys = Object.keys(result.schema.properties ?? {});
    expect(resultKeys.sort()).toEqual(originalKeys.sort());

    // Required arrays match (sorted)
    const originalRequired = [...(normalized.schema.required ?? [])].sort();
    const resultRequired = [...(result.schema.required ?? [])].sort();
    expect(resultRequired).toEqual(originalRequired);

    // UI Schema keys match
    const originalUiKeys = Object.keys(normalized.uiSchema).sort();
    const resultUiKeys = Object.keys(result.uiSchema).sort();
    expect(resultUiKeys).toEqual(originalUiKeys);

    // x-coltorapps-key values are preserved
    for (const key of resultUiKeys) {
      const originalEntry = normalized.uiSchema[key];
      const resultEntry = result.uiSchema[key];
      if (originalEntry && resultEntry) {
        expect(resultEntry["x-coltorapps-key"]).toBe(originalEntry["x-coltorapps-key"]);
      }
    }

    // Group provenance preserved when present (TODO: external provenance map)
    for (const key of resultUiKeys) {
      const originalEntry = normalized.uiSchema[key];
      const resultEntry = result.uiSchema[key];
      if (originalEntry?.["x-group"] && resultEntry?.["x-group"]) {
        expect(resultEntry["x-group"]).toEqual(originalEntry["x-group"]);
      }
    }
  });

  it("serializes a form that can be deserialized back to the same structure", () => {
    for (const { name, data } of fixtures) {
      const coltorappsSchema = deserialize(data);
      const serialized = serialize(coltorappsSchema);

      // Second round-trip should be stable
      const coltorappsSchema2 = deserialize(serialized);
      const serialized2 = serialize(coltorappsSchema2);

      const keys1 = Object.keys(serialized.schema.properties ?? {}).sort();
      const keys2 = Object.keys(serialized2.schema.properties ?? {}).sort();
      expect(keys2).toEqual(keys1);

      const uiKeys1 = Object.keys(serialized.uiSchema).sort();
      const uiKeys2 = Object.keys(serialized2.uiSchema).sort();
      expect(uiKeys2).toEqual(uiKeys1);
    }
  });
});
