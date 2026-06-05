import { describe, it, expect } from "vitest";
import { expandGroup } from "@/src/serializer/groups";
import type { FormPayload } from "@/src/contract/types";

describe("expandGroup", () => {
  it("expands a flat 2-field group into 2 entities", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
      },
      uiSchema: {
        name: {
          "ui:label": "Name",
          "ui:widget": "text",
          "ui:order": 1,
          "x-coltorapps-key": "name",
        },
        age: {
          "ui:label": "Age",
          "ui:widget": "number",
          "ui:order": 2,
          "x-coltorapps-key": "age",
        },
      },
    };

    const entities = expandGroup(group);
    expect(entities).toHaveLength(2);
    expect(entities[0].type).toBe("textField");
    expect(entities[0].attributes.key).toBe("name");
    expect(entities[0].attributes.label).toBe("Name");
    expect(entities[1].type).toBe("integerField");
    expect(entities[1].attributes.key).toBe("age");
  });

  it("namespaces keys with parentKey", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          company_name: { type: "string" },
        },
      },
      uiSchema: {
        company_name: {
          "ui:label": "Company Name",
          "ui:widget": "text",
          "ui:order": 1,
        },
      },
    };

    const entities = expandGroup(group, "customer");
    expect(entities[0].attributes.key).toBe("customer.company_name");
  });

  it("maps jsonSchema types to entity types correctly", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          a: { type: "string" },
          b: { type: "integer" },
          c: { type: "number" },
          d: { type: "boolean" },
        },
      },
      uiSchema: {
        a: { "ui:widget": "text", "ui:label": "A", "x-coltorapps-key": "a" },
        b: { "ui:widget": "number", "ui:label": "B", "x-coltorapps-key": "b" },
        c: { "ui:widget": "number", "ui:label": "C", "x-coltorapps-key": "c" },
        d: { "ui:widget": "checkbox", "ui:label": "D", "x-coltorapps-key": "d" },
      },
    };

    const entities = expandGroup(group);
    expect(entities[0].type).toBe("textField");
    expect(entities[1].type).toBe("integerField");
    expect(entities[2].type).toBe("numberField");
    expect(entities[3].type).toBe("booleanField");
  });

  it("preserves enum values as options", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          dept: {
            type: "string",
            enum: ["eng", "qa", "lab"],
          },
        },
      },
      uiSchema: {
        dept: {
          "ui:widget": "select",
          "ui:label": "Department",
          "x-coltorapps-key": "dept",
        },
      },
    };

    const entities = expandGroup(group);
    expect(entities[0].attributes.options).toEqual([
      { value: "eng", label: "eng" },
      { value: "qa", label: "qa" },
      { value: "lab", label: "lab" },
    ]);
  });

  it("returns empty array for empty group", () => {
    const group: FormPayload = {
      schema: { type: "object" },
      uiSchema: {},
    };
    expect(expandGroup(group)).toEqual([]);
  });

  it("extracts fieldWidth from uiSchema", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: { name: { type: "string" } },
      },
      uiSchema: {
        name: { "ui:widget": "text", "ui:label": "Name", "ui:width": "half" },
      },
    };
    const entities = expandGroup(group);
    expect(entities[0].attributes.fieldWidth).toBe("half");
  });

  it("extracts condition from uiSchema", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: { name: { type: "string" } },
      },
      uiSchema: {
        name: {
          "ui:widget": "text",
          "ui:label": "Name",
          "ui:condition": { field: "age", operator: "gt", value: 18 },
        },
      },
    };
    const entities = expandGroup(group);
    expect(entities[0].attributes.condition).toEqual({ field: "age", operator: "gt", value: 18 });
  });

  it("extracts required from schema.required", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      },
      uiSchema: {
        name: { "ui:widget": "text", "ui:label": "Name" },
      },
    };
    const entities = expandGroup(group);
    expect(entities[0].attributes.required).toBe(true);
  });

  it("extracts validation from JSON Schema constraints", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          age: { type: "integer", minimum: 0, maximum: 150 },
        },
      },
      uiSchema: {
        age: { "ui:widget": "number", "ui:label": "Age" },
      },
    };
    const entities = expandGroup(group);
    expect(entities[0].attributes.validation).toEqual(
      expect.arrayContaining([
        { type: "min", value: 0 },
        { type: "max", value: 150 },
      ]),
    );
  });

  it("recursively expands nested sections", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          contact: {
            type: "object",
            properties: {
              email: { type: "string" },
              phone: { type: "string" },
            },
          },
        },
      },
      uiSchema: {
        contact: { "ui:widget": "section", "ui:label": "Contact" },
        "contact.email": { "ui:widget": "text", "ui:label": "Email" },
        "contact.phone": { "ui:widget": "text", "ui:label": "Phone" },
      },
    };
    const entities = expandGroup(group);
    // Should have: section entity + 2 leaf entities
    expect(entities.length).toBeGreaterThanOrEqual(3);
    expect(entities[0].type).toBe("section");
    expect(entities[0].attributes.key).toBe("contact");
    expect(entities[1].attributes.key).toBe("contact.email");
    expect(entities[2].attributes.key).toBe("contact.phone");
  });

  it("recursively expands repeating groups", () => {
    const group: FormPayload = {
      schema: {
        type: "object",
        properties: {
          readings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string", format: "date-time" },
                value: { type: "number" },
              },
            },
          },
        },
      },
      uiSchema: {
        readings: { "ui:widget": "repeating", "ui:label": "Readings" },
        "readings.time": { "ui:widget": "datetime", "ui:label": "Time" },
        "readings.value": { "ui:widget": "number", "ui:label": "Value" },
      },
    };
    const entities = expandGroup(group);
    expect(entities.length).toBeGreaterThanOrEqual(3);
    expect(entities[0].type).toBe("repeating");
    expect(entities[0].attributes.key).toBe("readings");
    expect(entities[1].attributes.key).toBe("readings.time");
    expect(entities[2].attributes.key).toBe("readings.value");
  });
});
