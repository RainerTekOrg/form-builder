"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { placeholderAttribute } from "@/src/builder/attributes/placeholder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PlaceholderAttribute = createAttributeComponent(placeholderAttribute, (props) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">Placeholder</Label>
    <Input
      value={props.attribute.value ?? ""}
      onChange={(e) => props.setValue(e.target.value || undefined)}
      placeholder="Placeholder text"
      className="h-8 text-sm"
    />
  </div>
));
