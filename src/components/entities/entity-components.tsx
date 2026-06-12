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
import { useRef, useState, useEffect } from "react";
import { AddFieldDropdown } from "@/src/components/canvas/AddFieldDropdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Layers, Repeat, Plus, FunctionSquare, X } from "lucide-react";
import { FieldHeader } from "@/src/components/ui/field-header";

const TextFieldEntity = createEntityComponent(textFieldEntity, (props) => (
  <div className="space-y-1.5">
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
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
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
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
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
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
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
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
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
    <Select disabled>
      <SelectTrigger className="bg-muted/50">
        <SelectValue placeholder={props.entity.attributes.placeholder ?? "Select..."} />
      </SelectTrigger>
      <SelectContent>
        {props.entity.attributes.options?.map((opt: { value: string; label: string }) => (
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
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
    <div className="flex min-h-9 flex-wrap gap-1 rounded-md border border-input bg-muted/50 px-3 py-2">
      {props.entity.attributes.options?.slice(0, 3).map((opt: { value: string; label: string }) => (
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
      <div className="flex-1 min-w-0">
        <FieldHeader
          entityId={props.entity.id}
          label={props.entity.attributes.label as string}
          required={props.entity.attributes.required as boolean}
            />
      </div>
    </div>
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground pl-6">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const DateFieldEntity = createEntityComponent(dateFieldEntity, (props) => (
  <div className="space-y-1.5">
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
    <Input type="date" disabled className="bg-muted/50" />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const DatetimeFieldEntity = createEntityComponent(datetimeFieldEntity, (props) => (
  <div className="space-y-1.5">
    <FieldHeader
      entityId={props.entity.id}
      label={props.entity.attributes.label as string}
      required={props.entity.attributes.required as boolean}
    />
    <Input type="datetime-local" disabled className="bg-muted/50" />
    {props.entity.attributes.helpText && (
      <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
    )}
  </div>
));

const FileFieldEntity = createEntityComponent(fileFieldEntity, (props) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <FieldHeader
        entityId={props.entity.id}
        label={props.entity.attributes.label as string}
        required={props.entity.attributes.required as boolean}
        />
      <div
        className="flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{fileName ?? "Click to upload"}</span>
        {fileName && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFileName(null); if (fileRef.current) fileRef.current.value = ""; }}
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
          if (file) setFileName(file.name);
        }}
      />
      {props.entity.attributes.helpText && (
        <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
      )}
    </div>
  );
});

const SignatureFieldEntity = createEntityComponent(signatureFieldEntity, (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

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
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="space-y-1.5">
      <FieldHeader
        entityId={props.entity.id}
        label={props.entity.attributes.label as string}
        required={props.entity.attributes.required as boolean}
        />
      <canvas
        ref={canvasRef}
        className="w-full h-24 rounded-md border border-dashed border-input bg-muted/30 touch-none cursor-crosshair"
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={stopDraw}
        onPointerLeave={stopDraw}
        style={{ touchAction: "none" }}
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Clear signature
      </button>
      {props.entity.attributes.helpText && (
        <p className="text-xs text-muted-foreground">{props.entity.attributes.helpText}</p>
      )}
    </div>
  );
});

const SectionEntityComponent = createEntityComponent(sectionEntity, (props) => {
  const { setNodeRef, isOver } = useDroppable({ id: `container-${props.entity.id}` });
  const hasChildren = props.children && props.children.length > 0;
  return (
    <div className="space-y-3 rounded-lg border-l-2 border-primary/30 bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-primary/70">
        <Layers className="h-4 w-4 shrink-0" />
        <FieldHeader
          entityId={props.entity.id}
          label={props.entity.attributes.label as string}
          required={false}
          hideRequired
          className="flex-1 min-w-0"
        />
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
      <div className="flex items-center gap-2 pl-4">
        <AddFieldDropdown
          parentId={props.entity.id}
          variant="ghost"
          size="sm"
          label="Add field"
        />
      </div>
    </div>
  );
});

const RepeatingEntityComponent = createEntityComponent(repeatingEntity, (props) => {
  const { setNodeRef, isOver } = useDroppable({ id: `container-${props.entity.id}` });
  const hasChildren = props.children && props.children.length > 0;
  const [rowCount, setRowCount] = useState(1);

  return (
    <div className="space-y-3 rounded-lg border-l-2 border-amber-400/40 bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-600/70">
        <Repeat className="h-4 w-4 shrink-0" />
        <FieldHeader
          entityId={props.entity.id}
          label={props.entity.attributes.label as string}
          required={false}
          hideRequired
          className="flex-1 min-w-0"
        />
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono shrink-0">
          {rowCount} row{rowCount !== 1 ? "s" : ""}
        </Badge>
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
      <div className="flex items-center gap-2 pl-4">
        <AddFieldDropdown
          parentId={props.entity.id}
          variant="ghost"
          size="sm"
          label="Add field"
        />
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setRowCount((c) => c + 1)}
        >
          <Plus className="h-3 w-3" /> Add item
        </button>
        {rowCount > 1 && (
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => setRowCount((c) => Math.max(1, c - 1))}
          >
            <X className="h-3 w-3" /> Remove last
          </button>
        )}
      </div>
    </div>
  );
});

const ComputedFieldEntity = createEntityComponent(computedFieldEntity, (props) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <FunctionSquare className="h-4 w-4 text-muted-foreground shrink-0" />
      <FieldHeader
        entityId={props.entity.id}
        label={props.entity.attributes.label as string}
        required={false}
        hideRequired
        className="flex-1 min-w-0"
      />
      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono shrink-0">auto</Badge>
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
