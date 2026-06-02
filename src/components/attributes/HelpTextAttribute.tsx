"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { helpTextAttribute } from "@/src/builder/attributes/helpText";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const HelpTextAttribute = createAttributeComponent(helpTextAttribute, (props) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">Help text</Label>
    <Textarea
      value={props.attribute.value ?? ""}
      onChange={(e) => props.setValue(e.target.value || undefined)}
      placeholder="Helper text shown below the field"
      className="min-h-[60px] resize-none text-sm"
    />
  </div>
));
