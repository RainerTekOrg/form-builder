"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { RequiredIndicator } from "@/src/components/ui/required-indicator";
import { cn } from "@/lib/utils";

/** Inline validation message shown beneath a field. */
export function FieldError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p className="text-xs text-destructive mt-1" role="alert">
      {error instanceof Error ? error.message : String(error)}
    </p>
  );
}

interface FieldShellProps {
  /** Top label. Omit for fields that render their own label (e.g. a checkbox row). */
  label?: string;
  required?: boolean;
  error?: unknown;
  helpText?: string;
  /** `htmlFor` for the label → the control's id. */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Shared wrapper for every interactive fill field: consistent label + required
 * marker, spacing, inline error, and help text. Keeps all field types visually
 * uniform so the fill form reads as one coherent surface.
 */
export function FieldShell({
  label,
  required,
  error,
  helpText,
  htmlFor,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label !== undefined && (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <RequiredIndicator className="ml-0.5" />}
        </Label>
      )}
      {children}
      <FieldError error={error} />
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}
