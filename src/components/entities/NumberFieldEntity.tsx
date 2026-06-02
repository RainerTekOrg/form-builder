"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { numberFieldEntity } from "@/src/builder/entities/number-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";

export const NumberFieldEntity = createEntityComponent(numberFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        placeholder={props.entity.attributes.placeholder ?? "0"}
        disabled
        className="bg-muted/50"
      />
      {props.entity.attributes.unit && (
        <span className="text-sm text-muted-foreground shrink-0 min-w-[2ch]">
          {props.entity.attributes.unit}
        </span>
      )}
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
