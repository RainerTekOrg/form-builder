"use client";

import { useCallback, useState } from "react";
import type { BuilderStore } from "@coltorapps/builder";
import { formBuilder } from "@/src/builder/form-builder";
import { serialize } from "@/src/serializer/serialize";
import { deserialize } from "@/src/serializer/deserialize";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface SchemaEditorButtonProps {
  builderStore: BuilderStore<typeof formBuilder>;
}

/**
 * View / edit the form as raw JSON (schema + uiSchema). Round-trips through the
 * same serialize/deserialize the host uses, so applying is equivalent to loading
 * an edited form. Invalid JSON or schema is rejected inline (nothing is applied).
 */
export function SchemaEditorButton({ builderStore }: SchemaEditorButtonProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const openDialog = useCallback(() => {
    try {
      const payload = serialize(builderStore.getSchema());
      setText(JSON.stringify(payload, null, 2));
    } catch (e) {
      setText("");
      setError(e instanceof Error ? e.message : "Could not serialize the form");
    }
    setError(null);
    setCopied(false);
    setOpen(true);
  }, [builderStore]);

  const apply = useCallback(() => {
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    try {
      const native = deserialize(payload as Parameters<typeof deserialize>[0]);
      builderStore.setData({ schema: native, entitiesAttributesErrors: {}, schemaError: undefined });
      toast.success("Schema applied");
      setOpen(false);
    } catch (e) {
      setError(`Invalid schema: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [text, builderStore]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }, [text]);

  return (
    <>
      <Button type="button" variant="outline" size="xs" className="gap-1.5" onClick={openDialog}>
        <Code2 className="size-3.5" />
        JSON
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85dvh] flex-col gap-4 sm:max-w-[760px]">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="size-5 text-primary" />
              Form schema (JSON)
            </DialogTitle>
            <DialogDescription>
              View or edit the form definition directly. Applying replaces the current form — invalid
              JSON or schema is rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none rounded-md border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring"
            />
            {error && <p className="shrink-0 text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="shrink-0 sm:justify-between">
            <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={apply}>
                Apply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
