"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { sectionEntity } from "@/src/builder/entities/section-entity";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const SectionEntity = createEntityComponent(sectionEntity, (props) => (
  <div className={cn("space-y-3 rounded-lg border-l-2 border-primary/30 bg-muted/20 p-3")}>
    <div className="flex items-center gap-2 text-sm font-medium text-primary/70">
      <Layers className="h-4 w-4" />
      <Label className="text-sm font-medium cursor-pointer">
        {props.entity.attributes.label}
      </Label>
    </div>
    {props.children && props.children.length > 0 ? (
      <div className="space-y-2 pl-4 border-l border-border/50">
        {props.children}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground pl-4">
        Drag fields into this section
      </p>
    )}
  </div>
));
