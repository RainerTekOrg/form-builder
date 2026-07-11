"use client";

import { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useFormValues, type SchemaEntityLite } from "./FormValueContext";
import { DateInput } from "./DateInput";

type Row = Record<string, unknown>;

interface ChildDef {
  id: string;
  type: string;
  /** LOCAL key (the repeating prefix stripped) — used as the row-object key. */
  localKey: string;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

function toChildDef(id: string, entity: SchemaEntityLite): ChildDef | null {
  const attrs = entity.attributes || {};
  const fullKey = (attrs.key as string) || id;
  const localKey = fullKey.includes(".") ? fullKey.split(".").pop()! : fullKey;
  if (!localKey) return null;
  return {
    id,
    type: entity.type,
    localKey,
    label: (attrs.label as string) || localKey,
    placeholder: attrs.placeholder as string | undefined,
    options: Array.isArray(attrs.options) ? (attrs.options as ChildDef["options"]) : undefined,
  };
}

/** One input for a child field inside a repeating row, by field type. */
function RowField({
  def,
  value,
  onChange,
}: {
  def: ChildDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `${def.id}-row`;
  const labelEl = (
    <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
      {def.label}
    </Label>
  );

  switch (def.type) {
    case "textareaField":
      return (
        <div className="space-y-1">
          {labelEl}
          <Textarea
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value || undefined)}
            placeholder={def.placeholder ?? ""}
            className="resize-none"
          />
        </div>
      );
    case "numberField":
    case "integerField":
      return (
        <div className="space-y-1">
          {labelEl}
          <Input
            id={id}
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const raw = e.target.value;
              if (!raw) return onChange(undefined);
              const n = Number(raw);
              onChange(Number.isNaN(n) ? undefined : def.type === "integerField" ? Math.floor(n) : n);
            }}
            placeholder={def.placeholder ?? ""}
          />
        </div>
      );
    case "selectField":
      return (
        <div className="space-y-1">
          {labelEl}
          <Select
            value={typeof value === "string" ? value : ""}
            onValueChange={(v) => onChange(v || undefined)}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder={def.placeholder ?? "Select…"} />
            </SelectTrigger>
            <SelectContent>
              {(def.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "booleanField":
      return (
        <div className="flex items-center gap-2 pt-5">
          <Checkbox
            id={id}
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          <Label htmlFor={id} className="text-xs font-medium">
            {def.label}
          </Label>
        </div>
      );
    case "dateField":
      return (
        <div className="space-y-1">
          {labelEl}
          <DateInput
            id={id}
            type="date"
            value={typeof value === "string" ? value : ""}
            onChange={(v) => onChange(v)}
          />
        </div>
      );
    case "datetimeField":
      return (
        <div className="space-y-1">
          {labelEl}
          <DateInput
            id={id}
            type="datetime-local"
            value={typeof value === "string" ? value : ""}
            onChange={(v) => onChange(v)}
          />
        </div>
      );
    default: // textField + any unhandled type fall back to a text input
      return (
        <div className="space-y-1">
          {labelEl}
          <Input
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value || undefined)}
            placeholder={def.placeholder ?? ""}
          />
        </div>
      );
  }
}

/**
 * Renders a repeating group as N editable rows + Add/Remove. The value is the
 * array of row objects (keyed by each child's LOCAL key), stored on the repeating
 * entity itself — so it serializes to `{ <repeatingKey>: [ {child:…}, … ] }` and
 * the report loop (`{{item.child}}`) + the detail view (arrays) line up.
 */
export function RepeatingRows({
  entityId,
  value,
  onChange,
}: {
  entityId: string;
  value: unknown;
  onChange: (rows: Row[]) => void;
}) {
  const { entities } = useFormValues();
  const self = entities[entityId];
  const childDefs: ChildDef[] = (self?.children ?? [])
    .map((cid) => (entities[cid] ? toChildDef(cid, entities[cid]) : null))
    .filter((d): d is ChildDef => d !== null);

  const rows: Row[] = Array.isArray(value) ? (value as Row[]) : [];

  const setRow = (index: number, key: string, v: unknown) => {
    const next = rows.map((r, i) => (i === index ? { ...r, [key]: v } : r));
    onChange(next);
  };
  const addRow = () => onChange([...rows, {}]);
  const removeRow = (index: number) => onChange(rows.filter((_, i) => i !== index));

  if (childDefs.length === 0) {
    return <p className="text-xs text-muted-foreground">This repeating group has no fields yet.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No entries yet. Add one below.</p>
      ) : (
        rows.map((row, i) => (
          <div key={i} className="rounded-md border border-border/70 bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Entry #{i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive"
                onClick={() => removeRow(i)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {childDefs.map((def) => (
                <RowField
                  key={def.id}
                  def={def}
                  value={row[def.localKey]}
                  onChange={(v) => setRow(i, def.localKey, v)}
                />
              ))}
            </div>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Add entry
      </Button>
    </div>
  );
}
