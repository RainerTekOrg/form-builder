"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { fieldWidthAttribute } from "@/src/builder/attributes/fieldWidth";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const widthOptions = [
  { value: "full", label: "Full width" },
  { value: "half", label: "Half (1/2)" },
  { value: "third", label: "Third (1/3)" },
  { value: "two-thirds", label: "Two thirds (2/3)" },
] as const;

export const FieldWidthAttribute = createAttributeComponent(fieldWidthAttribute, (props) => {
  const width = props.attribute.value ?? "full";

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">Field width</Label>
      <Select
        value={width}
        onValueChange={(val) => props.setValue(val as typeof width)}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {widthOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
