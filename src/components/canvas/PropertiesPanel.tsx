"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings2, Trash2, AlertTriangle, Copy, ArrowUp, ArrowDown } from "lucide-react";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PropertiesPanelProps {
  builderStore: BuilderStore<typeof formBuilder>;
  selectedEntityId: string | null;
  onDeleteEntity: (id: string) => void;
  onCloneEntity?: (id: string) => void;
  onMoveEntity?: (id: string, direction: -1 | 1) => void;
}

export function PropertiesPanel({
  builderStore,
  selectedEntityId,
  onDeleteEntity,
  onCloneEntity,
  onMoveEntity,
}: PropertiesPanelProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const entity = selectedEntityId
    ? builderStore.getEntity(selectedEntityId)
    : null;

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLDivElement | null;
      viewport?.scrollTo({ top: 0 });
    }
  }, [selectedEntityId]);

  const handleDelete = () => {
    if (selectedEntityId) {
      onDeleteEntity(selectedEntityId);
      setDeleteOpen(false);
    }
  };

  const handleClone = () => {
    if (!selectedEntityId || !onCloneEntity) return;
    onCloneEntity(selectedEntityId);
    toast.success("Field duplicated");
  };

  const handleMove = (direction: -1 | 1) => {
    if (!selectedEntityId || !onMoveEntity) return;
    onMoveEntity(selectedEntityId, direction);
  };

  const positionInfo = (() => {
    if (!entity) return null;
    const schema = builderStore.getSchema();
    const parentId = (entity as { parentId?: string }).parentId;
    const siblings = parentId
      ? (schema.entities[parentId] as { children?: string[] } | undefined)?.children ?? []
      : schema.root;
    const idx = siblings.indexOf(entity.id);
    if (idx === -1 || siblings.length === 0) return null;
    return { current: idx + 1, total: siblings.length, parentId: parentId ?? null };
  })();

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
          <div className="flex items-center gap-0.5">
            {positionInfo && (
              <span className="text-[10px] text-muted-foreground font-mono mr-1.5">
                {positionInfo.current}/{positionInfo.total}
              </span>
            )}
            {onMoveEntity && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label="Move up"
                      onClick={() => handleMove(-1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move up (↑)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label="Move down"
                      onClick={() => handleMove(1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move down (↓)</TooltipContent>
                </Tooltip>
              </>
            )}
            {onCloneEntity && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    aria-label="Duplicate field"
                    onClick={handleClone}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate</TooltipContent>
              </Tooltip>
            )}
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
          </div>
        )}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
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
            <div className="h-4" />
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
