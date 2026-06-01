import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  placeholderAttribute,
  helpTextAttribute,
  optionsAttribute,
} from "../attributes";

export const selectFieldEntity = createEntity({
  name: "selectField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    placeholderAttribute,
    helpTextAttribute,
    optionsAttribute,
  ],
  validate(value) {
    return z.string().optional().parse(value);
  },
});
