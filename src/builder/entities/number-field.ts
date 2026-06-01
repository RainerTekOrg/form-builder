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

export const numberFieldEntity = createEntity({
  name: "numberField",
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
    return z.number().optional().parse(value);
  },
});
