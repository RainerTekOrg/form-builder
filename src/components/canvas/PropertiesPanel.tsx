"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";

interface PropertiesPanelProps {
  selectedEntityId: string | null;
}

export function PropertiesPanel({ selectedEntityId }: PropertiesPanelProps) {
  return (
    <aside className="flex h-full flex-col border-l bg-muted/30">
      <div className="border-b px-4 py-3 shrink-0">
        <h2 className="text-sm font-semibold">Properties</h2>
      </div>

      <ScrollArea className="flex-1">
        {!selectedEntityId ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">No selection</h3>
              <p className="text-xs text-muted-foreground">
                Select a field on the canvas to edit its properties.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs font-mono">
                {selectedEntityId}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Attribute editors will render here in a future phase.
            </p>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
