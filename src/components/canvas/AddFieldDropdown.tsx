"use client";

import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { fieldTypeGroups } from "@/src/contract/field-groups";
import { useAddField, useAddFieldCtx } from "./add-field-context";

interface AddFieldDropdownProps {
  parentId: string | null;
  allowedFieldTypes?: string[];
  variant?: "ghost" | "outline" | "secondary";
  size?: "sm" | "icon" | "default";
  label?: string;
}

export function AddFieldDropdown({
  parentId,
  allowedFieldTypes: allowedFieldTypesProp,
  variant = "ghost",
  size = "sm",
  label,
}: AddFieldDropdownProps) {
  const addField = useAddField();
  const { allowedFieldTypes: allowedFieldTypesCtx } = useAddFieldCtx();
  const allowedFieldTypes = allowedFieldTypesProp ?? allowedFieldTypesCtx;

  const groups = allowedFieldTypes
    ? fieldTypeGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => allowedFieldTypes.includes(item.entity)),
        }))
        .filter((g) => g.items.length > 0)
    : fieldTypeGroups;

  if (groups.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1" aria-label="Add field" onClick={(e) => e.stopPropagation()}>
          <Plus className="h-3.5 w-3.5" />
          {label && <span className="text-xs">{label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-56">
        {groups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                {group.label}
              </DropdownMenuLabel>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.entity}
                    onClick={(e) => { e.stopPropagation(); addField(parentId, item.entity, item.label); }}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
