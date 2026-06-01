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

export const multiSelectFieldEntity = createEntity({
  name: "multiSelectField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    placeholderAttribute,
    helpTextAttribute,
    optionsAttribute,
  ],
  validate(value) {
    return z.array(z.string()).optional().parse(value);
  },
});
