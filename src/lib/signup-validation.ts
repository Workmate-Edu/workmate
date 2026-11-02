type FieldStateReader = (field: string) => { error?: { message?: unknown } };

export function firstSignupErrorMessage(
  getFieldState: FieldStateReader,
  fields: readonly string[],
  fallback: string
) {
  for (const field of fields) {
    const message = getFieldState(field).error?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
