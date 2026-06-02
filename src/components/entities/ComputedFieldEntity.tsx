"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { computedFieldEntity } from "@/src/builder/entities/computed-field-entity";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FunctionSquare } from "lucide-react";

export const ComputedFieldEntity = createEntityComponent(computedFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <FunctionSquare className="h-4 w-4 text-muted-foreground" />
      <Label className="text-sm font-medium text-muted-foreground">
        {props.entity.attributes.label}
      </Label>
      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">
        auto
      </Badge>
    </div>
    <div className="flex items-center gap-1.5 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      <span className="italic">computed: {props.entity.attributes.formula}</span>
      {props.entity.attributes.unit && (
        <span className="text-xs text-muted-foreground">{props.entity.attributes.unit}</span>
      )}
    </div>
  </div>
));
