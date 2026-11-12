export interface PythonSourceFile {
  name: string;
  path: string;
  description: string;
  code: string;
  category: 'core' | 'gui' | 'utils' | 'tests' | 'meta';
}

export const PYTHON_FILES: PythonSourceFile[] = [
  {
    name: 'password_generator.py',
    path: 'SecurePass/generator/password_generator.py',
    description: 'CSPRNG generation engine using secrets, category guarantees & Fisher-Yates shuffle.',
    category: 'core',
    code: `"""
SecurePass - Cryptographically Secure Password Generator Module
Uses Python's built-in \`secrets\` module to ensure unpredictable randomness.
"""

from dataclasses import dataclass
import secrets
import string
from typing import List, Set

AMBIGUOUS_CHARACTERS: Set[str] = {'0', 'O', 'l', '1'}
DEFAULT_SYMBOLS: str = "!@#$%^&*()_+-=[]{}|;:,.<>?"

class PasswordGenerationError(ValueError):
    """Raised when password generation parameters are invalid or violated."""
    pass

@dataclass(frozen=True)
class GeneratorConfig:
    length: int = 16
    use_uppercase: bool = True
    use_lowercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True
    exclude_ambiguous: bool = False

    def validate(self) -> None:
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
    """Fisher-Yates shuffle using cryptographically secure secrets.randbelow."""
    shuffled = list(items)
    for i in range(len(shuffled) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
    return shuffled

def generate_password(config: GeneratorConfig) -> str:
    config.validate()
    category_pools: List[str] = []

    if config.use_uppercase:
        chars = string.ascii_uppercase
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        category_pools.append(chars)

    if config.use_lowercase:
        chars = string.ascii_lowercase
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        category_pools.append(chars)

    if config.use_digits:
        chars = string.digits
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        category_pools.append(chars)

    if config.use_symbols:
        chars = DEFAULT_SYMBOLS
        if config.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARACTERS)
        category_pools.append(chars)

    # Guarantee at least one character from EVERY selected category
    password_chars: List[str] = [secrets.choice(pool) for pool in category_pools]

    combined_pool = "".join(category_pools)
    remaining_count = config.length - len(password_chars)
    for _ in range(remaining_count):
        password_chars.append(secrets.choice(combined_pool))

    return "".join(secure_shuffle(password_chars))
`,
  },
  {
    name: 'strength_checker.py',
    path: 'SecurePass/generator/strength_checker.py',
    description: 'NIST Shannon entropy calculator, category analysis, and offline brute-force time estimator.',
    category: 'core',
    code: `"""
SecurePass - Password Strength and Entropy Evaluator Module
Assesses password complexity, character diversity, information entropy, and brute-force resistance.
"""

from dataclasses import dataclass
from enum import Enum
import math
import string
from typing import List

class StrengthLevel(str, Enum):
    WEAK = "Weak"
    MEDIUM = "Medium"
    STRONG = "Strong"

@dataclass(frozen=True)
class PasswordStrength:
    level: StrengthLevel
    score: int
    entropy_bits: float
    crack_time_display: str
    has_uppercase: bool
    has_lowercase: bool
    has_digits: bool
    has_symbols: bool
    categories_count: int
    length: int
    feedback: List[str]

class StrengthEvaluator:
    @staticmethod
    def evaluate(password: str) -> PasswordStrength:
        if not password:
            return PasswordStrength(
                level=StrengthLevel.WEAK, score=0, entropy_bits=0.0,
                crack_time_display="Instant", has_uppercase=False, has_lowercase=False,
                has_digits=False, has_symbols=False, categories_count=0, length=0,
                feedback=["Password is empty."]
            )

        length = len(password)
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digits = any(c.isdigit() for c in password)
        has_symbols = any(c in string.punctuation for c in password)
        categories_count = sum([has_upper, has_lower, has_digits, has_symbols])

        pool_size = (26 if has_upper else 0) + (26 if has_lower else 0) + \\
                    (10 if has_digits else 0) + (32 if has_symbols else 0) or 1

        entropy_bits = round(length * math.log2(pool_size), 1)

        score = (40 if length >= 16 else 30 if length >= 12 else 15 if length >= 8 else 5)
        score += categories_count * 15

        unique_ratio = len(set(password)) / length
        if unique_ratio < 0.6:
            score -= 15
        else:
            score = min(100, score + 5)

        score = max(5, min(100, score))

        if score >= 75 and length >= 12 and categories_count >= 3:
            level = StrengthLevel.STRONG
        elif score >= 50 and length >= 9 and categories_count >= 2:
            level = StrengthLevel.MEDIUM
        else:
            level = StrengthLevel.WEAK

        crack_time = StrengthEvaluator._calculate_crack_time(pool_size, length)

        return PasswordStrength(
            level=level, score=score, entropy_bits=entropy_bits,
            crack_time_display=crack_time, has_uppercase=has_upper,
            has_lowercase=has_lower, has_digits=has_digits, has_symbols=has_symbols,
            categories_count=categories_count, length=length, feedback=[]
        )

    @staticmethod
    def _calculate_crack_time(pool_size: int, length: int) -> str:
        if length > 30 and pool_size > 20:
            return "Centuries (virtually uncrackable)"
        combinations = pool_size ** length
        seconds = (0.5 * combinations) / (10**10)
        if seconds < 0.001: return "Instant (< 1 ms)"
        if seconds < 60: return f"{int(seconds)} seconds"
        if seconds < 3600: return f"{int(seconds/60)} minutes"
        if seconds < 86400: return f"{int(seconds/3600)} hours"
        if seconds < 31536000: return f"{int(seconds/86400)} days"
        return "Centuries (virtually uncrackable)"
`,
  },
  {
    name: 'dashboard.py',
    path: 'SecurePass/gui/dashboard.py',
    description: 'CustomTkinter / Tkinter dark GUI interface with sliders, checkboxes, and in-memory history.',
    category: 'gui',
    code: `"""
SecurePass - Modern Dark GUI Dashboard
Supports CustomTkinter with seamless Tkinter/ttk dark fallback.
Strictly memory-only history; zero file logging or persistence.
"""

from collections import deque
import sys
from typing import Deque

from generator.password_generator import GeneratorConfig, generate_password, PasswordGenerationError
from generator.strength_checker import StrengthEvaluator, PasswordStrength, StrengthLevel
from utils.clipboard_manager import ClipboardManager

try:
    import customtkinter as ctk
    _USE_CUSTOMTKINTER = True
except ImportError:
    ctk = None
    _USE_CUSTOMTKINTER = False
    import tkinter as tk

class SecurePassApp:
    MAX_HISTORY: int = 5

    def __init__(self, root=None):
        self.root = root
        self._history: Deque[str] = deque(maxlen=self.MAX_HISTORY)
        self._current_password: str = ""
        self._is_password_masked: bool = False
        self._auto_copy: bool = True
        self._init_window()
        self._create_widgets()
        self.on_generate_password()

    # GUI widgets, callbacks, copy handlers, and memory-only history methods...
`,
  },
  {
    name: 'clipboard_manager.py',
    path: 'SecurePass/utils/clipboard_manager.py',
    description: 'Pyperclip integration with graceful cross-platform clipboard handlers.',
    category: 'utils',
    code: `"""
SecurePass - Clipboard Manager Utility
Handles system clipboard operations using pyperclip with fallback support.
"""
from typing import Tuple

try:
    import pyperclip
    _PYPERCLIP_AVAILABLE = True
except ImportError:
    pyperclip = None
    _PYPERCLIP_AVAILABLE = False

class ClipboardManager:
    @classmethod
    def copy(cls, text: str) -> Tuple[bool, str]:
        if not text:
            return False, "Cannot copy empty text."
        if not _PYPERCLIP_AVAILABLE:
            return False, "Clipboard unavailable: 'pyperclip' not installed."
        try:
            pyperclip.copy(text)
            return True, "Copied to clipboard!"
        except Exception as err:
            return False, f"Failed: {err}"
`,
  },
  {
    name: 'main.py',
    path: 'SecurePass/main.py',
    description: 'Dual-mode application entry point: launches CustomTkinter GUI or CLI parser.',
    category: 'core',
    code: `"""
SecurePass - Secure Random Password Generator
Main entry point for Desktop Application and CLI execution.
"""
import argparse
import os
import sys

from generator.password_generator import GeneratorConfig, generate_password
from generator.strength_checker import StrengthEvaluator
from utils.clipboard_manager import ClipboardManager

def main():
    parser = argparse.ArgumentParser(description="SecurePass - Secure Random Password Generator")
    parser.add_argument("--cli", action="store_true", help="Run in CLI mode")
    parser.add_argument("-l", "--length", type=int, default=16, help="Password length (8-128)")
    parser.add_argument("--exclude-ambiguous", action="store_true", help="Exclude 0, O, l, 1")
    args = parser.parse_args()

    has_display = bool(os.environ.get("DISPLAY") or sys.platform in ("win32", "darwin"))
    if args.cli or not has_display:
        config = GeneratorConfig(length=args.length, exclude_ambiguous=args.exclude_ambiguous)
        pwd = generate_password(config)
        st = StrengthEvaluator.evaluate(pwd)
        print(f"Generated Password: {pwd}")
        print(f"Strength: {st.level.value} ({st.entropy_bits} bits entropy)")
        return

    from gui.dashboard import SecurePassApp
    app = SecurePassApp()
    app.run()

if __name__ == "__main__":
    main()
`,
  },
  {
    name: 'test_password_generator.py',
    path: 'SecurePass/tests/test_password_generator.py',
    description: 'Unit test suite verifying boundaries, diversity guarantees, and ambiguous exclusion.',
    category: 'tests',
    code: `"""
Unit tests for SecurePass Password Generator Engine.
"""
import unittest
from generator.password_generator import GeneratorConfig, generate_password, AMBIGUOUS_CHARACTERS

class TestPasswordGenerator(unittest.TestCase):
    def test_length_boundaries(self):
        for l in (8, 16, 64, 128):
            self.assertEqual(len(generate_password(GeneratorConfig(length=l))), l)

    def test_guaranteed_category_representation(self):
        for _ in range(50):
            pwd = generate_password(GeneratorConfig(length=8))
            self.assertTrue(any(c.isupper() for c in pwd))
            self.assertTrue(any(c.islower() for c in pwd))
            self.assertTrue(any(c.isdigit() for c in pwd))
            self.assertTrue(any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in pwd))

    def test_ambiguous_character_exclusion(self):
        for _ in range(100):
            pwd = generate_password(GeneratorConfig(length=32, exclude_ambiguous=True))
            for ambig in AMBIGUOUS_CHARACTERS:
                self.assertNotIn(ambig, pwd)

if __name__ == "__main__":
    unittest.main()
`,
  },
  {
    name: 'requirements.txt',
    path: 'SecurePass/requirements.txt',
    description: 'Python package requirements specification.',
    category: 'meta',
    code: `customtkinter>=5.2.0
pyperclip>=1.8.2
`,
  },
  {
    name: 'README.md',
    path: 'SecurePass/README.md',
    description: 'Full architecture and security documentation.',
    category: 'meta',
    code: `# SecurePass - Secure Random Password Generator
Built in Python with secrets, CustomTkinter, and pyperclip.
See full README in repository.
`,
  },
];
