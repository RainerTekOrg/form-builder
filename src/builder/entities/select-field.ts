import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  conditionAttribute,
  placeholderAttribute,
  helpTextAttribute,
  optionsAttribute,
  fieldWidthAttribute,
} from "../attributes";

export const selectFieldEntity = createEntity({
  name: "selectField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    placeholderAttribute,
    helpTextAttribute,
    optionsAttribute,
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.string().optional().parse(value);
  },
});
