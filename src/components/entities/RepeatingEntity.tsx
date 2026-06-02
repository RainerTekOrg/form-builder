"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { repeatingEntity } from "@/src/builder/entities/repeating-entity";
import { Label } from "@/components/ui/label";
import { Repeat, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const RepeatingEntity = createEntityComponent(repeatingEntity, (props) => (
  <div className={cn("space-y-3 rounded-lg border-l-2 border-amber-400/40 bg-muted/20 p-3")}>
    <div className="flex items-center gap-2 text-sm font-medium text-amber-600/70">
      <Repeat className="h-4 w-4" />
      <Label className="text-sm font-medium cursor-pointer">
        {props.entity.attributes.label}
      </Label>
    </div>
    {props.children && props.children.length > 0 ? (
      <div className="space-y-2 pl-4">
        {props.children}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground pl-4">
        Drag fields into this repeating group
      </p>
    )}
    <button
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pl-4"
      disabled
    >
      <Plus className="h-3 w-3" />
      Add item
    </button>
  </div>
));
