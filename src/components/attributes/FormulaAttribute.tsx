"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { formulaAttribute } from "@/src/builder/attributes/formula";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FormulaAttribute = createAttributeComponent(formulaAttribute, (props) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">Formula</Label>
    <Input
      value={props.attribute.value ?? ""}
      onChange={(e) => props.setValue(e.target.value)}
      placeholder='e.g. {field1} + {field2}'
      className="h-8 text-sm font-mono"
    />
    <p className="text-[10px] text-muted-foreground">
      Use {"{field_key}"} syntax to reference other fields.
    </p>
  </div>
));
