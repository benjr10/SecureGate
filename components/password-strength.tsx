'use client';

import { usePasswordStrength } from '@/lib/use-password-strength';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  const { criteria, criteriaMetCount, strengthLabel, strengthClass } = usePasswordStrength(password);

  if (password.length === 0) return null;

  return (
    <div className="strength-indicator">
      <div className="strength-bar-container">
        <div className={`strength-bar ${criteriaMetCount >= 1 ? strengthClass : ''}`}></div>
        <div className={`strength-bar ${criteriaMetCount >= 3 ? strengthClass : ''}`}></div>
        <div className={`strength-bar ${criteriaMetCount >= 4 ? strengthClass : ''}`}></div>
        <div className={`strength-bar ${criteriaMetCount >= 5 ? strengthClass : ''}`}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="strength-text">Password Strength: <strong>{strengthLabel}</strong></span>
      </div>

      <ul className="password-criteria-list">
        <li className={`criteria-item ${criteria.length ? 'met' : ''}`}>
          {criteria.length ? '✔' : '○'} Min 8 characters
        </li>
        <li className={`criteria-item ${criteria.uppercase ? 'met' : ''}`}>
          {criteria.uppercase ? '✔' : '○'} Uppercase letter
        </li>
        <li className={`criteria-item ${criteria.lowercase ? 'met' : ''}`}>
          {criteria.lowercase ? '✔' : '○'} Lowercase letter
        </li>
        <li className={`criteria-item ${criteria.number ? 'met' : ''}`}>
          {criteria.number ? '✔' : '○'} Number
        </li>
        <li className={`criteria-item ${criteria.special ? 'met' : ''}`}>
          {criteria.special ? '✔' : '○'} Special character
        </li>
      </ul>
    </div>
  );
}
