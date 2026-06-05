"use client";

import { FileJson, Save, Eye, EyeOff, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  mode: "build" | "preview";
  onModeChange: (mode: "build" | "preview") => void;
  onExport: () => void;
  onSave: () => void;
  onClear?: () => void;
  isDirty?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export function Header({
  mode,
  onModeChange,
  onExport,
  onSave,
  onClear,
  isDirty = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  title = "Untitled form",
  onTitleChange,
}: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-lg font-semibold tracking-tight shrink-0">Form Builder</h1>
        <span className="text-muted-foreground/40 shrink-0">/</span>
        {onTitleChange ? (
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled form"
            aria-label="Form title"
            className="bg-transparent text-sm font-medium outline-none focus:bg-muted/50 rounded px-1.5 py-0.5 min-w-0 max-w-[280px] truncate"
          />
        ) : (
          <span className="text-sm font-medium text-muted-foreground truncate max-w-[280px]">
            {title}
          </span>
        )}
        {isDirty && (
          <span
            className="h-2 w-2 rounded-full bg-amber-500 shrink-0"
            aria-label="Unsaved changes"
            title="Unsaved changes"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {(onUndo || onRedo) && (
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onUndo}
                  disabled={!canUndo}
                  aria-label="Undo"
                >
                  <span className="text-base">↶</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (⌘Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRedo}
                  disabled={!canRedo}
                  aria-label="Redo"
                >
                  <span className="text-base">↷</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (⇧⌘Z)</TooltipContent>
            </Tooltip>
          </div>
        )}

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
          {onClear && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 text-muted-foreground")}
                  onClick={onClear}
                  aria-label="Clear form"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear form</TooltipContent>
            </Tooltip>
          )}
          <Button variant="outline" size="sm" onClick={onExport} title="Export JSON">
            <FileJson className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Save</span>
                {isDirty && (
                  <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDirty ? "Save unsaved changes (⌘S)" : "Save (⌘S)"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
