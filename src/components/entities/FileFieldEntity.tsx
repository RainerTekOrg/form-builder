"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { fileFieldEntity } from "@/src/builder/entities/file-field";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/components/ui/required-indicator";
import { Upload } from "lucide-react";

export const FileFieldEntity = createEntityComponent(fileFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
      <Upload className="h-4 w-4" />
      <span>Click or drag to upload</span>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));
