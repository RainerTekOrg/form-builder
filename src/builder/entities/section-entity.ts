import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
  requiredAttribute,
  conditionAttribute,
  fieldWidthAttribute,
} from "../attributes";

export const sectionEntity = createEntity({
  name: "section",
  attributes: [
    labelAttribute,
    keyAttribute,
    requiredAttribute,
    conditionAttribute,
    fieldWidthAttribute,
  ],
  childrenAllowed: true,
  validate(value) {
    return z.undefined().optional().parse(value);
  },
});
