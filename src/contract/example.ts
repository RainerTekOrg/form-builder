import type { FormPayload } from "./types";

export const exampleForm: FormPayload = {
  schema: {
    type: "object",
    properties: {
      full_name: {
        type: "string",
        minLength: 1,
      },
      age: {
        type: "integer",
        minimum: 0,
        maximum: 150,
      },
      department: {
        type: "string",
        enum: ["engineering", "quality", "lab"],
      },
    },
    required: ["full_name", "age"],
  },
  uiSchema: {
    full_name: {
      "ui:label": "Full Name",
      "ui:widget": "text",
      "ui:order": 1,
      "ui:placeholder": "Enter your full name",
      "x-coltorapps-key": "full_name",
    },
    age: {
      "ui:label": "Age",
      "ui:widget": "number",
      "ui:order": 2,
      "ui:help": "Must be between 0 and 150",
      "x-coltorapps-key": "age",
    },
    department: {
      "ui:label": "Department",
      "ui:widget": "select",
      "ui:order": 3,
      "ui:help": "Select your department",
      "ui:options": [
        { value: "engineering", label: "Engineering" },
        { value: "quality", label: "Quality" },
        { value: "lab", label: "Lab" },
      ],
      "x-coltorapps-key": "department",
    },
  },
};
