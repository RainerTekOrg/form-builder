"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BuilderEntityAttributes } from "@coltorapps/builder-react";
import type { BuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { entityAttributesComponents } from "@/src/components/attributes/entity-attributes";
import { useState } from "react";

interface PropertiesPanelProps {
  builderStore: BuilderStore<typeof formBuilder>;
  selectedEntityId: string | null;
  onDeleteEntity: (id: string) => void;
}

export function PropertiesPanel({
  builderStore,
  selectedEntityId,
  onDeleteEntity,
}: PropertiesPanelProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const entity = selectedEntityId
    ? builderStore.getEntity(selectedEntityId)
    : null;

  const handleDelete = () => {
    if (selectedEntityId) {
      onDeleteEntity(selectedEntityId);
      setDeleteOpen(false);
    }
  };

  const childCount = entity
    ? (entity as unknown as { children?: { length?: number; size?: number } }).children?.length ??
      (entity as unknown as { children?: { size?: number } }).children?.size ??
      0
    : 0;

  return (
    <aside className="flex h-full flex-col border-l bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
        <h2 className="text-sm font-semibold">Properties</h2>
        {entity && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label="Delete field"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete field
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &ldquo;
                  {String((entity.attributes as Record<string, unknown>)?.label ?? "Untitled")}
                  &rdquo;? This action cannot be undone.
                  {childCount > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      This field contains {childCount} child field
                      {childCount !== 1 ? "ren" : ""} that will also be removed.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ScrollArea className="flex-1">
        {!selectedEntityId || !entity ? (
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
          <div>
            <div className="flex items-center gap-2 border-b px-4 py-2">
              <Badge variant="secondary" className="text-[10px] font-mono">
                {entity.type}
              </Badge>
            </div>
            <BuilderEntityAttributes
              builderStore={builderStore}
              entityId={selectedEntityId}
              components={entityAttributesComponents}
            />
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
