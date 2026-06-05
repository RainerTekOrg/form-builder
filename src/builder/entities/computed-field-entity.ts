import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  unitAttribute,
  formulaAttribute,
  fieldWidthAttribute,
} from "../attributes";

export const computedFieldEntity = createEntity({
  name: "computedField",
  attributes: [
    labelAttribute,
    keyAttribute,
    unitAttribute,
    formulaAttribute,
    fieldWidthAttribute,
  ],
  shouldBeProcessed(context) {
    return false;
  },
  validate(value) {
    return z.string().optional().parse(value);
  },
});
