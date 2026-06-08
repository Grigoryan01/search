import { describe, expect, it } from 'vitest';

import { getPasswordStrength } from './passwordStrength';

describe('getPasswordStrength', () => {
  it('detects all strength requirements', () => {
    expect(getPasswordStrength('Aa1!')).toEqual({
      hasNumber: true,
      hasUppercase: true,
      hasLowercase: true,
      hasSpecial: true,
    });
  });

  it('returns false flags for an empty password', () => {
    expect(getPasswordStrength('')).toEqual({
      hasNumber: false,
      hasUppercase: false,
      hasLowercase: false,
      hasSpecial: false,
    });
  });
});
