import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  conditionAttribute,
  helpTextAttribute,
  fieldWidthAttribute,
} from "../attributes";

export const booleanFieldEntity = createEntity({
  name: "booleanField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    helpTextAttribute,
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.boolean().optional().parse(value);
  },
});
