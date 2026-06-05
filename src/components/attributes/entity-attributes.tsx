"use client";

import type { EntitiesAttributesComponents } from "@coltorapps/builder-react";
import { formBuilder } from "@/src/builder/form-builder";
import { KeyAttribute, LabelAttribute, RequiredAttribute, PlaceholderAttribute, HelpTextAttribute } from ".";
import { OptionsAttribute } from "./OptionsAttribute";
import { ValidationAttribute } from "./ValidationAttribute";
import { UnitAttribute } from "./UnitAttribute";
import { ConditionAttribute } from "./ConditionAttribute";
import { FormulaAttribute, FieldWidthAttribute, DefaultValueAttribute } from ".";
import { Separator } from "@/components/ui/separator";

function Section({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 px-4 py-3">{children}</div>;
}

function AttrDivider() {
  return <Separator className="my-3" />;
}

export const entityAttributesComponents: EntitiesAttributesComponents<typeof formBuilder> = {
  textField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <ValidationAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  textareaField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <ValidationAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  numberField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <UnitAttribute />
      <AttrDivider />
      <ValidationAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  integerField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <UnitAttribute />
      <AttrDivider />
      <ValidationAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  selectField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <OptionsAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  multiSelectField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <OptionsAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  booleanField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  dateField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <ValidationAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  datetimeField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <PlaceholderAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <ValidationAttribute />
      <AttrDivider />
      <DefaultValueAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  fileField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  signatureField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <RequiredAttribute />
      <HelpTextAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  section: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  repeating: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <ConditionAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
  computedField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <UnitAttribute />
      <FormulaAttribute />
      <AttrDivider />
      <FieldWidthAttribute />
    </Section>
  ),
};
