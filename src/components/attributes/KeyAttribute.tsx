"use client";

import { createAttributeComponent } from "@coltorapps/builder-react";
import { keyAttribute } from "@/src/builder/attributes/key";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const KeyAttribute = createAttributeComponent(keyAttribute, (props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(props.attribute.value ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">Key (read-only)</Label>
      <div className="flex items-center gap-1">
        <Input
          value={props.attribute.value ?? ""}
          disabled
          className="bg-muted/50 text-xs font-mono h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleCopy}
          title="Copy key"
        >
          <Copy className={`h-3.5 w-3.5 ${copied ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
      </div>
    </div>
  );
});
