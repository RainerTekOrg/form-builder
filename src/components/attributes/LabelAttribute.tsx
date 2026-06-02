"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { labelAttribute } from "@/src/builder/attributes/label";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LabelAttribute = createAttributeComponent(labelAttribute, (props) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">Label</Label>
    <Input
      value={props.attribute.value ?? ""}
      onChange={(e) => props.setValue(e.target.value)}
      placeholder="Field label"
      className="h-8 text-sm"
    />
  </div>
));
