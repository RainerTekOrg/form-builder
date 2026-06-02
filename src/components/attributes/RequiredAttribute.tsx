"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { requiredAttribute } from "@/src/builder/attributes/required";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const RequiredAttribute = createAttributeComponent(requiredAttribute, (props) => (
  <div className="flex items-center justify-between">
    <Label className="text-xs font-medium cursor-pointer">Required</Label>
    <Switch
      checked={props.attribute.value ?? false}
      onCheckedChange={(checked) => props.setValue(checked)}
    />
  </div>
));
