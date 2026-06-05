import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const defaultValueAttribute = createAttribute({
  name: "defaultValue",
  validate(value) {
    return z.unknown().optional().parse(value);
  },
});
