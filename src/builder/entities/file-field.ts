import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  helpTextAttribute,
} from "../attributes";

export const fileFieldEntity = createEntity({
  name: "fileField",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    helpTextAttribute,
  ],
  validate(value) {
    return z.string().optional().parse(value);
  },
});
