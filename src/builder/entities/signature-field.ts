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

export const signatureFieldEntity = createEntity({
  name: "signatureField",
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
