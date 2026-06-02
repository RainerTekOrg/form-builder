"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { textareaFieldEntity } from "@/src/builder/entities/textarea-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";

export const TextareaFieldEntity = createEntityComponent(textareaFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Textarea
      placeholder={props.entity.attributes.placeholder ?? ""}
      disabled
      className="bg-muted/50 resize-none"
    />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
