import type { ComponentType } from "react";
import {
  Type,
  AlignLeft,
  Hash,
  List,
  CheckSquare,
  Calendar,
  FileUp,
  Layers,
  Repeat,
  FunctionSquare,
} from "lucide-react";

export interface FieldGroupItem {
  widget: string;
  entity: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface FieldGroup {
  label: string;
  items: FieldGroupItem[];
}

export const fieldTypeGroups: FieldGroup[] = [
  {
    label: "Inputs",
    items: [
      { widget: "text", entity: "textField", label: "Text Field", icon: Type },
      { widget: "textarea", entity: "textareaField", label: "Text Area", icon: AlignLeft },
      { widget: "number", entity: "numberField", label: "Number", icon: Hash },
      { widget: "integer", entity: "integerField", label: "Integer", icon: Hash },
    ],
  },
  {
    label: "Choice",
    items: [
      { widget: "select", entity: "selectField", label: "Select", icon: List },
      { widget: "multiselect", entity: "multiSelectField", label: "Multi Select", icon: List },
      { widget: "boolean", entity: "booleanField", label: "Checkbox", icon: CheckSquare },
    ],
  },
  {
    label: "Date / Time",
    items: [
      { widget: "date", entity: "dateField", label: "Date", icon: Calendar },
      { widget: "datetime", entity: "datetimeField", label: "Date Time", icon: Calendar },
    ],
  },
  {
    label: "Media",
    items: [
      { widget: "file", entity: "fileField", label: "File Upload", icon: FileUp },
      // Signature is intentionally NOT offered here. Approver signatures are now a
      // template-builder concern (data-bound SignatureSlot resolved at approval),
      // not a form field. The signatureField entity + serializer support remain so
      // any EXISTING form that already contains one still loads — we only stop
      // authoring new ones. See signature-integration-plan.md (S5).
    ],
  },
  {
    label: "Layout",
    items: [
      { widget: "section", entity: "section", label: "Section", icon: Layers },
      { widget: "repeating", entity: "repeating", label: "Repeating", icon: Repeat },
    ],
  },
  {
    label: "Special",
    items: [
      { widget: "computed", entity: "computedField", label: "Computed", icon: FunctionSquare },
    ],
  },
];
