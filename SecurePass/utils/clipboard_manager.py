"""
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
    """Manages clipboard interactions with safety fallbacks and status reporting."""

    _last_copied_preview: str = ""

    @classmethod
    def is_available(cls) -> bool:
        return _PYPERCLIP_AVAILABLE

    @classmethod
    def copy(cls, text: str) -> Tuple[bool, str]:
        """
        Copies text to the system clipboard.
        Returns: (success: bool, status_message: str)
        """
        if not text:
            return False, "Cannot copy: Password is empty."

        if not _PYPERCLIP_AVAILABLE or pyperclip is None:
            # Fallback message for environments lacking pyperclip
            return False, "Clipboard unavailable: 'pyperclip' package is not installed."

        try:
            pyperclip.copy(text)
            cls._last_copied_preview = text[:4] + "..." if len(text) > 4 else text
            return True, "Copied to clipboard!"
        except Exception as err:
            return False, f"Failed to access clipboard: {str(err)}"

    @classmethod
    def paste(cls) -> str:
        """Retrieves text from clipboard if available."""
        if not _PYPERCLIP_AVAILABLE or pyperclip is None:
            return ""
        try:
            return pyperclip.paste()
        except Exception:
            return ""
