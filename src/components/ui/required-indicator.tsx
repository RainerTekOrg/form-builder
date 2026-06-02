import { cn } from "@/lib/utils";

export function RequiredIndicator({ className }: { className?: string }) {
  return (
    <span className={cn("text-destructive font-medium", className)} aria-label="required">
      *
    </span>
  );
}
