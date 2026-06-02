"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { booleanFieldEntity } from "@/src/builder/entities/boolean-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";

export const BooleanFieldEntity = createEntityComponent(booleanFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <Checkbox disabled id={`bool-${props.entity.id}`} />
      <Label htmlFor={`bool-${props.entity.id}`} className="text-sm font-medium">
        {props.entity.attributes.label}
        {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
      </Label>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground pl-6">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
