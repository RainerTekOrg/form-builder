"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  try {
    window.localStorage.setItem("form-builder-theme", isDark ? "dark" : "light");
  } catch {
    // ignore
  }
}

export function ThemeToggle() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 hidden dark:inline-block" />
          <Moon className="h-4 w-4 inline-block dark:hidden" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}
