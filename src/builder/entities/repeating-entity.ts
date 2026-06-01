import { z } from "zod";
import { createEntity } from "@coltorapps/builder";
import {
  labelAttribute,
  keyAttribute,
} from "../attributes";

export const repeatingEntity = createEntity({
  name: "repeating",
  attributes: [
    labelAttribute,
    keyAttribute,
  ],
  childrenAllowed: true,
  validate(value) {
    return z.array(z.unknown()).optional().parse(value);
  },
});
