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
  fieldWidthAttribute,
} from "../attributes";

export const datetimeFieldEntity = createEntity({
  name: "datetimeField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    placeholderAttribute,
    helpTextAttribute,
    validationAttribute,
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.string().optional().parse(value);
  },
});
