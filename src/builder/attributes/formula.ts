import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const formulaAttribute = createAttribute({
  name: "formula",
  validate(value) {
    return z.string().min(1).parse(value);
  },
});
