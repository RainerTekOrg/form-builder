import { describe, it, expect } from "vitest";
import { keyAttribute, KEY_REGEX } from "@/src/builder/attributes/key";
import { labelAttribute } from "@/src/builder/attributes/label";
import { requiredAttribute } from "@/src/builder/attributes/required";
import { placeholderAttribute } from "@/src/builder/attributes/placeholder";
import { helpTextAttribute } from "@/src/builder/attributes/helpText";
import { optionsAttribute } from "@/src/builder/attributes/options";
import { validationAttribute } from "@/src/builder/attributes/validation";
import { unitAttribute } from "@/src/builder/attributes/unit";
import { conditionAttribute } from "@/src/builder/attributes/condition";
import { formulaAttribute } from "@/src/builder/attributes/formula";
import type { Attribute, AttributeContext } from "@coltorapps/builder";

const mockContext = {
  schema: { entities: {}, root: [] },
  entity: { id: "test", type: "textField", attributes: {} },
} satisfies AttributeContext;

function runValidate<T>(attr: Attribute<string, T>, value: unknown): T {
  return attr.validate(value, mockContext);
}

function safeValidate<T>(attr: Attribute<string, T>, value: unknown): { success: true; data: T } | { success: false; error: unknown } {
  try {
    return { success: true as const, data: runValidate(attr, value) };
  } catch (e) {
    return { success: false as const, error: e };
  }
}

describe("keyAttribute", () => {
  it("accepts valid keys", () => {
    expect(safeValidate(keyAttribute, "first_name").success).toBe(true);
    expect(safeValidate(keyAttribute, "a").success).toBe(true);
    expect(safeValidate(keyAttribute, "field1").success).toBe(true);
    expect(safeValidate(keyAttribute, "a1").success).toBe(true);
  });

  it("rejects invalid keys", () => {
    expect(safeValidate(keyAttribute, "").success).toBe(false);
    expect(safeValidate(keyAttribute, "1st").success).toBe(false);
    expect(safeValidate(keyAttribute, "UPPERCASE").success).toBe(false);
    expect(safeValidate(keyAttribute, "has space").success).toBe(false);
    expect(safeValidate(keyAttribute, "has-dash").success).toBe(false);
  });

  it("KEY_REGEX matches the pattern", () => {
    expect(KEY_REGEX.test("valid_key")).toBe(true);
    expect(KEY_REGEX.test("Valid_key")).toBe(false);
    expect(KEY_REGEX.test("_invalid")).toBe(false);
  });
});

describe("labelAttribute", () => {
  it("accepts non-empty strings", () => {
    expect(safeValidate(labelAttribute, "Full Name").success).toBe(true);
    expect(safeValidate(labelAttribute, "A").success).toBe(true);
  });

  it("rejects empty strings and non-strings", () => {
    expect(safeValidate(labelAttribute, "").success).toBe(false);
    expect(safeValidate(labelAttribute, 123).success).toBe(false);
    expect(safeValidate(labelAttribute, null).success).toBe(false);
  });
});

describe("requiredAttribute", () => {
  it("accepts booleans", () => {
    expect(safeValidate(requiredAttribute, true).success).toBe(true);
    expect(safeValidate(requiredAttribute, false).success).toBe(true);
  });

  it("rejects non-booleans", () => {
    expect(safeValidate(requiredAttribute, "true").success).toBe(false);
    expect(safeValidate(requiredAttribute, 1).success).toBe(false);
    expect(safeValidate(requiredAttribute, null).success).toBe(false);
  });
});

describe("placeholderAttribute", () => {
  it("accepts strings and undefined", () => {
    expect(safeValidate(placeholderAttribute, "Enter text").success).toBe(true);
    expect(safeValidate(placeholderAttribute, undefined).success).toBe(true);
  });

  it("rejects non-strings", () => {
    expect(safeValidate(placeholderAttribute, 123).success).toBe(false);
  });
});

describe("helpTextAttribute", () => {
  it("accepts strings and undefined", () => {
    expect(safeValidate(helpTextAttribute, "Some help").success).toBe(true);
    expect(safeValidate(helpTextAttribute, undefined).success).toBe(true);
  });
});

describe("optionsAttribute", () => {
  it("accepts valid option arrays", () => {
    const options = [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
    ];
    const result = safeValidate(optionsAttribute, options);
    expect(result.success).toBe(true);
  });

  it("rejects invalid options", () => {
    expect(safeValidate(optionsAttribute, "not-array").success).toBe(false);
    expect(safeValidate(optionsAttribute, [{ value: "", label: "" }]).success).toBe(false);
    expect(safeValidate(optionsAttribute, [{ value: "a" }]).success).toBe(false);
  });
});

describe("validationAttribute", () => {
  it("accepts valid validation rules", () => {
    const rules = [
      { type: "min" as const, value: 0 },
      { type: "max" as const, value: 100 },
      { type: "pattern" as const, value: "^[a-z]+$" },
    ];
    const result = safeValidate(validationAttribute, rules);
    expect(result.success).toBe(true);
  });

  it("accepts undefined", () => {
    expect(safeValidate(validationAttribute, undefined).success).toBe(true);
  });

  it("rejects invalid rule types", () => {
    expect(
      safeValidate(validationAttribute, [{ type: "invalid" as never, value: 0 }]).success,
    ).toBe(false);
  });
});

describe("unitAttribute", () => {
  it("accepts strings and undefined", () => {
    expect(safeValidate(unitAttribute, "kg").success).toBe(true);
    expect(safeValidate(unitAttribute, undefined).success).toBe(true);
  });
});

describe("conditionAttribute", () => {
  it("accepts valid conditions", () => {
    const condition = { field: "age", operator: "gt" as const, value: 18 };
    expect(safeValidate(conditionAttribute, condition).success).toBe(true);
  });

  it("accepts undefined", () => {
    expect(safeValidate(conditionAttribute, undefined).success).toBe(true);
  });

  it("rejects invalid conditions", () => {
    expect(safeValidate(conditionAttribute, { field: "", operator: "eq", value: null }).success).toBe(false);
    expect(safeValidate(conditionAttribute, { operator: "eq", value: null }).success).toBe(false);
  });
});

describe("formulaAttribute", () => {
  it("accepts non-empty strings", () => {
    expect(safeValidate(formulaAttribute, "{field1} + {field2}").success).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(safeValidate(formulaAttribute, "").success).toBe(false);
  });
});
