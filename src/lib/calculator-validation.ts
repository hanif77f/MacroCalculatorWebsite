export function getCalculatorValidationMessage(
  fields: { label: string; valid: boolean }[],
) {
  const invalidFields = fields.filter((field) => !field.valid).map((field) => field.label);
  return invalidFields.length ? `Please enter or check: ${invalidFields.join(", ")}.` : "";
}
