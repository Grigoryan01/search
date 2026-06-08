import { getPasswordStrength } from '../../utils/passwordStrength';
import './PasswordStrength.css';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = getPasswordStrength(password);

  const items = [
    { key: 'number', label: '1 number', met: checks.hasNumber },
    { key: 'uppercase', label: '1 uppercase', met: checks.hasUppercase },
    { key: 'lowercase', label: '1 lowercase', met: checks.hasLowercase },
    { key: 'special', label: '1 special character', met: checks.hasSpecial },
  ] as const;

  return (
    <ul className="password-strength" aria-label="Password strength requirements">
      {items.map((item) => (
        <li key={item.key} className={item.met ? 'met' : ''}>
          {item.met ? '✓' : '○'} {item.label}
        </li>
      ))}
    </ul>
  );
}
