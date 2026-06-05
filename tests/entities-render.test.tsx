// @vitest-environment jsdom

import * as React from "react";
import { describe, expect, it, vi, beforeAll, afterEach } from "vitest";

beforeAll(() => {
  if (typeof ResizeObserver === "undefined") {
    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  }

  // Ensure elements report non-zero dimensions in tests
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0, y: 0, top: 0, right: 400, bottom: 100, left: 0,
      width: 400, height: 100,
      toJSON: () => ({}),
    };
  };
});
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { entityComponents } from "@/src/components/entities/entity-components";
import { textFieldEntity } from "@/src/builder/entities/text-field";
import { textareaFieldEntity } from "@/src/builder/entities/textarea-field";
import { numberFieldEntity } from "@/src/builder/entities/number-field";
import { integerFieldEntity } from "@/src/builder/entities/integer-field";
import { selectFieldEntity } from "@/src/builder/entities/select-field";
import { multiSelectFieldEntity } from "@/src/builder/entities/multiselect-field";
import { booleanFieldEntity } from "@/src/builder/entities/boolean-field";
import { dateFieldEntity } from "@/src/builder/entities/date-field";
import { datetimeFieldEntity } from "@/src/builder/entities/datetime-field";
import { fileFieldEntity } from "@/src/builder/entities/file-field";
import { signatureFieldEntity } from "@/src/builder/entities/signature-field";
import { sectionEntity } from "@/src/builder/entities/section-entity";
import { repeatingEntity } from "@/src/builder/entities/repeating-entity";
import { computedFieldEntity } from "@/src/builder/entities/computed-field-entity";
import type { EntityComponentProps } from "@coltorapps/builder-react";

type AnyEntityComponent = (props: EntityComponentProps) => React.ReactNode;

function makeProps(entity: { name: string }, attrs: Record<string, unknown>) {
  return {
    entity: {
      id: "test-id",
      type: entity.name,
      attributes: attrs,
    },
    children: [],
    setValue: () => {},
    validateValue: async () => {},
    resetError: () => {},
    resetValue: () => {},
    clearValue: () => {},
  } as unknown as EntityComponentProps;
}

function renderEntity(
  Component: AnyEntityComponent,
  entity: { name: string },
  attrs: Record<string, unknown> = {},
) {
  return render(<Component {...makeProps(entity, attrs)} />);
}

afterEach(() => {
  cleanup();
});

