import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  conditionAttribute,
  helpTextAttribute,
  fieldWidthAttribute,
  defaultValueAttribute,
} from "../attributes";

export const booleanFieldEntity = createEntity({
  name: "booleanField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    helpTextAttribute,
    defaultValueAttribute,
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.boolean().optional().parse(value);
  },
});
