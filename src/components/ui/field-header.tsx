"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { BuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";

interface FieldHeaderProps {
  entityId: string;
  label: string;
  required: boolean;
  builderStore: BuilderStore<typeof formBuilder>;
  className?: string;
}

export function FieldHeader({
  entityId,
  label,
  required,
  builderStore,
  className = "",
}: FieldHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(label);
  }, [label]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) {
      builderStore.setEntityAttribute(entityId, "label", trimmed);
    }
    setEditing(false);
  }, [draft, label, entityId, builderStore]);

  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  }, []);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setDraft(label);
        setEditing(false);
      }
    },
    [commit, label],
  );

  const handleInputBlur = useCallback(() => {
    commit();
  }, [commit]);

  const toggleRequired = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      builderStore.setEntityAttribute(entityId, "required", !required);
    },
    [entityId, required, builderStore],
  );

  return (
    <div className={`flex items-center justify-between gap-1 ${className}`}>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onClick={handleInputClick}
          className="flex-1 text-sm font-medium bg-background border border-input rounded px-1.5 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-0"
        />
      ) : (
        <span
          onClick={handleLabelClick}
          className="text-sm font-medium cursor-text hover:bg-muted/50 rounded px-1 -mx-1 truncate"
          title="Click to edit label"
        >
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={toggleRequired}
        className="shrink-0 text-sm px-1 rounded hover:bg-muted transition-colors leading-none"
        title={required ? "Mark as optional" : "Mark as required"}
        aria-label={required ? "Remove required" : "Mark as required"}
      >
        <span className={required ? "text-destructive" : "text-muted-foreground/40"}>
          {required ? "\u2605" : "\u2606"}
        </span>
      </button>
    </div>
  );
}
