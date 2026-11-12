import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePassword,
  validateConfig,
  PasswordGenerationError,
  AMBIGUOUS_CHARACTERS,
  type GeneratorConfig,
} from './passwordGenerator';
import { evaluateStrength } from './strengthChecker';

test('validates minimum length and maximum length boundaries', () => {
  assert.throws(() => {
    validateConfig({
      length: 7,
      useUppercase: true,
      useLowercase: true,
      useDigits: true,
      useSymbols: true,
      excludeAmbiguous: false,
    });
  }, PasswordGenerationError);

  assert.throws(() => {
    validateConfig({
      length: 129,
      useUppercase: true,
      useLowercase: true,
      useDigits: true,
      useSymbols: true,
      excludeAmbiguous: false,
    });
  }, PasswordGenerationError);
});

test('requires at least two character categories', () => {
  assert.throws(() => {
    validateConfig({
      length: 16,
      useUppercase: true,
      useLowercase: false,
      useDigits: false,
      useSymbols: false,
      excludeAmbiguous: false,
    });
  }, PasswordGenerationError);

  assert.doesNotThrow(() => {
    validateConfig({
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useDigits: false,
      useSymbols: false,
      excludeAmbiguous: false,
    });
  });
});

test('guarantees presence of every selected category', () => {
  for (let i = 0; i < 30; i++) {
    const pwd = generatePassword({
      length: 8,
      useUppercase: true,
      useLowercase: true,
      useDigits: true,
      useSymbols: true,
      excludeAmbiguous: false,
    });

    assert.equal(pwd.length, 8);
    assert.ok(/[A-Z]/.test(pwd), 'Must contain uppercase');
    assert.ok(/[a-z]/.test(pwd), 'Must contain lowercase');
    assert.ok(/[0-9]/.test(pwd), 'Must contain digit');
    assert.ok(/[^A-Za-z0-9]/.test(pwd), 'Must contain symbol');
  }
});

test('excludes ambiguous characters when enabled', () => {
  for (let i = 0; i < 50; i++) {
    const pwd = generatePassword({
      length: 32,
      useUppercase: true,
      useLowercase: true,
      useDigits: true,
      useSymbols: true,
      excludeAmbiguous: true,
    });

    for (const ambig of AMBIGUOUS_CHARACTERS) {
      assert.ok(!pwd.includes(ambig), `Password should not contain ambiguous char ${ambig}`);
    }
  }
});

test('evaluates strength levels correctly', () => {
  const weak = evaluateStrength('short');
  assert.equal(weak.level, 'Weak');

  const strong = evaluateStrength('P@ssw0rd!#Secure992');
  assert.equal(strong.level, 'Strong');
  assert.ok(strong.entropyBits > 70);
});
