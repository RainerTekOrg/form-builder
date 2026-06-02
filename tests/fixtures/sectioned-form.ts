import type { FormPayload } from "@/src/contract/types";

export const sectionedForm: FormPayload = {
  schema: {
    type: "object",
    properties: {
      customer: {
        type: "object",
        properties: {
          company_name: { type: "string", minLength: 1 },
          contact_email: { type: "string", format: "email" },
        },
        required: ["company_name"],
      },
      notes: { type: "string" },
    },
    required: ["notes"],
  },
  uiSchema: {
    customer: {
      "ui:label": "Customer Information",
      "ui:widget": "section",
      "ui:order": 1,
      "x-coltorapps-key": "customer",
    },
    "customer.company_name": {
      "ui:label": "Company Name",
      "ui:widget": "text",
      "ui:order": 1,
      "x-coltorapps-key": "customer.company_name",
    },
    "customer.contact_email": {
      "ui:label": "Contact Email",
      "ui:widget": "text",
      "ui:order": 2,
      "ui:placeholder": "email@example.com",
      "x-coltorapps-key": "customer.contact_email",
    },
    notes: {
      "ui:label": "Notes",
      "ui:widget": "textarea",
      "ui:order": 2,
      "x-coltorapps-key": "notes",
    },
  },
};
