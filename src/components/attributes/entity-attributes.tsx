"use client";

import type { EntitiesAttributesComponents } from "@coltorapps/builder-react";
import { formBuilder } from "@/src/builder/form-builder";
import { KeyAttribute, LabelAttribute, RequiredAttribute, PlaceholderAttribute, HelpTextAttribute } from ".";
import { OptionsAttribute } from "./OptionsAttribute";
import { ValidationAttribute } from "./ValidationAttribute";
import { UnitAttribute } from "./UnitAttribute";
import { ConditionAttribute } from "./ConditionAttribute";
import { FormulaAttribute } from "./FormulaAttribute";
import { Separator } from "@/components/ui/separator";

function Section({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
      <ConditionAttribute />
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
    </Section>
  ),
  section: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <ConditionAttribute />
    </Section>
  ),
  repeating: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <ConditionAttribute />
    </Section>
  ),
  computedField: () => (
    <Section>
      <KeyAttribute />
      <LabelAttribute />
      <AttrDivider />
      <UnitAttribute />
      <FormulaAttribute />
    </Section>
  ),
};
