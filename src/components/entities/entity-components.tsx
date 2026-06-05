"use client";

import { createEntityComponent } from "@coltorapps/builder-react";
import { useDroppable } from "@dnd-kit/core";
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
import { Upload, PenLine, Layers, Repeat, Plus, FunctionSquare } from "lucide-react";

const TextFieldEntity = createEntityComponent(textFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input
      placeholder={props.entity.attributes.placeholder ?? ""}
      disabled
      className="bg-muted/50"
    />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const TextareaFieldEntity = createEntityComponent(textareaFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Textarea
      placeholder={props.entity.attributes.placeholder ?? ""}
      disabled
      className="bg-muted/50 resize-none"
    />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const NumberFieldEntity = createEntityComponent(numberFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        placeholder={props.entity.attributes.placeholder ?? "0"}
        disabled
        className="bg-muted/50"
      />
      {props.entity.attributes.unit && (
        <span className="text-sm text-muted-foreground shrink-0 min-w-[2ch]">
          {props.entity.attributes.unit}
        </span>
      )}
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const IntegerFieldEntity = createEntityComponent(integerFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        step={1}
        placeholder={props.entity.attributes.placeholder ?? "0"}
        disabled
        className="bg-muted/50"
      />
      {props.entity.attributes.unit && (
        <span className="text-sm text-muted-foreground shrink-0">{props.entity.attributes.unit}</span>
      )}
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const SelectFieldEntity = createEntityComponent(selectFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Select disabled>
      <SelectTrigger className="bg-muted/50">
        <SelectValue placeholder={props.entity.attributes.placeholder ?? "Select..."} />
      </SelectTrigger>
      <SelectContent>
        {props.entity.attributes.options?.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const MultiSelectFieldEntity = createEntityComponent(multiSelectFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex min-h-9 flex-wrap gap-1 rounded-md border border-input bg-muted/50 px-3 py-2">
      {props.entity.attributes.options?.slice(0, 3).map((opt) => (
        <Badge key={opt.value} variant="secondary" className="text-xs">{opt.label}</Badge>
      ))}
      {(props.entity.attributes.options?.length ?? 0) > 3 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{props.entity.attributes.options!.length - 3} more
        </Badge>
      )}
      {(!props.entity.attributes.options || props.entity.attributes.options.length === 0) && (
        <span className="text-sm text-muted-foreground">No options defined</span>
      )}
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const BooleanFieldEntity = createEntityComponent(booleanFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <Checkbox disabled id={`bool-${props.entity.id}`} />
      <Label htmlFor={`bool-${props.entity.id}`} className="text-sm font-medium">
        {props.entity.attributes.label}
        {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
      </Label>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground pl-6">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const DateFieldEntity = createEntityComponent(dateFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input type="date" disabled className="bg-muted/50" />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const DatetimeFieldEntity = createEntityComponent(datetimeFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <Input type="datetime-local" disabled className="bg-muted/50" />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const FileFieldEntity = createEntityComponent(fileFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
      <Upload className="h-4 w-4" />
      <span>Click or drag to upload</span>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const SignatureFieldEntity = createEntityComponent(signatureFieldEntity, (props) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {props.entity.attributes.label}
      {props.entity.attributes.required && <RequiredIndicator className="ml-0.5" />}
    </Label>
    <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-input bg-muted/30 text-sm text-muted-foreground">
      <PenLine className="h-4 w-4 mr-2" />
      <span>Signature area</span>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const SectionEntityComponent = createEntityComponent(sectionEntity, (props) => {
  const { setNodeRef, isOver } = useDroppable({ id: `container-${props.entity.id}` });
  const hasChildren = props.children && props.children.length > 0;
  return (
    <div className="space-y-3 rounded-lg border-l-2 border-primary/30 bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-primary/70">
        <Layers className="h-4 w-4" />
        <Label className="text-sm font-medium cursor-pointer">{props.entity.attributes.label}</Label>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[2.5rem] rounded-md transition-colors pl-4 border-l border-border/50 ${
          isOver ? "bg-primary/10 ring-1 ring-primary/30" : ""
        }`}
      >
        {hasChildren ? (
          <div className="space-y-2">{props.children}</div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            {isOver ? "Drop here" : "Drag fields into this section"}
          </p>
        )}
      </div>
    </div>
  );
});

const RepeatingEntityComponent = createEntityComponent(repeatingEntity, (props) => {
  const { setNodeRef, isOver } = useDroppable({ id: `container-${props.entity.id}` });
  const hasChildren = props.children && props.children.length > 0;
  return (
    <div className="space-y-3 rounded-lg border-l-2 border-amber-400/40 bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-600/70">
        <Repeat className="h-4 w-4" />
        <Label className="text-sm font-medium cursor-pointer">{props.entity.attributes.label}</Label>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[2.5rem] rounded-md transition-colors pl-4 ${
          isOver ? "bg-amber-400/10 ring-1 ring-amber-400/40" : ""
        }`}
      >
        {hasChildren ? (
          <div className="space-y-2">{props.children}</div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            {isOver ? "Drop here" : "Drag fields into this repeating group"}
          </p>
        )}
      </div>
      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pl-4" disabled>
        <Plus className="h-3 w-3" /> Add item
      </button>
    </div>
  );
});

const ComputedFieldEntity = createEntityComponent(computedFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <FunctionSquare className="h-4 w-4 text-muted-foreground" />
      <Label className="text-sm font-medium text-muted-foreground">{props.entity.attributes.label}</Label>
      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">auto</Badge>
    </div>
    <div className="flex items-center gap-1.5 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      <span className="italic">computed: {props.entity.attributes.formula}</span>
      {props.entity.attributes.unit && (
        <span className="text-xs text-muted-foreground">{props.entity.attributes.unit}</span>
      )}
    </div>
  </div>
));

export const entityComponents = {
  textField: TextFieldEntity,
  textareaField: TextareaFieldEntity,
  numberField: NumberFieldEntity,
  integerField: IntegerFieldEntity,
  selectField: SelectFieldEntity,
  multiSelectField: MultiSelectFieldEntity,
  booleanField: BooleanFieldEntity,
  dateField: DateFieldEntity,
  datetimeField: DatetimeFieldEntity,
  fileField: FileFieldEntity,
  signatureField: SignatureFieldEntity,
  section: SectionEntityComponent,
  repeating: RepeatingEntityComponent,
  computedField: ComputedFieldEntity,
} as const;
