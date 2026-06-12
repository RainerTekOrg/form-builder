"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { textFieldEntity } from "@/src/builder/entities/text-field";
import { textareaFieldEntity } from "@/src/builder/entities/textarea-field";
import { numberFieldEntity } from "@/src/builder/entities/number-field";
import { integerFieldEntity } from "@/src/builder/entities/integer-field";
import { selectFieldEntity } from "@/src/builder/entities/select-field";
import { multiSelectFieldEntity } from "@/src/builder/entities/multiselect-field";
import { booleanFieldEntity } from "@/src/builder/entities/boolean-field";
import { dateFieldEntity } from "@/src/builder/entities/date-field";
import { datetimeFieldEntity } from "@/src/builder/entities/datetime-field";
import { fileFieldEntity } from "@/src/builder/entities/file-field";
import { signatureFieldEntity } from "@/src/builder/entities/signature-field";
import { sectionEntity } from "@/src/builder/entities/section-entity";
import { repeatingEntity } from "@/src/builder/entities/repeating-entity";
import { computedFieldEntity } from "@/src/builder/entities/computed-field-entity";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RequiredIndicator } from "@/src/components/ui/required-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Upload,
  Layers,
  Repeat,
  FunctionSquare,
  X,
  RefreshCw,
} from "lucide-react";
import { useRef, useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useFormValues } from "./FormValueContext";
import { computeFormula } from "./compute-formula";

function FieldError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p className="text-xs text-destructive mt-1" role="alert">
      {error instanceof Error ? error.message : String(error)}
    </p>
  );
}

const TextFieldInteractive = createEntityComponent(textFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input
      id={props.entity.id}
      value={typeof props.entity.value === "string" ? props.entity.value : ""}
      onChange={(e: ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value || undefined)}
      onBlur={() => props.validateValue()}
      placeholder={props.entity.attributes.placeholder ?? ""}
      className={cn(props.entity.error ? "border-destructive" : undefined)}
      aria-invalid={!!props.entity.error}
    />
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const TextareaFieldInteractive = createEntityComponent(textareaFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Textarea
      id={props.entity.id}
      value={typeof props.entity.value === "string" ? props.entity.value : ""}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => props.setValue(e.target.value || undefined)}
      onBlur={() => props.validateValue()}
      placeholder={props.entity.attributes.placeholder ?? ""}
      className={cn("resize-none", props.entity.error ? "border-destructive" : undefined)}
      aria-invalid={!!props.entity.error}
    />
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const NumberFieldInteractive = createEntityComponent(numberFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-1.5">
      <Input
        id={props.entity.id}
        type="number"
        value={typeof props.entity.value === "number" ? props.entity.value : ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value ? Number(e.target.value) : undefined)}
        onBlur={() => props.validateValue()}
        placeholder={props.entity.attributes.placeholder ?? "0"}
        className={cn(props.entity.error ? "border-destructive" : undefined)}
        aria-invalid={!!props.entity.error}
      />
      {props.entity.attributes.unit && (
        <span className="text-sm text-muted-foreground shrink-0 min-w-[2ch]">{props.entity.attributes.unit}</span>
      )}
    </div>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const IntegerFieldInteractive = createEntityComponent(integerFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-1.5">
      <Input
        id={props.entity.id}
        type="number"
        step={1}
        value={typeof props.entity.value === "number" ? props.entity.value : ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value ? Math.floor(Number(e.target.value)) : undefined)}
        onBlur={() => props.validateValue()}
        placeholder={props.entity.attributes.placeholder ?? "0"}
        className={cn(props.entity.error ? "border-destructive" : undefined)}
        aria-invalid={!!props.entity.error}
      />
      {props.entity.attributes.unit && (
        <span className="text-sm text-muted-foreground shrink-0">{props.entity.attributes.unit}</span>
      )}
    </div>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const SelectFieldInteractive = createEntityComponent(selectFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Select
      value={typeof props.entity.value === "string" ? props.entity.value : undefined}
      onValueChange={(val) => { props.setValue(val); props.validateValue(); }}
    >
      <SelectTrigger
        id={props.entity.id}
        className={cn(props.entity.error ? "border-destructive" : undefined)}
      >
        <SelectValue placeholder={props.entity.attributes.placeholder ?? "Select..."} />
      </SelectTrigger>
      <SelectContent>
        {props.entity.attributes.options?.map((opt: { value: string; label: string }) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const MultiSelectFieldInteractive = createEntityComponent(multiSelectFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className={cn(
      "flex min-h-9 flex-wrap gap-1 rounded-md border px-3 py-2",
      props.entity.error ? "border-destructive" : "border-input",
    )}>
      {props.entity.attributes.options?.map((opt: { value: string; label: string }) => {
        const selected = Array.isArray(props.entity.value) && props.entity.value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              const current = Array.isArray(props.entity.value) ? [...props.entity.value] : [];
              const next = selected
                ? current.filter((v) => v !== opt.value)
                : [...current, opt.value];
              props.setValue(next.length > 0 ? next : undefined);
            }}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {opt.label}
          </button>
        );
      })}
      {(!props.entity.attributes.options || props.entity.attributes.options.length === 0) && (
        <span className="text-sm text-muted-foreground">No options available</span>
      )}
    </div>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const BooleanFieldInteractive = createEntityComponent(booleanFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <Checkbox
        id={props.entity.id}
        checked={props.entity.value === true}
        onCheckedChange={(checked) => { props.setValue(checked === true); props.validateValue(); }}
        aria-invalid={!!props.entity.error}
      />
      <Label htmlFor={props.entity.id} className="text-sm font-medium cursor-pointer">
        {props.entity.attributes.label}
        {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
      </Label>
    </div>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground pl-6">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const DateFieldInteractive = createEntityComponent(dateFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input
      id={props.entity.id}
      type="date"
      value={typeof props.entity.value === "string" ? props.entity.value : ""}
      onChange={(e: ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value || undefined)}
      onBlur={() => props.validateValue()}
      className={cn(props.entity.error ? "border-destructive" : undefined)}
      aria-invalid={!!props.entity.error}
    />
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const DatetimeFieldInteractive = createEntityComponent(datetimeFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium" htmlFor={props.entity.id}>
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input
      id={props.entity.id}
      type="datetime-local"
      value={typeof props.entity.value === "string" ? props.entity.value : ""}
      onChange={(e: ChangeEvent<HTMLInputElement>) => props.setValue(e.target.value || undefined)}
      onBlur={() => props.validateValue()}
      className={cn(props.entity.error ? "border-destructive" : undefined)}
      aria-invalid={!!props.entity.error}
    />
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const FileFieldInteractive = createEntityComponent(fileFieldEntity, (props) => {
  const [fileName, setFileName] = useState<string | null>(
    typeof props.entity.value === "string" ? props.entity.value : null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {props.entity.attributes.label}
        {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
      </Label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors",
          props.entity.error ? "border-destructive" : "border-input",
        )}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{fileName ?? "Click to upload"}</span>
        {fileName && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFileName(null); props.setValue(undefined); if (fileRef.current) fileRef.current.value = ""; }}
            className="shrink-0 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFileName(file.name);
            props.setValue(file.name);
          }
        }}
      />
      <FieldError error={props.entity.error} />
      {props.entity.attributes.helpText && (
        <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
      )}
    </div>
  );
});

