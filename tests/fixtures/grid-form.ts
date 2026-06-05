import type { FormPayload } from "@/src/contract/types";

export const gridForm: FormPayload = {
  schema: {
    type: "object",
    properties: {
      first_name: { type: "string", minLength: 1 },
      last_name: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
      department: { type: "string" },
      salary: { type: "number", minimum: 0 },
    },
    required: ["first_name", "last_name", "email"],
  },
  uiSchema: {
    first_name: {
      "ui:label": "First Name",
      "ui:widget": "text",
      "ui:order": 1,
      "ui:width": "half",
      "x-coltorapps-key": "first_name",
    },
    last_name: {
      "ui:label": "Last Name",
      "ui:widget": "text",
      "ui:order": 2,
      "ui:width": "half",
      "x-coltorapps-key": "last_name",
    },
    email: {
      "ui:label": "Email",
      "ui:widget": "text",
      "ui:order": 3,
      "ui:width": "full",
      "x-coltorapps-key": "email",
    },
    department: {
      "ui:label": "Department",
      "ui:widget": "text",
      "ui:order": 4,
      "ui:width": "third",
      "x-coltorapps-key": "department",
    },
    salary: {
      "ui:label": "Salary",
      "ui:widget": "number",
      "ui:order": 5,
      "x-coltorapps-key": "salary",
    },
  },
};
