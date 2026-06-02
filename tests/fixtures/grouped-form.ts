import type { FormPayload } from "@/src/contract/types";

export const groupedForm: FormPayload = {
  schema: {
    type: "object",
    properties: {
      "customer.company_name": { type: "string", minLength: 1 },
      "customer.vat_id": { type: "string" },
      cfu_count: { type: "integer", minimum: 0 },
    },
    required: ["customer.company_name", "cfu_count"],
  },
  uiSchema: {
    "customer.company_name": {
      "ui:label": "Company Name",
      "ui:widget": "text",
      "ui:order": 1,
      "x-coltorapps-key": "customer.company_name",
      "ui:help": "Legal business name",
      "x-group": { sourceGroupId: "grp_customer", sourceGroupVersion: 3 },
    },
    "customer.vat_id": {
      "ui:label": "VAT ID",
      "ui:widget": "text",
      "ui:order": 2,
      "x-coltorapps-key": "customer.vat_id",
      "x-group": { sourceGroupId: "grp_customer", sourceGroupVersion: 3 },
    },
    cfu_count: {
      "ui:label": "CFU Count",
      "ui:widget": "number",
      "ui:order": 3,
      "ui:unit": "CFU",
      "x-coltorapps-key": "cfu_count",
    },
  },
};
