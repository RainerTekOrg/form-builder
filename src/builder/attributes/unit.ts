import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const unitAttribute = createAttribute({
  name: "unit",
  validate(value) {
    return z.string().optional().parse(value);
  },
});
