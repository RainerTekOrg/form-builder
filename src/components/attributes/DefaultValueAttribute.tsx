"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { defaultValueAttribute } from "@/src/builder/attributes/defaultValue";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const DefaultValueAttribute = createAttributeComponent(defaultValueAttribute, (props) => {
  const value = props.attribute.value;
  const entityType = props.entity.type;

  if (entityType === "numberField" || entityType === "integerField") {
    const numValue = typeof value === "number" ? value : "";
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Default value</Label>
        <Input
          type="number"
          value={numValue}
          onChange={(e) => props.setValue(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="No default"
          className="h-8 text-xs"
        />
      </div>
    );
  }

  if (entityType === "booleanField") {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={`default-${props.entity.id}`}
          checked={value === true}
          onCheckedChange={(checked) => props.setValue(checked === true)}
        />
        <Label htmlFor={`default-${props.entity.id}`} className="text-xs font-medium cursor-pointer">
          Default value
        </Label>
      </div>
    );
  }

  const displayValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">Default value</Label>
      <Input
        value={displayValue}
        onChange={(e) => props.setValue(e.target.value || undefined)}
        placeholder="No default"
        className="h-8 text-xs"
      />
    </div>
  );
});
