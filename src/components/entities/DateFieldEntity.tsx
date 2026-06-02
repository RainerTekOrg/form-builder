"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { dateFieldEntity } from "@/src/builder/entities/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";

export const DateFieldEntity = createEntityComponent(dateFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input
      type="date"
      disabled
      className="bg-muted/50"
    />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
