import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  placeholderAttribute,
  helpTextAttribute,
  validationAttribute,
  unitAttribute,
} from "../attributes";

export const integerFieldEntity = createEntity({
  name: "integerField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    placeholderAttribute,
    helpTextAttribute,
    validationAttribute,
    unitAttribute,
  ],
  validate(value) {
    return z.number().int().optional().parse(value);
  },
});
