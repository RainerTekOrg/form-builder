import { describe, it, expect } from "vitest";
import { exampleForm } from "@/src/contract/example";
import { fieldTypeMetaMap, fieldTypes } from "@/src/contract/field-types";
import type { FormPayload, JsonSchema, UiSchema, InboundMessage, OutboundMessage } from "@/src/contract/types";

describe("contract types", () => {
  it("example form compiles and round-trips JSON", () => {
    const json = JSON.stringify(exampleForm);
    const parsed = JSON.parse(json) as FormPayload;
    expect(parsed.schema.type).toBe("object");
    expect(parsed.schema.properties).toHaveProperty("full_name");
    expect(parsed.schema.required).toContain("full_name");
    expect(parsed.uiSchema["full_name"]?.["ui:label"]).toBe("Full Name");
  });

  it("has all required schema properties", () => {
    const props = exampleForm.schema.properties!;
    expect(props.full_name.type).toBe("string");
    expect(props.age.type).toBe("integer");
    expect(props.department.type).toBe("string");
    expect(props.department.enum).toEqual(["engineering", "quality", "lab"]);
  });

  it("has all required uiSchema entries", () => {
    expect(exampleForm.uiSchema.full_name?.["ui:widget"]).toBe("text");
    expect(exampleForm.uiSchema.age?.["ui:widget"]).toBe("number");
    expect(exampleForm.uiSchema.department?.["ui:widget"]).toBe("select");
    expect(exampleForm.uiSchema.department?.["x-coltorapps-key"]).toBe("department");
  });

  it("FormPayload type is structurally sound", () => {
    const payload: FormPayload = {
      schema: { type: "object" },
      uiSchema: {},
    };
    expect(payload.schema.type).toBe("object");
  });

  it("InboundMessage discriminates correctly", () => {
    const loadForm: InboundMessage = {
      type: "LOAD_FORM",
      payload: { schema: { type: "object" }, uiSchema: {} },
    };
    const loadGroup: InboundMessage = {
      type: "LOAD_GROUP",
      payload: { schema: { type: "object" }, uiSchema: {}, groupId: "g1", version: 1 },
    };
    expect(loadForm.type).toBe("LOAD_FORM");
    expect(loadGroup.type).toBe("LOAD_GROUP");
  });

  it("OutboundMessage discriminates correctly", () => {
    const saved: OutboundMessage = {
      type: "FORM_SAVED",
      payload: { schema: { type: "object" }, uiSchema: {} },
    };
    const error: OutboundMessage = { type: "ERROR", code: "BAD_ORIGIN", message: "" };
    expect(saved.type).toBe("FORM_SAVED");
    expect(error.type).toBe("ERROR");
  });
});

describe("field-types catalog", () => {
  it("has all 14 field types", () => {
    expect(fieldTypes).toHaveLength(14);
    expect(fieldTypes).toContain("text");
    expect(fieldTypes).toContain("section");
    expect(fieldTypes).toContain("computed");
  });

  it("each field type has metadata", () => {
    for (const ft of fieldTypes) {
      const meta = fieldTypeMetaMap[ft];
      expect(meta).toBeDefined();
      expect(meta.jsonType).toBeTruthy();
      expect(meta.widget).toBeTruthy();
      expect(typeof meta.isContainer).toBe("boolean");
      expect(typeof meta.isComputed).toBe("boolean");
    }
  });

  it("section and repeating are containers", () => {
    expect(fieldTypeMetaMap.section.isContainer).toBe(true);
    expect(fieldTypeMetaMap.repeating.isContainer).toBe(true);
    expect(fieldTypeMetaMap.text.isContainer).toBe(false);
  });

  it("computed is computed", () => {
    expect(fieldTypeMetaMap.computed.isComputed).toBe(true);
    expect(fieldTypeMetaMap.text.isComputed).toBe(false);
  });
});
