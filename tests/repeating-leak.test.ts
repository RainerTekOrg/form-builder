// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createBuilderStore, createInterpreterStore } from "@coltorapps/builder";
import type { Schema } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { deserialize } from "@/src/serializer/deserialize";
import { extractValues } from "@/src/components/fill/extract-values";
import { applyDefaults } from "@/src/components/fill/apply-defaults";
import type { FillPayload } from "@/src/contract/types";

const schema = { type:"object", properties:{
  samples: { type:"array", items:{ type:"object", properties:{ sample_id:{type:"string"}, cfu_plate:{type:"number"} } } },
  note: { type:"string" },
}} as FillPayload["schema"];
const uiSchema = {
  samples: { "ui:widget":"repeating", "ui:order":0, "x-coltorapps-key":"samples" },
  "samples.sample_id": { "ui:widget":"text", "ui:order":1, "x-coltorapps-key":"samples.sample_id" },
  "samples.cfu_plate": { "ui:widget":"number", "ui:order":2, "x-coltorapps-key":"samples.cfu_plate" },
  note: { "ui:widget":"text", "ui:order":3, "x-coltorapps-key":"note" },
} as FillPayload["uiSchema"];

function build() {
  const native = deserialize({ schema, uiSchema } as FillPayload);
  const builderStore = createBuilderStore(formBuilder);
  builderStore.setData({ schema: native, entitiesAttributesErrors: {}, schemaError: undefined });
  const interpreter = createInterpreterStore(formBuilder, native as Schema<typeof formBuilder>);
  const entities = (native as unknown as { entities: Record<string, { type: string; attributes: Record<string,unknown> }> }).entities;
  const idByKey = (k: string) => Object.entries(entities).find(([, e]) => e.attributes.key === k)?.[0];
  return { builderStore, interpreter, idByKey };
}

describe("repeating-group key leak", () => {
  it("does NOT emit repeating children as top-level dotted keys", () => {
    const { builderStore, interpreter, idByKey } = build();
    // Set the repeating group's row array (the correct place) + a top-level note.
    interpreter.setEntityValue(idByKey("samples")!, [{ sample_id: "S1", cfu_plate: 12 }]);
    interpreter.setEntityValue(idByKey("note")!, "hello");
    // Simulate the leak vector: a child entity somehow holding a scalar value.
    interpreter.setEntityValue(idByKey("samples.cfu_plate")!, 99);

    const { values } = extractValues(interpreter, builderStore);
    expect(values).toEqual({ samples: [{ sample_id: "S1", cfu_plate: 12 }], note: "hello" });
    expect(values["samples.cfu_plate"]).toBeUndefined();
    expect(values["samples.sample_id"]).toBeUndefined();
  });

  it("does NOT re-hydrate a stale leaked dotted default onto a child", () => {
    const { builderStore, interpreter, idByKey } = build();
    applyDefaults(interpreter as unknown as { setEntityValue(id: string, v: unknown): void }, builderStore, {
      schema, uiSchema,
      defaults: { note: "hi", "samples.cfu_plate": 77, samples: [{ sample_id: "A", cfu_plate: 1 }] },
    } as FillPayload);
    // The child must stay empty; only the array + note apply.
    expect(interpreter.getEntitiesValues()[idByKey("samples.cfu_plate")!]).toBeUndefined();
    const { values } = extractValues(interpreter, builderStore);
    expect(values["samples.cfu_plate"]).toBeUndefined();
    expect(values.note).toBe("hi");
    expect(values.samples).toEqual([{ sample_id: "A", cfu_plate: 1 }]);
  });
});
