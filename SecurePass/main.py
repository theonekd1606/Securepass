"""
SecurePass - Secure Random Password Generator
Main entry point for Desktop Application and CLI execution.
"""

import argparse
import os
import sys

from generator.password_generator import (
    GeneratorConfig,
    generate_password,
    PasswordGenerationError,
)
from generator.strength_checker import StrengthEvaluator
from utils.clipboard_manager import ClipboardManager


def run_cli_mode(args: argparse.Namespace) -> None:
    """Runs SecurePass in command-line mode for quick generation and terminal use."""
    print("=" * 60)
    print("  🛡️  SecurePass - Cryptographically Secure Password Tool  ")
    print("=" * 60)

    try:
        config = GeneratorConfig(
            length=args.length,
            use_uppercase=not args.no_upper,
            use_lowercase=not args.no_lower,
            use_digits=not args.no_digits,
            use_symbols=not args.no_symbols,
            exclude_ambiguous=args.exclude_ambiguous,
        )
        password = generate_password(config)
        strength = StrengthEvaluator.evaluate(password)

        print(f"\n🔑 Generated Password: {password}")
        print(f"📊 Length:            {len(password)} characters")
        print(f"💪 Security Strength: {strength.level.value} ({strength.score}/100)")
        print(f"⚡ Entropy:           {strength.entropy_bits} bits")
        print(f"⏱️  Crack Resistance:  ~{strength.crack_time_display}")

        if args.copy:
            success, msg = ClipboardManager.copy(password)
            if success:
                print("📋 Clipboard:         Copied successfully!")
            else:
                print(f"⚠️  Clipboard:         {msg}")

        print("\n" + "=" * 60)
    except PasswordGenerationError as e:
        print(f"❌ Security Policy Error: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="SecurePass – Cryptographically Secure Random Password Generator"
    )
    parser.add_argument("--cli", action="store_true", help="Run in command-line mode instead of GUI")
    parser.add_argument("-l", "--length", type=int, default=16, help="Password length (8-128, default: 16)")
    parser.add_argument("--no-upper", action="store_true", help="Exclude uppercase letters (A-Z)")
    parser.add_argument("--no-lower", action="store_true", help="Exclude lowercase letters (a-z)")
    parser.add_argument("--no-digits", action="store_true", help="Exclude digits (0-9)")
    parser.add_argument("--no-symbols", action="store_true", help="Exclude special symbols")
    parser.add_argument("--exclude-ambiguous", action="store_true", help="Exclude ambiguous characters (0, O, l, 1)")
    parser.add_argument("--copy", action="store_true", default=True, help="Copy to clipboard on generation (default: True)")

    args = parser.parse_args()

    # Detect if display is available; if no DISPLAY or user requested --cli, run CLI mode
    has_display = bool(os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY") or sys.platform == "win32" or sys.platform == "darwin")

    if args.cli or not has_display:
        if not has_display and not args.cli:
            print("[INFO] No graphical display detected. Falling back to CLI mode.")
        run_cli_mode(args)
        return

    # Graphical GUI mode
    try:
        from gui.dashboard import SecurePassApp
        app = SecurePassApp()
        app.run()
    except Exception as e:
        print(f"[ERROR] Could not start GUI: {e}. Switching to CLI mode.", file=sys.stderr)
        run_cli_mode(args)


if __name__ == "__main__":
    main()
