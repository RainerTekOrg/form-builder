"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { unitAttribute } from "@/src/builder/attributes/unit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const UnitAttribute = createAttributeComponent(unitAttribute, (props) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">Unit</Label>
    <Input
      value={props.attribute.value ?? ""}
      onChange={(e) => props.setValue(e.target.value || undefined)}
      placeholder="e.g. mg, mL, CFU"
      className="h-8 text-sm"
    />
  </div>
));
