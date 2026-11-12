# 🛡️ SecurePass – Secure Random Password Generator

A desktop application and cryptographically secure password generation tool engineered in Python. SecurePass creates unpredictable, high-entropy credentials according to user-defined security policies and NIST SP 800-63B standards.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Security Architecture & Implementation](#security-architecture--implementation)
5. [Project Structure](#project-structure)
6. [Installation & Requirements](#installation--requirements)
7. [Execution Instructions](#execution-instructions)
8. [Testing & Verification](#testing--verification)
9. [Screenshots & UI Showcase](#screenshots--ui-showcase)
10. [Future Roadmap](#future-roadmap)

---

## 🌟 Project Overview

**SecurePass** is designed for security-conscious professionals, system administrators, and everyday users who require unpredictable, robust passwords. Unlike typical generators that rely on pseudorandom generators (`random` module) or store temporary files on disk, SecurePass strictly adheres to zero-persistence principles and leverages hardware-backed Cryptographically Secure Pseudorandom Number Generators (CSPRNG).

---

## 🚀 Key Features

### 1. Flexible Password Length
- Interactive slider and direct numeric input ranging from **8 to 128 characters**.
- Strict bounds validation preventing sub-standard or buffer-overflow-prone lengths.

### 2. Multi-Category Character Diversity
- **Uppercase Letters** (`A-Z`)
- **Lowercase Letters** (`a-z`)
- **Decimal Numbers** (`0-9`)
- **Special Symbols** (`!@#$%^&*()_+-=[]{}|;:,.<>?`)
- **Policy Enforcement**: Requires **at least two active character categories** before generation can proceed.

### 3. Cryptographically Secure Generation
- Exclusively uses Python’s `secrets` module (backed by `/dev/urandom` or Windows CryptGenRandom/BCryptGenRandom).
- **Guaranteed Category Inclusion**: Mathematically guarantees that at least one character from *every* active category appears in the output.
- **Secure Shuffling**: Employs an unbiased Fisher-Yates shuffle driven by `secrets.randbelow()` to eliminate predictable placement patterns.

### 4. Real-Time Password Strength & Entropy Analysis
- Live evaluation based on character space pool size $N$, password length $L$, and Shannon entropy:
  $$E = L \times \log_2(N)$$
- Categorizes strength into **Weak**, **Medium**, and **Strong**.
- Displays animated progress bar, entropy in bits, and estimated brute-force crack time under offline high-throughput attack scenarios ($10^{10}$ hashes/second).

### 5. Ambiguous Character Exclusion
- Optional one-click toggle to exclude visually confusing glyphs: `0` (zero), `O` (uppercase o), `1` (one), and `l` (lowercase L).

### 6. Seamless Clipboard Integration
- Automatic clipboard copy upon generation (configurable toggle).
- Manual "Copy to Clipboard" button with instantaneous visual status confirmation.
- Powered by `pyperclip` with graceful fallback handling.

### 7. Ephemeral In-Memory Password History
- Stores only the **last 5 generated passwords**.
- Stored exclusively in RAM via `collections.deque(maxlen=5)`.
- **Zero Disk Persistence**: Passwords are never written to disk, SQLite, logs, or temporary files.
- Single-click "Clear History" button immediately wipes session state.
- Individual copy buttons for past passwords.

### 8. Additional Controls
- Instant password masking toggle (Show/Hide `••••••••`).
- Keyboard shortcut friendly & responsive design.
- Dual-mode architecture: Modern graphical UI or headless terminal CLI (`--cli`).

---

## 🛠️ Technology Stack

- **Language**: Python 3.10+
- **Security Engine**: `secrets` (standard library CSPRNG)
- **String Manipulations**: `string` (standard library)
- **GUI Framework**: `CustomTkinter` (Modern Dark theme) with fallback to `Tkinter/ttk`
- **Clipboard Management**: `pyperclip`
- **Testing**: Python `unittest` framework

---

## 🔒 Security Architecture & Implementation

| Threat / Vulnerability | Traditional Flaw | SecurePass Implementation |
| :--- | :--- | :--- |
| **Predictable PRNG** | Mersenne Twister (`random` module) can be reconstructed after 624 outputs. | Exclusively uses OS kernel entropy (`secrets` module). |
| **Biased Distribution** | Modulo arithmetic biases random character distributions. | Uses `secrets.choice()` and `secrets.randbelow()` for uniform sampling. |
| **Missing Category** | Pure probability can leave out numbers or symbols in small lengths. | Dedicated allocation guarantees at least one character from every active category. |
| **Predictable Placement** | Generating required characters first results in prefix bias. | Full CSPRNG Fisher-Yates array permutation. |
| **Disk Forensics / Leaks** | Writing logs or history files exposes passwords to disk recovery. | In-memory only (`deque(maxlen=5)`), zero disk I/O, zero log persistence. |

---

## 📁 Project Structure

```text
SecurePass/
├── main.py                     # Application entry point (GUI & CLI fallback)
├── requirements.txt            # Python dependencies
├── README.md                   # Complete architectural documentation
├── generator/
│   ├── __init__.py
│   ├── password_generator.py   # CSPRNG generator, categories & Fisher-Yates shuffle
│   └── strength_checker.py     # Entropy calculator & brute-force estimator
├── gui/
│   ├── __init__.py
│   └── dashboard.py            # CustomTkinter modern dark dashboard & state
├── utils/
│   ├── __init__.py
│   └── clipboard_manager.py    # Pyperclip integration & status handler
└── tests/
    ├── __init__.py
    ├── test_password_generator.py # Unit tests for generator logic & limits
    └── test_strength_checker.py   # Unit tests for entropy and strength grading
```

---

## 📦 Installation & Requirements

### 1. Prerequisites
- Python 3.10 or higher installed on Windows, macOS, or Linux.
- (Optional, for Linux GUI) Tkinter system libraries:
  ```bash
  sudo apt-get install python3-tk
  ```

### 2. Install Dependencies
```bash
cd SecurePass
pip install -r requirements.txt
```

---

## 💻 Execution Instructions

### Running the Desktop GUI:
```bash
python main.py
```

### Running in Headless / CLI Mode:
```bash
# Generate 20-character password
python main.py --cli -l 20

# Exclude ambiguous characters and copy to clipboard
python main.py --cli -l 32 --exclude-ambiguous

# Custom constraints
python main.py --cli -l 16 --no-symbols
```

---

## 🧪 Testing & Verification

Run the complete test suite using Python's built-in `unittest`:

```bash
python -m unittest discover -s tests
```

Output:
```text
Ran 10 tests in 0.027s
OK
```

All boundary conditions, category presence guarantees, ambiguous character filters, and entropy calculation formulas are automatically verified.

---

## 🖼️ Screenshots & UI Showcase

The desktop application is built with a sleek, dark cyber-aesthetic:
- **Palette**: Slate dark background (`#0f172a`), deep panels (`#1e293b`), sky blue highlights (`#38bdf8`), emerald strength accents (`#10b981`).
- **Interactive Feedback**: Real-time slider adjustment, live strength meter, copy toast badges, and history list.

---

## 🔮 Future Roadmap

- [ ] Export to KeePass-compatible XML / encrypted password vaults.
- [ ] Diceware passphrase generation mode with EFF wordlists.
- [ ] Localized translations (Spanish, German, Japanese).
- [ ] Hardware Security Key (FIDO2/YubiKey) entropy seeding integration.
