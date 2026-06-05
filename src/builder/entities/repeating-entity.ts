import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  conditionAttribute,
  fieldWidthAttribute,
} from "../attributes";

export const repeatingEntity = createEntity({
  name: "repeating",
  attributes: [
    labelAttribute,
    keyAttribute,
    conditionAttribute,
    fieldWidthAttribute,
  ],
  childrenAllowed: true,
  validate(value) {
    return z.array(z.unknown()).optional().parse(value);
  },
});
