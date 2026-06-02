"use client";

import { useState } from "react";
import { useInterpreterStore, InterpreterEntities } from "@coltorapps/builder-react";
import type { BuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { interactiveEntityComponents } from "./entity-components";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, RotateCcw, Info } from "lucide-react";

interface PlaygroundProps {
  builderStore: BuilderStore<typeof formBuilder>;
}

export function Playground({ builderStore }: PlaygroundProps) {
  const schema = builderStore.getSchema();
  const hasEntities = schema.root.length > 0;

  const interpreter = useInterpreterStore(formBuilder, schema);

  const handleReset = () => {
    interpreter.resetEntitiesValues();
    interpreter.resetEntitiesErrors();
  };

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Preview</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
            <Info className="h-3 w-3" />
            Preview only
          </span>
          {hasEntities && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleReset}>
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {!hasEntities ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <Eye className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="text-sm font-medium mb-1">Nothing to preview</h3>
              <p className="text-xs text-muted-foreground">
                Add some fields in the Build tab first.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 space-y-5">
            <InterpreterEntities
              interpreterStore={interpreter}
              components={interactiveEntityComponents}
            />
          </div>
        )}
      </ScrollArea>
    </main>
  );
}
