"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { optionsAttribute, optionItemSchema } from "@/src/builder/attributes/options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";

export const OptionsAttribute = createAttributeComponent(optionsAttribute, (props) => {
  const options = props.attribute.value ?? [];

  const addOption = () => {
    props.setValue([...options, { value: "", label: "" }]);
  };

  const removeOption = (index: number) => {
    const next = options.filter((_, i) => i !== index);
    props.setValue(next);
  };

  const updateOption = (index: number, field: "value" | "label", val: string) => {
    const next = options.map((opt, i) =>
      i === index ? { ...opt, [field]: val } : opt,
    );
    props.setValue(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Options</Label>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addOption}>
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-1">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              value={opt.value}
              onChange={(e) => updateOption(i, "value", e.target.value)}
              placeholder="Value"
              className="h-8 w-[100px] text-xs font-mono"
            />
            <Input
              value={opt.label}
              onChange={(e) => updateOption(i, "label", e.target.value)}
              placeholder="Label"
              className="h-8 flex-1 text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => removeOption(i)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-muted-foreground">No options defined. Click Add to create one.</p>
        )}
      </div>
    </div>
  );
});
