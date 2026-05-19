export function usePasswordStrength(password: string) {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const criteriaMetCount = Object.values(criteria).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (criteriaMetCount <= 2) return 'Weak';
    if (criteriaMetCount === 3) return 'Fair';
    if (criteriaMetCount === 4) return 'Good';
    return 'Strong';
  };

  const getStrengthClass = () => {
    const label = getStrengthLabel();
    if (label === 'Weak') return 'weak';
    if (label === 'Fair') return 'fair';
    if (label === 'Good') return 'good';
    if (label === 'Strong') return 'strong';
    return '';
  };

  return {
    criteria,
    criteriaMetCount,
    strengthLabel: getStrengthLabel(),
    strengthClass: getStrengthClass(),
  };
}
