import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin", "empty", "notEmpty"]),
  value: z.unknown(),
});

export const conditionAttribute = createAttribute({
  name: "condition",
  validate(value) {
    return conditionSchema.optional().parse(value);
  },
});
