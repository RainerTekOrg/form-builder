import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  conditionAttribute,
  placeholderAttribute,
  helpTextAttribute,
  validationAttribute,
  unitAttribute,
  fieldWidthAttribute,
  defaultValueAttribute,
} from "../attributes";

export const integerFieldEntity = createEntity({
  name: "integerField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    placeholderAttribute,
    helpTextAttribute,
    validationAttribute,
    unitAttribute,
    defaultValueAttribute,
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.number().int().optional().parse(value);
  },
});