describe("entity components — render smoke", () => {
  it("renders textField with label and placeholder", () => {
    renderEntity(
      entityComponents.textField as unknown as AnyEntityComponent,
      textFieldEntity,
      { label: "Full Name", placeholder: "Enter your name", required: true },
    );
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByLabelText("required")).toBeInTheDocument();
  });

  it("renders textField without required indicator when not required", () => {
    renderEntity(
      entityComponents.textField as unknown as AnyEntityComponent,
      textFieldEntity,
      { label: "Notes", required: false },
    );
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.queryByLabelText("required")).not.toBeInTheDocument();
  });

  it("renders textField help text when set", () => {
    renderEntity(
      entityComponents.textField as unknown as AnyEntityComponent,
      textFieldEntity,
      { label: "Email", helpText: "We will not spam you" },
    );
    expect(screen.getByText("We will not spam you")).toBeInTheDocument();
  });

  it("renders textareaField", () => {
    renderEntity(
      entityComponents.textareaField as unknown as AnyEntityComponent,
      textareaFieldEntity,
      { label: "Description", placeholder: "Tell us more" },
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tell us more")).toBeInTheDocument();
  });

  it("renders numberField with unit", () => {
    renderEntity(
      entityComponents.numberField as unknown as AnyEntityComponent,
      numberFieldEntity,
      { label: "Weight", unit: "kg", required: true },
    );
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
  });

  it("renders integerField with unit", () => {
    renderEntity(
      entityComponents.integerField as unknown as AnyEntityComponent,
      integerFieldEntity,
      { label: "Quantity", unit: "pcs" },
    );
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("pcs")).toBeInTheDocument();
  });

  it("renders selectField with options", () => {
    renderEntity(
      entityComponents.selectField as unknown as AnyEntityComponent,
      selectFieldEntity,
      {
        label: "Color",
        options: [
          { value: "red", label: "Red" },
          { value: "blue", label: "Blue" },
        ],
      },
    );
    expect(screen.getByText("Color")).toBeInTheDocument();
  });

  it("renders multiSelectField", () => {
    renderEntity(
      entityComponents.multiSelectField as unknown as AnyEntityComponent,
      multiSelectFieldEntity,
      {
        label: "Tags",
        options: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
      },
    );
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("renders booleanField as checkbox", () => {
    renderEntity(
      entityComponents.booleanField as unknown as AnyEntityComponent,
      booleanFieldEntity,
      { label: "Subscribe to newsletter" },
    );
    expect(screen.getByText("Subscribe to newsletter")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders dateField", () => {
    renderEntity(
      entityComponents.dateField as unknown as AnyEntityComponent,
      dateFieldEntity,
      { label: "Start date" },
    );
    expect(screen.getByText("Start date")).toBeInTheDocument();
  });

  it("renders datetimeField", () => {
    renderEntity(
      entityComponents.datetimeField as unknown as AnyEntityComponent,
      datetimeFieldEntity,
      { label: "Appointment at" },
    );
    expect(screen.getByText("Appointment at")).toBeInTheDocument();
  });

  it("renders fileField with upload affordance", () => {
    renderEntity(
      entityComponents.fileField as unknown as AnyEntityComponent,
      fileFieldEntity,
      { label: "Attach file" },
    );
    expect(screen.getByText("Attach file")).toBeInTheDocument();
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });

  it("renders signatureField with drawing canvas", () => {
    renderEntity(
      entityComponents.signatureField as unknown as AnyEntityComponent,
      signatureFieldEntity,
      { label: "Sign here" },
    );
    expect(screen.getByText("Sign here")).toBeInTheDocument();
    expect(screen.getByText(/clear signature/i)).toBeInTheDocument();
  });

  it("renders section with empty-state hint when no children", () => {
    renderEntity(
      entityComponents.section as unknown as AnyEntityComponent,
      sectionEntity,
      { label: "Customer Info" },
    );
    expect(screen.getByText("Customer Info")).toBeInTheDocument();
    expect(screen.getByText(/drag fields into this section/i)).toBeInTheDocument();
  });

  it("renders section with children when provided", () => {
    const SectionCmp = entityComponents.section as unknown as AnyEntityComponent;
    const TextCmp = entityComponents.textField as unknown as AnyEntityComponent;
    const props = makeProps(sectionEntity, { label: "Customer Info" });
    const childProps = makeProps(textFieldEntity, { label: "Child Field" });
    const childEl = <TextCmp {...childProps} key="child" />;
    const propsWithChildren = { ...props, children: [childEl] };
    render(<SectionCmp {...propsWithChildren} />);
    expect(screen.getByText("Customer Info")).toBeInTheDocument();
    expect(screen.getByText("Child Field")).toBeInTheDocument();
  });

  it("renders repeating block with empty-state hint", () => {
    renderEntity(
      entityComponents.repeating as unknown as AnyEntityComponent,
      repeatingEntity,
      { label: "Line Items" },
    );
    expect(screen.getByText("Line Items")).toBeInTheDocument();
    expect(screen.getByText(/repeating group/i)).toBeInTheDocument();
  });

  it("renders computedField with auto badge and formula", () => {
    renderEntity(
      entityComponents.computedField as unknown as AnyEntityComponent,
      computedFieldEntity,
      { label: "Total", formula: "sum(line_items.amount)" },
    );
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("auto")).toBeInTheDocument();
    expect(screen.getByText(/sum\(line_items\.amount\)/)).toBeInTheDocument();
  });
});

describe("entity components — error handling", () => {
  it("does not throw on render with minimal attributes", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderEntity(
        entityComponents.textField as unknown as AnyEntityComponent,
        textFieldEntity,
        { label: "Test" },
      ),
    ).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
