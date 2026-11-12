/**
 * Cryptographically Secure Password Generator Engine (Web / TypeScript)
 * Mirrors Python's `secrets` module using `crypto.getRandomValues()`.
 */

export const AMBIGUOUS_CHARACTERS = new Set(['0', 'O', 'l', '1']);
export const DEFAULT_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export interface GeneratorConfig {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useDigits: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean;
}

export class PasswordGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordGenerationError';
  }
}

/**
 * Returns a cryptographically secure random integer in range [0, maxExclusive)
 * Equivalent to Python's `secrets.randbelow(maxExclusive)`.
 */
export function secureRandBelow(maxExclusive: number): number {
  if (maxExclusive <= 0) {
    throw new Error('maxExclusive must be greater than 0');
  }
  // Bias-free rejection sampling
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const buffer = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) {
      return buffer[0] % maxExclusive;
    }
  }
}

/**
 * Picks a random item from an array or string using CSPRNG.
 * Equivalent to Python's `secrets.choice()`.
 */
export function secureChoice<T extends string | any[]>(pool: T): string {
  if (!pool || pool.length === 0) {
    throw new PasswordGenerationError('Character pool is empty');
  }
  const index = secureRandBelow(pool.length);
  return pool[index];
}

/**
 * In-place Fisher-Yates shuffle using cryptographically secure randomness.
 */
export function secureShuffle(array: string[]): string[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandBelow(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Validates configuration according to security requirements.
 */
export function validateConfig(config: GeneratorConfig): void {
  if (config.length < 8) {
    throw new PasswordGenerationError('Password length must be at least 8 characters.');
  }
  if (config.length > 128) {
    throw new PasswordGenerationError('Password length cannot exceed 128 characters.');
  }

  const selectedCategories = [
    config.useUppercase,
    config.useLowercase,
    config.useDigits,
    config.useSymbols,
  ].filter(Boolean).length;

  if (selectedCategories < 2) {
    throw new PasswordGenerationError(
      'Security policy violation: At least two character categories must be selected.'
    );
  }
}

/**
 * Generates a password satisfying all security requirements.
 */
export function generatePassword(config: GeneratorConfig): string {
  validateConfig(config);

  const categoryPools: string[] = [];

  // Uppercase pool
  if (config.useUppercase) {
    let pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.excludeAmbiguous) {
      pool = pool.split('').filter((c) => !AMBIGUOUS_CHARACTERS.has(c)).join('');
    }
    categoryPools.push(pool);
  }

  // Lowercase pool
  if (config.useLowercase) {
    let pool = 'abcdefghijklmnopqrstuvwxyz';
    if (config.excludeAmbiguous) {
      pool = pool.split('').filter((c) => !AMBIGUOUS_CHARACTERS.has(c)).join('');
    }
    categoryPools.push(pool);
  }

  // Digits pool
  if (config.useDigits) {
    let pool = '0123456789';
    if (config.excludeAmbiguous) {
      pool = pool.split('').filter((c) => !AMBIGUOUS_CHARACTERS.has(c)).join('');
    }
    categoryPools.push(pool);
  }

  // Symbols pool
  if (config.useSymbols) {
    let pool = DEFAULT_SYMBOLS;
    if (config.excludeAmbiguous) {
      pool = pool.split('').filter((c) => !AMBIGUOUS_CHARACTERS.has(c)).join('');
    }
    categoryPools.push(pool);
  }

  // Guarantee at least one character from every selected category
  const passwordChars: string[] = categoryPools.map((pool) => secureChoice(pool));

  // Combined pool for the remainder of the length
  const combinedPool = categoryPools.join('');
  const remainingCount = config.length - passwordChars.length;

  for (let i = 0; i < remainingCount; i++) {
    passwordChars.push(secureChoice(combinedPool));
  }

  // Fisher-Yates CSPRNG shuffle
  const shuffled = secureShuffle(passwordChars);
  return shuffled.join('');
}
