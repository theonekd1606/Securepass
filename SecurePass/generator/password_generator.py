"""
SecurePass - Cryptographically Secure Password Generator Module
Uses Python's built-in `secrets` module to ensure unpredictable randomness.
"""

from dataclasses import dataclass
import secrets
import string
from typing import List, Set


# Standard ambiguous characters often confused in print or UI
AMBIGUOUS_CHARACTERS: Set[str] = {'0', 'O', 'l', '1'}

# Standard safe symbol set for passwords
DEFAULT_SYMBOLS: str = "!@#$%^&*()_+-=[]{}|;:,.<>?"


class PasswordGenerationError(ValueError):
    """Raised when password generation parameters are invalid or violated."""
    pass


@dataclass(frozen=True)
class GeneratorConfig:
    """Configuration settings for password generation."""
    length: int = 16
    use_uppercase: bool = True
    use_lowercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True
    exclude_ambiguous: bool = False

    def validate(self) -> None:
        """
        Validates configuration according to security policies.
        Raises PasswordGenerationError if invalid.
        """
        if not isinstance(self.length, int):
            raise PasswordGenerationError("Password length must be an integer.")
        if self.length < 8:
            raise PasswordGenerationError("Password length must be at least 8 characters.")
        if self.length > 128:
            raise PasswordGenerationError("Password length cannot exceed 128 characters.")

        selected_categories = sum([
            1 if self.use_uppercase else 0,
            1 if self.use_lowercase else 0,
            1 if self.use_digits else 0,
            1 if self.use_symbols else 0,
        ])

        if selected_categories < 2:
            raise PasswordGenerationError(
                "Security policy violation: At least two character categories must be selected."
            )


def secure_shuffle(items: List[str]) -> List[str]:
    """
    Fisher-Yates shuffle implemented using cryptographically secure `secrets.randbelow`.
    Avoids `random.shuffle` which is pseudorandom and insecure for cryptography.
    """
    shuffled = list(items)
    for i in range(len(shuffled) - 1, 0, -1):
        # Pick a secure random index from 0 to i (inclusive)
        j = secrets.randbelow(i + 1)
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
    return shuffled


def generate_password(config: GeneratorConfig) -> str:
    """
    Generates a cryptographically secure random password.
    
    Guarantees:
    1. Uses exclusively the `secrets` module (never `random`).
    2. Enforces at least 2 character categories.
    3. Guarantees at least one character from EVERY selected category.
    4. Applies optional ambiguous character exclusion ('0', 'O', 'l', '1').
    5. Shuffles the character list with a CSPRNG Fisher-Yates algorithm.
    """
    config.validate()

    category_pools: List[str] = []

    # Prepare uppercase pool
    if config.use_uppercase:
        chars = string.ascii_uppercase
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        if not chars:
            raise PasswordGenerationError("Uppercase character pool is empty after filtering.")
        category_pools.append(chars)

    # Prepare lowercase pool
    if config.use_lowercase:
        chars = string.ascii_lowercase
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        if not chars:
            raise PasswordGenerationError("Lowercase character pool is empty after filtering.")
        category_pools.append(chars)

    # Prepare digits pool
    if config.use_digits:
        chars = string.digits
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        if not chars:
            raise PasswordGenerationError("Digits character pool is empty after filtering.")
        category_pools.append(chars)

    # Prepare symbols pool
    if config.use_symbols:
        chars = DEFAULT_SYMBOLS
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        if not chars:
            raise PasswordGenerationError("Symbols character pool is empty after filtering.")
        category_pools.append(chars)

    # Guarantee at least one character from EVERY selected category
    password_chars: List[str] = [secrets.choice(pool) for pool in category_pools]

    # Combine all active pools for remaining characters
    combined_pool = "".join(category_pools)
    if not combined_pool:
        raise PasswordGenerationError("Total character pool is empty.")

    remaining_count = config.length - len(password_chars)
    for _ in range(remaining_count):
        password_chars.append(secrets.choice(combined_pool))

    # Cryptographically secure shuffle to prevent predictable placement
    shuffled_chars = secure_shuffle(password_chars)

    return "".join(shuffled_chars)
