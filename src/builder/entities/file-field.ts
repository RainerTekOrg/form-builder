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

export const fileFieldEntity = createEntity({
  name: "fileField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    helpTextAttribute,
    fieldWidthAttribute,
  ],
  validate(value) {
    return z.string().optional().parse(value);
  },
});
