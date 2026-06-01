"use client";

import { FileJson, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  mode: "build" | "preview";
  onModeChange: (mode: "build" | "preview") => void;
  onExport: () => void;
  onSave: () => void;
}

export function Header({ mode, onModeChange, onExport, onSave }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">Form Builder</h1>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          — drag-and-drop form authoring
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Tabs
          value={mode}
          onValueChange={(v) => onModeChange(v as "build" | "preview")}
          className="hidden sm:flex"
        >
          <TabsList className="h-8">
            <TabsTrigger value="build" className="text-xs gap-1.5">
              {mode === "build" ? <EyeOff className="h-3.5 w-3.5" /> : null}
              Build
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs gap-1.5">
              {mode === "preview" ? <Eye className="h-3.5 w-3.5" /> : null}
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onExport} title="Export JSON">
            <FileJson className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="default" size="sm" onClick={onSave}>
            <Download className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
