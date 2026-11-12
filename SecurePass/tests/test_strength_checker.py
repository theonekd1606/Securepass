"""
Unit tests for SecurePass Strength and Entropy Evaluator.
"""

import unittest
from generator.strength_checker import StrengthEvaluator, StrengthLevel


class TestStrengthChecker(unittest.TestCase):

    def test_empty_password(self):
        res = StrengthEvaluator.evaluate("")
        self.assertEqual(res.level, StrengthLevel.WEAK)
        self.assertEqual(res.score, 0)
        self.assertEqual(res.entropy_bits, 0.0)

    def test_weak_password(self):
        # Short, single category
        res = StrengthEvaluator.evaluate("abcdef")
        self.assertEqual(res.level, StrengthLevel.WEAK)
        self.assertLess(res.score, 50)

    def test_medium_password(self):
        # 10 chars, uppercase + lowercase
        res = StrengthEvaluator.evaluate("AbCdEfGhIj")
        self.assertIn(res.level, [StrengthLevel.MEDIUM, StrengthLevel.STRONG])
        self.assertGreaterEqual(res.categories_count, 2)

    def test_strong_password(self):
        # 18 chars, all 4 categories, high entropy
        res = StrengthEvaluator.evaluate("K9#mQ2$pL9@vW1!zX7")
        self.assertEqual(res.level, StrengthLevel.STRONG)
        self.assertGreaterEqual(res.score, 75)
        self.assertGreater(res.entropy_bits, 80)
        self.assertIn("Centuries", res.crack_time_display)


if __name__ == "__main__":
    unittest.main()
