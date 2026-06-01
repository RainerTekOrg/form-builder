import { z } from "zod";
import { createAttribute } from "@coltorapps/builder";

export const KEY_REGEX = /^[a-z][a-z0-9_]*$/;

export const keyAttribute = createAttribute({
  name: "key",
  validate(value) {
    return z.string().regex(KEY_REGEX).parse(value);
  },
});
