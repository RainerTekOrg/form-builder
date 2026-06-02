import type { FormPayload } from "@/src/contract/types";

export const repeatingForm: FormPayload = {
  schema: {
    type: "object",
    properties: {
      test_results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            parameter: { type: "string" },
            value: { type: "number" },
          },
        },
      },
    },
  },
  uiSchema: {
    test_results: {
      "ui:label": "Test Results",
      "ui:widget": "repeating",
      "ui:order": 1,
      "x-coltorapps-key": "test_results",
    },
    "test_results.parameter": {
      "ui:label": "Parameter",
      "ui:widget": "text",
      "ui:order": 1,
      "x-coltorapps-key": "test_results.parameter",
    },
    "test_results.value": {
      "ui:label": "Value",
      "ui:widget": "number",
      "ui:order": 2,
      "x-coltorapps-key": "test_results.value",
    },
  },
};
