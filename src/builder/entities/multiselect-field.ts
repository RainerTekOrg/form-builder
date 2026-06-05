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

export const multiSelectFieldEntity = createEntity({
  name: "multiSelectField",
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
    return z.array(z.string()).optional().parse(value);
  },
});
