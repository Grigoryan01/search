import { describe, expect, it } from 'vitest';

import { formSchema, isNameValid } from './formSchema';

const validPayload = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com',
  gender: 'Female',
  acceptTerms: true,
  password: 'Aa1!pass',
  confirmPassword: 'Aa1!pass',
  country: 'Canada',
  imageBase64: 'data:image/png;base64,abc',
};

describe('formSchema', () => {
  it('accepts valid form data', () => {
    expect(formSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects invalid names, ages, and countries', () => {
    expect(formSchema.safeParse({ ...validPayload, name: 'alice' }).success).toBe(false);
    expect(formSchema.safeParse({ ...validPayload, age: -1 }).success).toBe(false);
    expect(formSchema.safeParse({ ...validPayload, country: 'Atlantis' }).success).toBe(false);
  });

  it('requires matching passwords', () => {
    const result = formSchema.safeParse({
      ...validPayload,
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });
});

describe('isNameValid', () => {
  it('requires an uppercase first letter', () => {
    expect(isNameValid('John')).toBe(true);
    expect(isNameValid('john')).toBe(false);
  });
});
