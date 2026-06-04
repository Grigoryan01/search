export function getCountryInputValueProps(
  value?: string,
  defaultValue?: string,
): { value: string } | { defaultValue: string } | Record<string, never> {
  if (value !== undefined) {
    return { value };
  }

  if (defaultValue !== undefined) {
    return { defaultValue };
  }

  return {};
}
