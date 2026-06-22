"use client";

import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Upload, FileText, Loader2, Repeat, Layers } from "lucide-react";
import { toast } from "sonner";
import type { ExtractedField, ExtractResult } from "@/src/lib/pdf-extract/types";

type Status = "idle" | "extracting" | "preview";

interface PdfImportButtonProps {
  /** Insert the chosen fields into the builder; returns how many were added. */
  onImport: (fields: ExtractedField[]) => number;
}

const subtreeKeys = (f: ExtractedField): string[] => [
  f.key,
  ...(f.children ? f.children.flatMap(subtreeKeys) : []),
];
const collectKeys = (fields: ExtractedField[]): string[] => fields.flatMap(subtreeKeys);
const countSelected = (fields: ExtractedField[], inc: Set<string>): number =>
  fields.reduce(
    (n, f) => n + (inc.has(f.key) ? 1 : 0) + (f.children ? countSelected(f.children, inc) : 0),
    0,
  );
const filterTree = (fields: ExtractedField[], inc: Set<string>): ExtractedField[] =>
  fields
    .filter((f) => inc.has(f.key))
    .map((f) => (f.children ? { ...f, children: filterTree(f.children, inc) } : f));

export function PdfImportButton({ onImport }: PdfImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [included, setIncluded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setIncluded(new Set());
    setError(null);
    setDragging(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const pickFile = useCallback((f: File | null) => {
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please choose a PDF file.");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError("PDF exceeds 15 MB.");
      return;
    }
    setError(null);
    setFile(f);
    setResult(null);
    setStatus("idle");
  }, []);

  const extract = useCallback(async () => {
    if (!file) return;
    setStatus("extracting");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Provider is decided server-side by PDF_EXTRACT_PROVIDER (env).
      const res = await fetch("/api/extract-fields", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Extraction failed (${res.status})`);
      }
      const r = data as ExtractResult;
      if (!r.fields?.length) {
        setError("No form fields were detected in this PDF.");
        setStatus("idle");
        return;
      }
      setResult(r);
      setIncluded(new Set(collectKeys(r.fields)));
      setStatus("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
      setStatus("idle");
    }
  }, [file]);

  // Toggle a field and its whole subtree together.
  const toggle = useCallback((f: ExtractedField) => {
    setIncluded((prev) => {
      const keys = subtreeKeys(f);
      const next = new Set(prev);
      const allOn = keys.every((k) => next.has(k));
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  }, []);

  const insert = useCallback(() => {
    if (!result) return;
    const chosen = filterTree(result.fields, included);
    if (!chosen.length) {
      toast.info("Select at least one field");
      return;
    }
    const n = onImport(chosen);
    toast.success(`Imported ${n} field${n === 1 ? "" : "s"} from PDF`);
    close();
  }, [result, included, onImport, close]);

  const total = result ? collectKeys(result.fields).length : 0;
  const selectedCount = result ? countSelected(result.fields, included) : 0;

  const renderRows = (fields: ExtractedField[], depth: number): React.ReactNode =>
    fields.map((f) => {
      const isContainer = f.type === "section" || f.type === "repeating";
      const Icon = f.type === "repeating" ? Repeat : Layers;
      return (
        <li key={f.key} className="border-b last:border-b-0">
          <div
            className="flex items-start gap-3 p-3"
            style={{ paddingLeft: 12 + depth * 20 }}
          >
            <Checkbox
              checked={included.has(f.key)}
              onCheckedChange={() => toggle(f)}
              className="mt-0.5"
            />
            <button type="button" className="flex-1 text-left" onClick={() => toggle(f)}>
              <div className="flex items-center gap-1.5">
                {isContainer && <Icon className="size-3.5 text-muted-foreground" />}
                <span className="text-sm font-medium">{f.label}</span>
                {f.required && <span className="text-xs text-destructive">*</span>}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {f.type}
                </Badge>
                {f.children?.length ? (
                  <span className="text-[11px] text-muted-foreground">
                    {f.children.length} nested field{f.children.length === 1 ? "" : "s"}
                  </span>
                ) : null}
                {f.options?.length ? (
                  <span className="text-[11px] text-muted-foreground">
                    {f.options.length} option{f.options.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
            </button>
          </div>
          {f.children?.length ? <ul>{renderRows(f.children, depth + 1)}</ul> : null}
        </li>
      );
    });

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 z-40 gap-2 rounded-full shadow-lg"
        data-slot="pdf-import-fab"
      >
        <Sparkles className="size-4" />
        Import from PDF
      </Button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        {/* Bounded to the (iframe) viewport: header + footer pinned, list scrolls. */}
        <DialogContent className="flex max-h-[85dvh] flex-col gap-4 sm:max-w-[560px]">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Import fields from PDF
            </DialogTitle>
            <DialogDescription>
              Upload an existing form or report — AI detects the fields and adds them to your
              form. You can edit or remove anything afterward.
            </DialogDescription>
          </DialogHeader>

          {status !== "preview" ? (
            <div className="shrink-0 space-y-3">
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors outline-none focus-visible:border-ring",
                  dragging ? "border-primary bg-primary/5" : "border-input hover:border-primary/50",
                )}
              >
                {file ? (
                  <>
                    <FileText className="size-7 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)} MB · click to replace
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="size-7 text-muted-foreground" />
                    <span className="text-sm font-medium">Drop a PDF here or click to browse</span>
                    <span className="text-xs text-muted-foreground">Max 15 MB</span>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex shrink-0 items-center justify-between text-xs text-muted-foreground">
                <span>
                  {selectedCount} of {total} field{total === 1 ? "" : "s"} selected
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setIncluded(new Set(collectKeys(result!.fields)))}
                  >
                    Select all
                  </button>
                  <button type="button" className="underline" onClick={() => setIncluded(new Set())}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto rounded-md border">
                <ul>{result ? renderRows(result.fields, 0) : null}</ul>
              </div>
            </div>
          )}

          <DialogFooter className="shrink-0">
            {status === "preview" ? (
              <>
                <Button variant="outline" size="sm" onClick={reset}>
                  Back
                </Button>
                <Button size="sm" onClick={insert} disabled={selectedCount === 0}>
                  Insert {selectedCount} field{selectedCount === 1 ? "" : "s"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={close}>
                  Cancel
                </Button>
                <Button size="sm" onClick={extract} disabled={!file || status === "extracting"}>
                  {status === "extracting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Extracting…
                    </>
                  ) : (
                    "Extract fields"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
