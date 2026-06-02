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
  PenLine,
  Layers,
  Repeat,
  FunctionSquare,
} from "lucide-react";
import type { ChangeEvent } from "react";

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
        {props.entity.attributes.options?.map((opt) => (
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
      {props.entity.attributes.options?.map((opt) => {
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

const FileFieldInteractive = createEntityComponent(fileFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className={cn(
      "flex items-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground",
      props.entity.error ? "border-destructive" : "border-input",
    )}>
      <Upload className="h-4 w-4" />
      <span>{typeof props.entity.value === "string" ? props.entity.value : "Click or drag to upload"}</span>
    </div>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const SignatureFieldInteractive = createEntityComponent(signatureFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className={cn(
      "flex h-20 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground",
      props.entity.error ? "border-destructive" : "border-input",
    )}>
      <PenLine className="h-4 w-4 mr-2" />
      <span>Sign here</span>
    </div>
    <FieldError error={props.entity.error} />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const SectionInteractive = createEntityComponent(sectionEntity, (props) => (
  <div className="space-y-3 rounded-lg border-l-2 border-primary/30 bg-muted/20 p-3">
    <div className="flex items-center gap-2 text-sm font-medium text-primary/70">
      <Layers className="h-4 w-4" />
      <Label className="text-sm font-medium">{props.entity.attributes.label}</Label>
    </div>
    {props.children && props.children.length > 0 ? (
      <div className="space-y-3 pl-4 border-l border-border/50">{props.children}</div>
    ) : null}
  </div>
));

const RepeatingInteractive = createEntityComponent(repeatingEntity, (props) => (
  <div className="space-y-3 rounded-lg border-l-2 border-amber-400/40 bg-muted/20 p-3">
    <div className="flex items-center gap-2 text-sm font-medium text-amber-600/70">
      <Repeat className="h-4 w-4" />
      <Label className="text-sm font-medium">{props.entity.attributes.label}</Label>
    </div>
    {props.children && props.children.length > 0 ? (
      <div className="space-y-3 pl-4">{props.children}</div>
    ) : null}
  </div>
));

const ComputedFieldInteractive = createEntityComponent(computedFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <FunctionSquare className="h-4 w-4 text-muted-foreground" />
      <Label className="text-sm font-medium text-muted-foreground">{props.entity.attributes.label}</Label>
      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">auto</Badge>
    </div>
    <div className="flex items-center gap-1.5 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      <span className="italic">computed: {props.entity.attributes.formula ?? "—"}</span>
      {props.entity.attributes.unit && (
        <span className="text-xs text-muted-foreground">{props.entity.attributes.unit}</span>
      )}
    </div>
  </div>
));

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
