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

export const numberFieldEntity = createEntity({
  name: "numberField",
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
    return z.number().optional().parse(value);
  },
});
