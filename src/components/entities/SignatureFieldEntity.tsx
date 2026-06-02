"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { signatureFieldEntity } from "@/src/builder/entities/signature-field";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { PenLine } from "lucide-react";

export const SignatureFieldEntity = createEntityComponent(signatureFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-input bg-muted/30 text-sm text-muted-foreground">
      <PenLine className="h-4 w-4 mr-2" />
      <span>Signature area</span>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
