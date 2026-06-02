"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { selectFieldEntity } from "@/src/builder/entities/select-field";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SelectFieldEntity = createEntityComponent(selectFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Select disabled>
      <SelectTrigger className="bg-muted/50">
        <SelectValue placeholder={props.entity.attributes.placeholder ?? "Select..."} />
      </SelectTrigger>
      <SelectContent>
        {props.entity.attributes.options?.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
