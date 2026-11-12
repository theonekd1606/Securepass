/**
 * Strength Evaluator and NIST Entropy Calculator
 */

export type StrengthLevel = 'Weak' | 'Medium' | 'Strong';

export interface StrengthResult {
  level: StrengthLevel;
  score: number; // 0 to 100
  entropyBits: number;
  crackTimeDisplay: string;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigits: boolean;
  hasSymbols: boolean;
  categoriesCount: number;
  length: number;
  feedback: string[];
}

export function evaluateStrength(password: string): StrengthResult {
  if (!password) {
    return {
      level: 'Weak',
      score: 0,
      entropyBits: 0,
      crackTimeDisplay: 'Instant',
      hasUppercase: false,
      hasLowercase: false,
      hasDigits: false,
      hasSymbols: false,
      categoriesCount: 0,
      length: 0,
      feedback: ['Password is empty.'],
    };
  }

  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const categoriesCount = [hasUppercase, hasLowercase, hasDigits, hasSymbols].filter(Boolean).length;

  let poolSize = 0;
  if (hasUppercase) poolSize += 26;
  if (hasLowercase) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSymbols) poolSize += 32;
  if (poolSize === 0) poolSize = 1;

  // Shannon entropy in bits
  const entropyBits = Math.round(length * Math.log2(poolSize) * 10) / 10;

  let score = 0;
  const feedback: string[] = [];

  // Length evaluation
  if (length >= 16) score += 40;
  else if (length >= 12) score += 30;
  else if (length >= 8) score += 15;
  else {
    score += 5;
    feedback.push('Increase length to at least 12-16 characters.');
  }

  // Diversity evaluation (up to 60 points)
  score += categoriesCount * 15;

  // Repetition check
  const uniqueChars = new Set(password).size;
  const ratio = uniqueChars / length;
  if (ratio < 0.6) {
    score -= 15;
    feedback.push('Too many repeated characters.');
  } else {
    score = Math.min(100, score + 5);
  }

  score = Math.max(5, Math.min(100, score));

  let level: StrengthLevel = 'Weak';
  if (score >= 75 && length >= 12 && categoriesCount >= 3) {
    level = 'Strong';
    feedback.push('Excellent security: high entropy and rich character diversity.');
  } else if (score >= 50 && length >= 9 && categoriesCount >= 2) {
    level = 'Medium';
    feedback.push('Moderate security: consider adding special symbols or extending length.');
  } else {
    level = 'Weak';
    if (categoriesCount < 2) {
      feedback.push('Include at least 2 or 3 different character categories.');
    }
  }

  const crackTimeDisplay = calculateCrackTime(poolSize, length);

  return {
    level,
    score,
    entropyBits,
    crackTimeDisplay,
    hasUppercase,
    hasLowercase,
    hasDigits,
    hasSymbols,
    categoriesCount,
    length,
    feedback,
  };
}

function calculateCrackTime(poolSize: number, length: number): string {
  if (length > 30 && poolSize > 20) {
    return 'Centuries (virtually uncrackable)';
  }

  const combinations = Math.pow(poolSize, length);
  const seconds = (0.5 * combinations) / 1e10; // 10 billion guesses/sec

  if (seconds < 0.001) return 'Instant (< 1 ms)';
  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  return 'Centuries (virtually uncrackable)';
}
