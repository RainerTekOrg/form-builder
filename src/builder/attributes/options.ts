import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const optionItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const optionsAttribute = createAttribute({
  name: "options",
  validate(value) {
    return z.array(optionItemSchema).parse(value);
  },
});
