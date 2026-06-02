"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { conditionAttribute } from "@/src/builder/attributes/condition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const ConditionAttribute = createAttributeComponent(conditionAttribute, (props) => {
  const condition = props.attribute.value;
  const isEnabled = condition !== undefined;

  const operators = [
    { value: "eq", label: "=" },
    { value: "neq", label: "≠" },
    { value: "gt", label: ">" },
    { value: "gte", label: "≥" },
    { value: "lt", label: "<" },
    { value: "lte", label: "≤" },
    { value: "in", label: "in" },
    { value: "nin", label: "not in" },
    { value: "empty", label: "is empty" },
    { value: "notEmpty", label: "is not empty" },
  ];

  const toggleEnabled = (enabled: boolean) => {
    if (enabled) {
      props.setValue({ field: "", operator: "eq", value: "" });
    } else {
      props.setValue(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Conditional visibility</Label>
        <Switch checked={isEnabled} onCheckedChange={toggleEnabled} />
      </div>
      {isEnabled && condition && (
        <div className="space-y-1.5">
          <Input
            value={condition.field}
            onChange={(e) => props.setValue({ ...condition, field: e.target.value })}
            placeholder="Field key"
            className="h-8 text-xs font-mono"
          />
          <div className="flex items-center gap-1">
            <Select
              value={condition.operator}
              onValueChange={(val) =>
                props.setValue({ ...condition, operator: val as typeof condition.operator })
              }
            >
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value} className="text-xs">
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {condition.operator !== "empty" && condition.operator !== "notEmpty" && (
              <Input
                value={String(condition.value ?? "")}
                onChange={(e) => props.setValue({ ...condition, value: e.target.value })}
                placeholder="Value"
                className="h-8 flex-1 text-xs"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});
