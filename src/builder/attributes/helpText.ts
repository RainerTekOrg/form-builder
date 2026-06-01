import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const helpTextAttribute = createAttribute({
  name: "helpText",
  validate(value) {
    return z.string().optional().parse(value);
  },
});
