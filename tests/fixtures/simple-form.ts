import type { FormPayload } from "@/src/contract/types";

export const simpleForm: FormPayload = {
  schema: {
    type: "object",
    properties: {
      full_name: { type: "string", minLength: 1 },
      age: { type: "integer", minimum: 0 },
      department: { type: "string", enum: ["eng", "qa", "lab"] },
    },
    required: ["full_name"],
  },
  uiSchema: {
    full_name: {
      "ui:label": "Full Name",
      "ui:widget": "text",
      "ui:order": 1,
      "ui:placeholder": "Enter your name",
      "x-coltorapps-key": "full_name",
    },
    age: {
      "ui:label": "Age",
      "ui:widget": "number",
      "ui:order": 2,
      "ui:help": "Must be positive",
      "x-coltorapps-key": "age",
    },
    department: {
      "ui:label": "Department",
      "ui:widget": "select",
      "ui:order": 3,
      "ui:help": "Select your department",
      "ui:options": [
        { value: "eng", label: "Engineering" },
        { value: "qa", label: "Quality" },
        { value: "lab", label: "Lab" },
      ],
      "x-coltorapps-key": "department",
    },
  },
};
