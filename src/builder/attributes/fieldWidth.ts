import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const fieldWidthAttribute = createAttribute({
  name: "fieldWidth",
  validate(value) {
    return z.enum(["full", "half", "third", "two-thirds"]).optional().parse(value);
  },
});