const SignatureFieldInteractive = createEntityComponent(signatureFieldEntity, (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) canvas.width = rect.width;
    if (rect.height > 0) canvas.height = rect.height;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0) canvas.width = width;
        if (height > 0) canvas.height = height;
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    hasDrawn.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    if (canvasRef.current && hasDrawn.current) {
      props.setValue(canvasRef.current.toDataURL());
    }
    props.validateValue();
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    hasDrawn.current = false;
    props.setValue(undefined);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {props.entity.attributes.label}
        {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
      </Label>
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full h-24 rounded-md border border-dashed touch-none cursor-crosshair bg-card",
          props.entity.error ? "border-destructive" : "border-input",
        )}
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={stopDraw}
        onPointerLeave={stopDraw}
        style={{ touchAction: "none" }}
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearCanvas}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Clear signature
        </button>
      </div>
      <FieldError error={props.entity.error} />
      {props.entity.attributes.helpText && (
        <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
      )}
    </div>
  );
});

const SectionInteractive = createEntityComponent(sectionEntity, (props) => (
  <div className="p-4 md:p-5 rounded-lg border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.02]">
    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border/50">
      <Layers className="h-4 w-4 text-primary/60 shrink-0" />
      <span className="text-sm font-semibold text-foreground">
        {props.entity.attributes.label}
      </span>
    </div>
    {props.children && props.children.length > 0 ? (
      <div className="space-y-4">{props.children}</div>
    ) : null}
  </div>
));

const RepeatingInteractive = createEntityComponent(repeatingEntity, (props) => (
  <div className="p-4 md:p-5 rounded-lg border border-amber-200/50 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-900/10">
    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-amber-200/50 dark:border-amber-800/30">
      <Repeat className="h-4 w-4 text-amber-600/60 shrink-0" />
      <span className="text-sm font-semibold text-foreground">
        {props.entity.attributes.label}
      </span>
    </div>
    {props.children && props.children.length > 0 ? (
      <div className="space-y-4">{props.children}</div>
    ) : null}
  </div>
));

const ComputedFieldInteractive = createEntityComponent(computedFieldEntity, (props) => {
  const { getFieldValue } = useFormValues();
  const formula = props.entity.attributes.formula ?? "";

  const computed = useMemo(() => {
    if (!formula) return null;
    return computeFormula(formula as string, getFieldValue);
  }, [formula, getFieldValue]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <FunctionSquare className="h-4 w-4 text-primary/60" />
        <span className="text-sm font-semibold">{props.entity.attributes.label}</span>
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
          {props.entity.attributes.unit ? `${formula} ${props.entity.attributes.unit}` : formula}
        </Badge>
      </div>
      <div className={cn(
        "flex items-center gap-2 rounded-md border px-4 py-3",
        computed && computed.error
          ? "border-destructive/50 bg-destructive/5"
          : "border-primary/20 bg-primary/5",
      )}>
        {computed && computed.error ? (
          <>
            <RefreshCw className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-sm text-destructive">{computed.error}</span>
          </>
        ) : computed && computed.result !== null ? (
          <>
            <FunctionSquare className="h-5 w-5 text-primary/40 shrink-0" />
            <span className="text-lg font-semibold tabular-nums">
              {computed.result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
            {props.entity.attributes.unit && (
              <span className="text-xs text-muted-foreground">{props.entity.attributes.unit}</span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Waiting for field values…
          </span>
        )}
      </div>
    </div>
  );
});

export const interactiveEntityComponents = {
  textField: TextFieldInteractive,
  textareaField: TextareaFieldInteractive,
  numberField: NumberFieldInteractive,
  integerField: IntegerFieldInteractive,
  selectField: SelectFieldInteractive,
  multiSelectField: MultiSelectFieldInteractive,
  booleanField: BooleanFieldInteractive,
  dateField: DateFieldInteractive,
  datetimeField: DatetimeFieldInteractive,
  fileField: FileFieldInteractive,
  signatureField: SignatureFieldInteractive,
  section: SectionInteractive,
  repeating: RepeatingInteractive,
  computedField: ComputedFieldInteractive,
} as const;
