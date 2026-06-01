"use client";

import { useState, useCallback } from "react";
import { Header } from "@/src/components/layout/Header";
import { Palette } from "@/src/components/canvas/Palette";
import { FormBuilder } from "@/src/components/canvas/FormBuilder";
import { PropertiesPanel } from "@/src/components/canvas/PropertiesPanel";

export default function Home() {
  const [mode, setMode] = useState<"build" | "preview">("build");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const handleFieldAdd = useCallback((fieldType: string) => {
    console.log("Add field:", fieldType);
  }, []);

  const handleExport = useCallback(() => {
    console.log("Export JSON");
  }, []);

  const handleSave = useCallback(() => {
    console.log("Save");
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header
        mode={mode}
        onModeChange={setMode}
        onExport={handleExport}
        onSave={handleSave}
      />

      {mode === "build" ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 shrink-0 hidden md:block">
            <Palette onFieldAdd={handleFieldAdd} />
          </div>
          <div className="flex-1 min-w-0">
            <FormBuilder
              onSelectEntity={setSelectedEntityId}
              selectedEntityId={selectedEntityId}
            />
          </div>
          <div className="w-72 shrink-0 hidden lg:block">
            <PropertiesPanel selectedEntityId={selectedEntityId} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            Preview mode — will render fillable form in a future phase.
          </p>
        </div>
      )}
    </div>
  );
}
