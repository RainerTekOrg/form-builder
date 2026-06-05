"use client";

import { X, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FillHeaderProps {
  title: string;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function FillHeader({ title, canSubmit, onCancel, onSubmit }: FillHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <h1 className="text-lg font-semibold truncate" data-testid="fill-title">
          {title}
        </h1>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2 shrink-0">
          Fill mode
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Cancel">
          <X className="h-4 w-4 mr-1.5" />
          Cancel
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={onSubmit}
              disabled={!canSubmit}
              data-testid="fill-submit"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Submit
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canSubmit ? "Submit your values" : "Fill required fields to enable"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
