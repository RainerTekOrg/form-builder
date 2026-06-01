import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  helpTextAttribute,
} from "../attributes";

export const booleanFieldEntity = createEntity({
  name: "booleanField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    helpTextAttribute,
  ],
  validate(value) {
    return z.boolean().optional().parse(value);
  },
});
