"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { multiSelectFieldEntity } from "@/src/builder/entities/multiselect-field";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { Badge } from "@/components/ui/badge";

export const MultiSelectFieldEntity = createEntityComponent(multiSelectFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex min-h-9 flex-wrap gap-1 rounded-md border border-input bg-muted/50 px-3 py-2">
      {props.entity.attributes.options?.slice(0, 3).map((opt) => (
        <Badge key={opt.value} variant="secondary" className="text-xs">
          {opt.label}
        </Badge>
      ))}
      {(props.entity.attributes.options?.length ?? 0) > 3 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{props.entity.attributes.options!.length - 3} more
        </Badge>
      )}
      {(!props.entity.attributes.options || props.entity.attributes.options.length === 0) && (
        <span className="text-sm text-muted-foreground">No options defined</span>
      )}
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
