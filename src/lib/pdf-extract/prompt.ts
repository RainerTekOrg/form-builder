/** Instructions shared by every provider for PDF → form-field extraction. */

export const EXTRACTION_SYSTEM = [
  'You convert an existing paper/PDF form or lab report into a structured DIGITAL form definition.',
  'Your job is to identify every piece of information a PERSON would fill in or select, and describe it as a form field.',
  '',
  'Rules:',
  '- Output ONLY fillable inputs. Ignore static text, logos, page numbers, instructions, legal boilerplate, and pre-printed report values that are not user inputs.',
  '- Choose the most specific field "type": text, textarea (long/multi-line), number, integer, select (one choice), multiselect (many choices), boolean (yes/no, checkbox), date, datetime.',
  '- For a checkbox group or a list of options, use select or multiselect and fill "options" with {value,label} pairs.',
  '- For a repeating table where each row is the same set of fields (e.g. a sample list / media list), emit ONE field of type "repeating" whose label names the table, and put its per-row columns inside its "children" array. Do NOT also list those columns at the top level.',
  '- For a clearly grouped block of related fields, emit a field of type "section" and put the grouped fields inside its "children" array.',
  '- Only "section" and "repeating" fields may have "children"; normal fields must not.',
  '- "key" must be snake_case (lowercase letters, digits, underscores; starts with a letter), unique, and derived from the label.',
  '- Mark "required": true only when the document clearly indicates the field is mandatory (asterisk, "required", etc.).',
  '- Preserve the document\'s field order.',
].join('\n');

export const EXTRACTION_USER =
  'Extract the fillable form fields from this document as structured data. ' +
  'Return a concise, de-duplicated list — do not invent fields that are not present.';
