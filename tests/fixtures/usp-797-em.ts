import type { FormPayload } from "@/src/contract/types";

export const usp797Form: FormPayload = {
  schema: {
    type: "object",
    properties: {
      sampling_date: { type: "string", format: "date" },
      location: {
        type: "object",
        properties: {
          room_number: { type: "string", minLength: 1 },
          iso_class: { type: "string", enum: ["ISO5", "ISO7", "ISO8"] },
        },
        required: ["room_number"],
      },
      viable_count: { type: "number", minimum: 0 },
      nonviable_count: { type: "integer", minimum: 0 },
      action_taken: { type: "string" },
    },
    required: ["sampling_date", "viable_count"],
  },
  uiSchema: {
    sampling_date: {
      "ui:label": "Sampling Date",
      "ui:widget": "date",
      "ui:order": 1,
      "x-coltorapps-key": "sampling_date",
    },
    location: {
      "ui:label": "Location",
      "ui:widget": "section",
      "ui:order": 2,
      "x-coltorapps-key": "location",
    },
    "location.room_number": {
      "ui:label": "Room Number",
      "ui:widget": "text",
      "ui:order": 1,
      "ui:placeholder": "e.g. A-123",
      "x-coltorapps-key": "location.room_number",
    },
    "location.iso_class": {
      "ui:label": "ISO Class",
      "ui:widget": "select",
      "ui:order": 2,
      "ui:options": [
        { value: "ISO5", label: "ISO 5" },
        { value: "ISO7", label: "ISO 7" },
        { value: "ISO8", label: "ISO 8" },
      ],
      "x-coltorapps-key": "location.iso_class",
    },
    viable_count: {
      "ui:label": "Viable Particle Count",
      "ui:widget": "number",
      "ui:order": 3,
      "ui:unit": "CFU/m³",
      "ui:help": "Total viable count per cubic meter",
      "x-coltorapps-key": "viable_count",
    },
    nonviable_count: {
      "ui:label": "Nonviable Particle Count",
      "ui:widget": "number",
      "ui:order": 4,
      "ui:unit": "particles/m³",
      "x-coltorapps-key": "nonviable_count",
    },
    action_taken: {
      "ui:label": "Action Taken",
      "ui:widget": "textarea",
      "ui:order": 5,
      "ui:help": "Describe corrective actions if applicable",
      "x-coltorapps-key": "action_taken",
    },
  },
};
