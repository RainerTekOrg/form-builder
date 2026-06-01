import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  placeholderAttribute,
  helpTextAttribute,
  validationAttribute,
} from "../attributes";

export const textareaFieldEntity = createEntity({
  name: "textareaField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    placeholderAttribute,
    helpTextAttribute,
    validationAttribute,
  ],
  validate(value) {
    return z.string().optional().parse(value);
  },
});
