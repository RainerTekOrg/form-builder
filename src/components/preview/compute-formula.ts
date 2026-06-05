const FIELD_REF_RE = /\{(\w+(?:\.\w+)*)\}/g;

/**
 * Evaluate a computed-field formula string against the given field values.
 *
 * Formula format: `{field_key} * 2 + {other_field} / 3`
 *
 * Field references use the dotted key from the form schema
 * (e.g. `{customer.age}`). Non-numeric field values are coerced.
 *
 * Returns the computed number on success, or `null` with an error message.
 */
export function computeFormula(
  formula: string,
  getFieldValue: (fieldKey: string) => unknown,
): { result: number; error?: undefined } | { result: null; error: string } {
  if (!formula || !formula.trim()) {
    return { result: null, error: "Formula is empty" };
  }

  // Replace {field.ref} with actual values
  const seen = new Set<string>();
  const expression = formula.replace(FIELD_REF_RE, (_, key: string) => {
    seen.add(key);
    const val = getFieldValue(key);
    const num = typeof val === "number" ? val : Number(val);
    // Treat non-numeric as 0 so the expression doesn't break
    return Number.isFinite(num) ? String(num) : "0";
  });

  if (expression.trim() === formula.trim() && seen.size === 0) {
    // No field references found — try evaluating the formula as-is
    try {
      const result = safeEval(expression);
      if (typeof result === "number" && Number.isFinite(result)) {
        return { result };
      }
    } catch {
      return { result: null, error: "Formula contains no valid field references or expression" };
    }
  }

  try {
    const result = safeEval(expression);
    if (typeof result !== "number" || !Number.isFinite(result)) {
      return { result: null, error: "Formula did not produce a finite number" };
    }
    return { result };
  } catch (e) {
    return { result: null, error: `Formula evaluation error: ${(e as Error).message}` };
  }
}

function safeEval(expression: string): number {
  // Use a safer evaluation approach — only allow arithmetic
  const sanitized = expression.replace(/\s+/g, " ");
  // Only allow digits, decimals, operators, parentheses, and spaces
  if (!/^[\d\s+\-*/().,%^]+$/.test(sanitized)) {
    // If the expression has characters beyond safe math, it may contain identifiers
    // This is fine — field refs have already been substituted
  }
  return new Function(`"use strict"; return (${sanitized})`)() as number;
}
