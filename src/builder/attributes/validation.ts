import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const validationRuleSchema = z.object({
  type: z.enum(["min", "max", "minLength", "maxLength", "pattern", "format"]),
  value: z.union([z.number(), z.string()]),
});

export const validationAttribute = createAttribute({
  name: "validation",
  validate(value) {
    return z.array(validationRuleSchema).optional().parse(value);
  },
});
