"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { validationAttribute } from "@/src/builder/attributes/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const ruleLabels: Record<string, string> = {
  min: "Minimum",
  max: "Maximum",
  minLength: "Min Length",
  maxLength: "Max Length",
  pattern: "Regex Pattern",
  format: "Format",
};

export const ValidationAttribute = createAttributeComponent(validationAttribute, (props) => {
  const rules = props.attribute.value ?? [];

  const addRule = () => {
    props.setValue([...rules, { type: "min" as const, value: 0 }]);
  };

  const removeRule = (index: number) => {
    props.setValue(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: "type" | "value", val: string | number) => {
    const next = rules.map((rule, i) =>
      i === index ? { ...rule, [field]: val } : rule,
    );
    props.setValue(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Validation</Label>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addRule}>
          <Plus className="h-3 w-3" />
          Add rule
        </Button>
      </div>
      <div className="space-y-1.5">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-center gap-1">
            <Select
              value={rule.type}
              onValueChange={(val) => updateRule(i, "type", val)}
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ruleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={typeof rule.value === "number" ? rule.value : rule.value ?? ""}
              onChange={(e) =>
                updateRule(
                  i,
                  "value",
                  rule.type === "pattern" || rule.type === "format"
                    ? e.target.value
                    : Number(e.target.value),
                )
              }
              placeholder="Value"
              className="h-8 flex-1 text-xs"
              type={rule.type === "min" || rule.type === "max" || rule.type === "minLength" || rule.type === "maxLength" ? "number" : "text"}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => removeRule(i)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
        {rules.length === 0 && (
          <p className="text-xs text-muted-foreground">No validation rules.</p>
        )}
      </div>
    </div>
  );
});
