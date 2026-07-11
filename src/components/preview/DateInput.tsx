"use client";

import type { ChangeEvent } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateInputProps {
  id?: string;
  type?: "date" | "datetime-local";
  value: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  error?: boolean;
  className?: string;
}

/**
 * Styled date / datetime field. Wraps the native picker (reliable + accessible,
 * no extra dependency) in a bordered shell with a leading calendar affordance so
 * it matches the other fill inputs instead of the raw browser control.
 */
export function DateInput({
  id,
  type = "date",
  value,
  onChange,
  onBlur,
  error,
  className,
}: DateInputProps) {
  return (
    <div
      className={cn(
        "relative flex items-center rounded-md border bg-transparent transition-colors focus-within:ring-1 focus-within:ring-ring",
        error ? "border-destructive" : "border-input",
        className,
      )}
    >
      <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value || undefined)}
        onBlur={onBlur}
        aria-invalid={error}
        className={cn(
          "w-full bg-transparent py-2 pl-9 pr-3 text-sm outline-none",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70",
        )}
      />
    </div>
  );
}
