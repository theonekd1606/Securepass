"""
SecurePass - Password Strength and Entropy Evaluator Module
Assesses password complexity, character diversity, information entropy, and brute-force resistance.
"""

from dataclasses import dataclass
from enum import Enum
import math
import string
from typing import Dict, List, Set


class StrengthLevel(str, Enum):
    WEAK = "Weak"
    MEDIUM = "Medium"
    STRONG = "Strong"


@dataclass(frozen=True)
class PasswordStrength:
    level: StrengthLevel
    score: int                  # 0 to 100 percentage score
    entropy_bits: float         # NIST information entropy
    crack_time_display: str     # Estimated brute force time at 10^10 hashes/sec
    has_uppercase: bool
    has_lowercase: bool
    has_digits: bool
    has_symbols: bool
    categories_count: int
    length: int
    feedback: List[str]


class StrengthEvaluator:
    """Evaluates password strength based on entropy, length, and diversity."""

    @staticmethod
    def evaluate(password: str) -> PasswordStrength:
        if not password:
            return PasswordStrength(
                level=StrengthLevel.WEAK,
                score=0,
                entropy_bits=0.0,
                crack_time_display="Instant",
                has_uppercase=False,
                has_lowercase=False,
                has_digits=False,
                has_symbols=False,
                categories_count=0,
                length=0,
                feedback=["Password is empty."],
            )

        length = len(password)
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digits = any(c.isdigit() for c in password)
        has_symbols = any(c in string.punctuation for c in password)

        categories_count = sum([has_upper, has_lower, has_digits, has_symbols])

        # Estimate character pool size (N)
        pool_size = 0
        if has_upper:
            pool_size += 26
        if has_lower:
            pool_size += 26
        if has_digits:
            pool_size += 10
        if has_symbols:
            pool_size += 32

        if pool_size == 0:
            pool_size = 1

        # Entropy in bits: E = L * log2(R)
        entropy_bits = round(length * math.log2(pool_size), 1)

        # Base score from length and entropy
        score = 0
        feedback: List[str] = []

        # Length evaluation
        if length >= 16:
            score += 40
        elif length >= 12:
            score += 30
        elif length >= 8:
            score += 15
        else:
            score += 5
            feedback.append("Increase length to at least 12-16 characters.")

        # Diversity evaluation
        diversity_score = categories_count * 15  # Up to 60 points
        score += diversity_score

        # Unique character ratio bonus/penalty
        unique_chars = len(set(password))
        uniqueness_ratio = unique_chars / length
        if uniqueness_ratio < 0.6:
            score -= 15
            feedback.append("Too many repeated characters.")
        else:
            score = min(100, score + 5)

        # Classify into Weak, Medium, Strong
        score = max(5, min(100, score))

        if score >= 75 and length >= 12 and categories_count >= 3:
            level = StrengthLevel.STRONG
            feedback.append("Excellent security: high entropy and rich character diversity.")
        elif score >= 50 and length >= 9 and categories_count >= 2:
            level = StrengthLevel.MEDIUM
            feedback.append("Moderate security: consider adding special symbols or extending length.")
        else:
            level = StrengthLevel.WEAK
            if categories_count < 2:
                feedback.append("Include at least 2 or 3 different character categories.")

        # Calculate estimated brute force crack time at 10 billion guesses/second
        crack_time_display = StrengthEvaluator._calculate_crack_time(pool_size, length)

        return PasswordStrength(
            level=level,
            score=score,
            entropy_bits=entropy_bits,
            crack_time_display=crack_time_display,
            has_uppercase=has_upper,
            has_lowercase=has_lower,
            has_digits=has_digits,
            has_symbols=has_symbols,
            categories_count=categories_count,
            length=length,
            feedback=feedback,
        )

    @staticmethod
    def _calculate_crack_time(pool_size: int, length: int) -> str:
        """
        Estimates time to brute force assuming an offline cluster testing
        10 billion (10^10) combinations per second.
        Total combinations = pool_size ^ length.
        Average search time = 0.5 * combinations / rate.
        """
        try:
            # Avoid overflow for very large passwords
            if length > 30 and pool_size > 20:
                return "Centuries (virtually uncrackable)"

            combinations = pool_size ** length
            seconds = (0.5 * combinations) / (10**10)

            if seconds < 0.001:
                return "Instant (< 1 millisecond)"
            elif seconds < 1:
                return "< 1 second"
            elif seconds < 60:
                return f"{int(seconds)} seconds"
            elif seconds < 3600:
                return f"{int(seconds / 60)} minutes"
            elif seconds < 86400:
                return f"{int(seconds / 3600)} hours"
            elif seconds < 31536000:
                return f"{int(seconds / 86400)} days"
            elif seconds < 31536000 * 100:
                return f"{int(seconds / 31536000)} years"
            else:
                return "Centuries (virtually uncrackable)"
        except OverflowError:
            return "Centuries (virtually uncrackable)"
