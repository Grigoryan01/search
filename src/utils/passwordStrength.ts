export interface PasswordStrengthChecks {
  hasNumber: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecial: boolean;
}

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';

export function getPasswordStrength(password: string): PasswordStrengthChecks {
  let hasNumber = false;
  let hasUppercase = false;
  let hasLowercase = false;
  let hasSpecial = false;

  for (const char of password) {
    if (char >= '0' && char <= '9') {
      hasNumber = true;
    } else if (char >= 'A' && char <= 'Z') {
      hasUppercase = true;
    } else if (char >= 'a' && char <= 'z') {
      hasLowercase = true;
    } else if (SPECIAL_CHARS.includes(char)) {
      hasSpecial = true;
    }
  }

  return { hasNumber, hasUppercase, hasLowercase, hasSpecial };
}
