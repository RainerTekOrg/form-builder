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
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.number().int().optional().parse(value);
  },
});
