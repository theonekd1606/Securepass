"""
Unit tests for SecurePass Password Generator Engine.
Verifies lengths, category representation, ambiguous exclusion, boundary limits, and CSPRNG behavior.
"""

import string
import unittest

from generator.password_generator import (
    AMBIGUOUS_CHARACTERS,
    GeneratorConfig,
    PasswordGenerationError,
    generate_password,
    secure_shuffle,
)


class TestPasswordGenerator(unittest.TestCase):

    def test_default_generation(self):
        config = GeneratorConfig()
        pwd = generate_password(config)
        self.assertEqual(len(pwd), 16)
        self.assertTrue(any(c.isupper() for c in pwd))
        self.assertTrue(any(c.islower() for c in pwd))
        self.assertTrue(any(c.isdigit() for c in pwd))
        self.assertTrue(any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in pwd))

    def test_length_boundaries(self):
        # Valid lengths
        for length in (8, 12, 32, 64, 128):
            cfg = GeneratorConfig(length=length)
            pwd = generate_password(cfg)
            self.assertEqual(len(pwd), length)

        # Invalid lengths: under 8
        with self.assertRaises(PasswordGenerationError):
            GeneratorConfig(length=7).validate()
        with self.assertRaises(PasswordGenerationError):
            generate_password(GeneratorConfig(length=0))

        # Invalid lengths: over 128
        with self.assertRaises(PasswordGenerationError):
            GeneratorConfig(length=129).validate()

    def test_minimum_two_categories_enforcement(self):
        # 0 categories
        with self.assertRaises(PasswordGenerationError):
            GeneratorConfig(
                use_uppercase=False,
                use_lowercase=False,
                use_digits=False,
                use_symbols=False,
            ).validate()

        # 1 category only (Uppercase only)
        with self.assertRaises(PasswordGenerationError):
            GeneratorConfig(
                use_uppercase=True,
                use_lowercase=False,
                use_digits=False,
                use_symbols=False,
            ).validate()

        # 1 category only (Digits only)
        with self.assertRaises(PasswordGenerationError):
            GeneratorConfig(
                use_uppercase=False,
                use_lowercase=False,
                use_digits=True,
                use_symbols=False,
            ).validate()

        # 2 categories (Valid)
        cfg = GeneratorConfig(
            length=10,
            use_uppercase=True,
            use_lowercase=True,
            use_digits=False,
            use_symbols=False,
        )
        pwd = generate_password(cfg)
        self.assertEqual(len(pwd), 10)
        self.assertTrue(any(c.isupper() for c in pwd))
        self.assertTrue(any(c.islower() for c in pwd))
        self.assertFalse(any(c.isdigit() for c in pwd))

    def test_guaranteed_category_representation(self):
        # Run 50 iterations to ensure every single generated password includes at least 1 of each chosen category
        for _ in range(50):
            cfg = GeneratorConfig(
                length=8,  # tight minimum length
                use_uppercase=True,
                use_lowercase=True,
                use_digits=True,
                use_symbols=True,
            )
            pwd = generate_password(cfg)
            self.assertEqual(len(pwd), 8)
            self.assertTrue(any(c.isupper() for c in pwd), "Missing uppercase in 8-char password")
            self.assertTrue(any(c.islower() for c in pwd), "Missing lowercase in 8-char password")
            self.assertTrue(any(c.isdigit() for c in pwd), "Missing digit in 8-char password")
            self.assertTrue(any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in pwd), "Missing symbol in 8-char password")

    def test_ambiguous_character_exclusion(self):
        # Generate 100 passwords with ambiguous characters excluded
        for _ in range(100):
            cfg = GeneratorConfig(
                length=24,
                use_uppercase=True,
                use_lowercase=True,
                use_digits=True,
                use_symbols=True,
                exclude_ambiguous=True,
            )
            pwd = generate_password(cfg)
            for ambig in AMBIGUOUS_CHARACTERS:
                self.assertNotIn(ambig, pwd, f"Found forbidden ambiguous char '{ambig}' in password: {pwd}")

    def test_secure_shuffle_randomness(self):
        original = list(string.ascii_letters + string.digits)
        shuffled = secure_shuffle(original)
        self.assertEqual(sorted(original), sorted(shuffled))
        # Extremely unlikely to remain in exact same order
        self.assertNotEqual(original, shuffled)


if __name__ == "__main__":
    unittest.main()
