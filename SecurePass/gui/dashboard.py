"""
SecurePass - Modern Dark GUI Dashboard
Supports CustomTkinter with seamless Tkinter/ttk dark fallback.
Strictly memory-only history; zero file logging or persistence.
"""

from collections import deque
import sys
from typing import Deque, List, Optional

from generator.password_generator import (
    GeneratorConfig,
    generate_password,
    PasswordGenerationError,
)
from generator.strength_checker import (
    StrengthEvaluator,
    PasswordStrength,
    StrengthLevel,
)
from utils.clipboard_manager import ClipboardManager

# Try importing CustomTkinter; fallback to standard tkinter
try:
    import customtkinter as ctk
    _USE_CUSTOMTKINTER = True
except ImportError:
    ctk = None
    _USE_CUSTOMTKINTER = False
    import tkinter as tk
    from tkinter import ttk, messagebox


class SecurePassApp:
    """
    Main SecurePass Desktop Application.
    Provides a dark-themed, responsive interface with CSPRNG generation,
    real-time entropy visualization, and memory-only history.
    """

    MAX_HISTORY: int = 5

    def __init__(self, root: Optional[object] = None):
        self.root = root
        self._history: Deque[str] = deque(maxlen=self.MAX_HISTORY)
        self._current_password: str = ""
        self._is_password_masked: bool = False
        self._auto_copy: bool = True

        # State variables
        self._init_window()
        self._create_widgets()
        # Generate initial secure password on startup
        self.on_generate_password()

    def _init_window(self) -> None:
        if _USE_CUSTOMTKINTER:
            ctk.set_appearance_mode("dark")
            ctk.set_default_color_theme("blue")
            if self.root is None:
                self.root = ctk.CTk()
            self.root.title("SecurePass – Secure Random Password Generator")
            self.root.geometry("640x780")
            self.root.minsize(580, 700)
        else:
            if self.root is None:
                self.root = tk.Tk()
            self.root.title("SecurePass – Secure Random Password Generator")
            self.root.geometry("640x780")
            self.root.configure(bg="#0f172a")

    def _create_widgets(self) -> None:
        if _USE_CUSTOMTKINTER:
            self._create_customtkinter_ui()
        else:
            self._create_standard_tkinter_ui()

    # -------------------------------------------------------------
    # CustomTkinter UI implementation
    # -------------------------------------------------------------
    def _create_customtkinter_ui(self) -> None:
        self.main_container = ctk.CTkScrollableFrame(self.root, fg_color="transparent")
        self.main_container.pack(fill="both", expand=True, padx=20, pady=16)

        # Header Branding
        header_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        header_frame.pack(fill="x", pady=(0, 14))

        title_label = ctk.CTkLabel(
            header_frame,
            text="🛡️ SecurePass",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color="#38bdf8",
        )
        title_label.pack(anchor="w")

        subtitle_label = ctk.CTkLabel(
            header_frame,
            text="Cryptographically Secure CSPRNG Password Generator",
            font=ctk.CTkFont(size=13),
            text_color="#94a3b8",
        )
        subtitle_label.pack(anchor="w")

        # Password Display Card
        display_card = ctk.CTkFrame(self.main_container, fg_color="#1e293b", corner_radius=12)
        display_card.pack(fill="x", pady=(0, 14), padx=2)

        self.pass_display_var = ctk.StringVar(value="")
        self.pass_entry = ctk.CTkEntry(
            display_card,
            textvariable=self.pass_display_var,
            font=ctk.CTkFont(family="Courier", size=17, weight="bold"),
            fg_color="#0f172a",
            text_color="#38bdf8",
            border_color="#334155",
            corner_radius=8,
            height=48,
        )
        self.pass_entry.pack(fill="x", padx=16, pady=(16, 10))

        # Password Action Buttons
        btn_row = ctk.CTkFrame(display_card, fg_color="transparent")
        btn_row.pack(fill="x", padx=16, pady=(0, 16))

        self.btn_toggle_mask = ctk.CTkButton(
            btn_row,
            text="👁️ Hide",
            width=90,
            height=34,
            fg_color="#334155",
            hover_color="#475569",
            command=self.toggle_password_mask,
        )
        self.btn_toggle_mask.pack(side="left", padx=(0, 8))

        self.btn_copy = ctk.CTkButton(
            btn_row,
            text="📋 Copy to Clipboard",
            height=34,
            fg_color="#0284c7",
            hover_color="#0369a1",
            command=self.copy_current_password,
        )
        self.btn_copy.pack(side="left", fill="x", expand=True, padx=(0, 8))

        self.btn_generate_inline = ctk.CTkButton(
            btn_row,
            text="🔄 Refresh",
            width=100,
            height=34,
            fg_color="#2563eb",
            hover_color="#1d4ed8",
            command=self.on_generate_password,
        )
        self.btn_generate_inline.pack(side="right")

        # Copy Confirmation Banner / Status
        self.status_label = ctk.CTkLabel(
            display_card,
            text="",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#10b981",
        )
        self.status_label.pack(pady=(0, 8))

        # Strength Meter Card
        strength_card = ctk.CTkFrame(self.main_container, fg_color="#1e293b", corner_radius=12)
        strength_card.pack(fill="x", pady=(0, 14), padx=2)

        st_header = ctk.CTkFrame(strength_card, fg_color="transparent")
        st_header.pack(fill="x", padx=16, pady=(12, 6))

        ctk.CTkLabel(
            st_header,
            text="Security Strength",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#f8fafc",
        ).pack(side="left")

        self.strength_badge = ctk.CTkLabel(
            st_header,
            text="Strong",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#10b981",
        )
        self.strength_badge.pack(side="right")

        self.strength_bar = ctk.CTkProgressBar(strength_card, height=10, corner_radius=5)
        self.strength_bar.pack(fill="x", padx=16, pady=(0, 8))
        self.strength_bar.set(0.85)

        self.entropy_label = ctk.CTkLabel(
            strength_card,
            text="Entropy: ~98.4 bits • Crack time: Centuries",
            font=ctk.CTkFont(size=12),
            text_color="#94a3b8",
        )
        self.entropy_label.pack(anchor="w", padx=16, pady=(0, 12))

        # Controls & Options Card
        opts_card = ctk.CTkFrame(self.main_container, fg_color="#1e293b", corner_radius=12)
        opts_card.pack(fill="x", pady=(0, 14), padx=2)

        # Length slider header
        len_header = ctk.CTkFrame(opts_card, fg_color="transparent")
        len_header.pack(fill="x", padx=16, pady=(14, 4))

        ctk.CTkLabel(
            len_header,
            text="Password Length (8 - 128 characters)",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#f8fafc",
        ).pack(side="left")

        self.length_val_label = ctk.CTkLabel(
            len_header,
            text="16",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#38bdf8",
        )
        self.length_val_label.pack(side="right")

        self.length_slider = ctk.CTkSlider(
            opts_card,
            from_=8,
            to=128,
            number_of_steps=120,
            command=self._on_slider_change,
        )
        self.length_slider.set(16)
        self.length_slider.pack(fill="x", padx=16, pady=(0, 14))

        # Character Selection Checkboxes
        char_title = ctk.CTkLabel(
            opts_card,
            text="Character Categories (Min 2 required)",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#f8fafc",
        )
        char_title.pack(anchor="w", padx=16, pady=(0, 8))

        self.var_upper = ctk.BooleanVar(value=True)
        self.var_lower = ctk.BooleanVar(value=True)
        self.var_digits = ctk.BooleanVar(value=True)
        self.var_symbols = ctk.BooleanVar(value=True)
        self.var_exclude_ambig = ctk.BooleanVar(value=False)
        self.var_auto_copy = ctk.BooleanVar(value=True)

        chk_grid = ctk.CTkFrame(opts_card, fg_color="transparent")
        chk_grid.pack(fill="x", padx=16, pady=(0, 10))

        c1 = ctk.CTkCheckBox(chk_grid, text="Uppercase (A-Z)", variable=self.var_upper, command=self._on_option_change)
        c1.grid(row=0, column=0, sticky="w", pady=4, padx=(0, 10))

        c2 = ctk.CTkCheckBox(chk_grid, text="Lowercase (a-z)", variable=self.var_lower, command=self._on_option_change)
        c2.grid(row=0, column=1, sticky="w", pady=4)

        c3 = ctk.CTkCheckBox(chk_grid, text="Numbers (0-9)", variable=self.var_digits, command=self._on_option_change)
        c3.grid(row=1, column=0, sticky="w", pady=4, padx=(0, 10))

        c4 = ctk.CTkCheckBox(chk_grid, text="Special Symbols (!@#$%)", variable=self.var_symbols, command=self._on_option_change)
        c4.grid(row=1, column=1, sticky="w", pady=4)

        # Ambiguous characters checkbox
        ctk.CTkCheckBox(
            opts_card,
            text="Exclude Ambiguous Characters (0, O, l, 1)",
            variable=self.var_exclude_ambig,
            command=self._on_option_change,
        ).pack(anchor="w", padx=16, pady=(4, 6))

        # Auto-copy checkbox
        ctk.CTkCheckBox(
            opts_card,
            text="Auto-copy password to clipboard on generation",
            variable=self.var_auto_copy,
        ).pack(anchor="w", padx=16, pady=(0, 16))

        # Primary Generate Button
        self.btn_generate_main = ctk.CTkButton(
            self.main_container,
            text="⚡ Generate Password",
            font=ctk.CTkFont(size=15, weight="bold"),
            height=46,
            fg_color="#0284c7",
            hover_color="#0369a1",
            command=self.on_generate_password,
        )
        self.btn_generate_main.pack(fill="x", pady=(0, 16), padx=2)

        # History Panel
        hist_card = ctk.CTkFrame(self.main_container, fg_color="#1e293b", corner_radius=12)
        hist_card.pack(fill="x", pady=(0, 10), padx=2)

        hist_header = ctk.CTkFrame(hist_card, fg_color="transparent")
        hist_header.pack(fill="x", padx=16, pady=(12, 8))

        ctk.CTkLabel(
            hist_header,
            text="Recent History (Last 5 - Memory Only)",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#f8fafc",
        ).pack(side="left")

        ctk.CTkButton(
            hist_header,
            text="Clear History",
            width=90,
            height=26,
            fg_color="#ef4444",
            hover_color="#dc2626",
            command=self.clear_history,
        ).pack(side="right")

        self.hist_items_frame = ctk.CTkFrame(hist_card, fg_color="transparent")
        self.hist_items_frame.pack(fill="x", padx=16, pady=(0, 14))

    # -------------------------------------------------------------
    # Standard Tkinter Dark UI fallback (if customtkinter not available)
    # -------------------------------------------------------------
    def _create_standard_tkinter_ui(self) -> None:
        self.main_container = tk.Frame(self.root, bg="#0f172a")
        self.main_container.pack(fill="both", expand=True, padx=20, pady=16)

        # Title
        tk.Label(
            self.main_container,
            text="🛡️ SecurePass",
            font=("Helvetica", 20, "bold"),
            fg="#38bdf8",
            bg="#0f172a",
        ).pack(anchor="w")

        tk.Label(
            self.main_container,
            text="Cryptographically Secure CSPRNG Password Generator",
            font=("Helvetica", 10),
            fg="#94a3b8",
            bg="#0f172a",
        ).pack(anchor="w", pady=(0, 12))

        # Password display entry
        self.pass_display_var = tk.StringVar(value="")
        self.pass_entry = tk.Entry(
            self.main_container,
            textvariable=self.pass_display_var,
            font=("Courier", 14, "bold"),
            bg="#1e293b",
            fg="#38bdf8",
            insertbackground="#38bdf8",
            relief="flat",
        )
        self.pass_entry.pack(fill="x", ipady=8, pady=(0, 8))

        # Action buttons
        btn_bar = tk.Frame(self.main_container, bg="#0f172a")
        btn_bar.pack(fill="x", pady=(0, 10))

        self.btn_toggle_mask = tk.Button(
            btn_bar,
            text="👁️ Hide",
            bg="#334155",
            fg="#ffffff",
            relief="flat",
            command=self.toggle_password_mask,
        )
        self.btn_toggle_mask.pack(side="left", padx=(0, 6))

        self.btn_copy = tk.Button(
            btn_bar,
            text="📋 Copy to Clipboard",
            bg="#0284c7",
            fg="#ffffff",
            relief="flat",
            command=self.copy_current_password,
        )
        self.btn_copy.pack(side="left", fill="x", expand=True, padx=(0, 6))

        tk.Button(
            btn_bar,
            text="🔄 Refresh",
            bg="#2563eb",
            fg="#ffffff",
            relief="flat",
            command=self.on_generate_password,
        ).pack(side="right")

        self.status_label = tk.Label(
            self.main_container,
            text="",
            font=("Helvetica", 10, "bold"),
            fg="#10b981",
            bg="#0f172a",
        )
        self.status_label.pack(pady=(0, 6))

        # Strength Bar
        self.strength_badge = tk.Label(
            self.main_container,
            text="Strength: Strong",
            font=("Helvetica", 11, "bold"),
            fg="#10b981",
            bg="#0f172a",
        )
        self.strength_badge.pack(anchor="w")

        self.entropy_label = tk.Label(
            self.main_container,
            text="",
            font=("Helvetica", 9),
            fg="#94a3b8",
            bg="#0f172a",
        )
        self.entropy_label.pack(anchor="w", pady=(0, 10))

        # Length Slider
        len_frame = tk.Frame(self.main_container, bg="#0f172a")
        len_frame.pack(fill="x", pady=(0, 6))
        tk.Label(len_frame, text="Password Length (8-128):", fg="#f8fafc", bg="#0f172a").pack(side="left")
        self.length_val_label = tk.Label(len_frame, text="16", font=("Helvetica", 11, "bold"), fg="#38bdf8", bg="#0f172a")
        self.length_val_label.pack(side="right")

        self.length_scale = tk.Scale(
            self.main_container,
            from_=8,
            to=128,
            orient="horizontal",
            bg="#1e293b",
            fg="#ffffff",
            highlightthickness=0,
            command=self._on_slider_change,
        )
        self.length_scale.set(16)
        self.length_scale.pack(fill="x", pady=(0, 10))

        # Options
        self.var_upper = tk.BooleanVar(value=True)
        self.var_lower = tk.BooleanVar(value=True)
        self.var_digits = tk.BooleanVar(value=True)
        self.var_symbols = tk.BooleanVar(value=True)
        self.var_exclude_ambig = tk.BooleanVar(value=False)
        self.var_auto_copy = tk.BooleanVar(value=True)

        for text, var in [
            ("Uppercase (A-Z)", self.var_upper),
            ("Lowercase (a-z)", self.var_lower),
            ("Numbers (0-9)", self.var_digits),
            ("Special Symbols (!@#$%)", self.var_symbols),
            ("Exclude Ambiguous Characters (0, O, l, 1)", self.var_exclude_ambig),
            ("Auto-copy to clipboard on generation", self.var_auto_copy),
        ]:
            tk.Checkbutton(
                self.main_container,
                text=text,
                variable=var,
                bg="#0f172a",
                fg="#f8fafc",
                selectcolor="#1e293b",
                activebackground="#0f172a",
                activeforeground="#ffffff",
                command=self._on_option_change,
            ).pack(anchor="w")

        tk.Button(
            self.main_container,
            text="⚡ Generate Password",
            font=("Helvetica", 12, "bold"),
            bg="#0284c7",
            fg="#ffffff",
            relief="flat",
            command=self.on_generate_password,
        ).pack(fill="x", pady=12, ipady=6)

        # History Frame
        hist_header = tk.Frame(self.main_container, bg="#0f172a")
        hist_header.pack(fill="x", pady=(8, 4))
        tk.Label(hist_header, text="History (Last 5 - Memory Only):", fg="#f8fafc", bg="#0f172a", font=("Helvetica", 10, "bold")).pack(side="left")
        tk.Button(hist_header, text="Clear", bg="#ef4444", fg="#ffffff", relief="flat", command=self.clear_history).pack(side="right")

        self.hist_items_frame = tk.Frame(self.main_container, bg="#1e293b")
        self.hist_items_frame.pack(fill="x", pady=4)

    # -------------------------------------------------------------
    # Event Handlers and Core Logic
    # -------------------------------------------------------------
    def _on_slider_change(self, value: float) -> None:
        length_val = int(float(value))
        self.length_val_label.configure(text=str(length_val))

    def _on_option_change(self) -> None:
        pass

    def get_config(self) -> GeneratorConfig:
        length = int(float(self.length_slider.get())) if _USE_CUSTOMTKINTER else self.length_scale.get()
        return GeneratorConfig(
            length=length,
            use_uppercase=self.var_upper.get(),
            use_lowercase=self.var_lower.get(),
            use_digits=self.var_digits.get(),
            use_symbols=self.var_symbols.get(),
            exclude_ambiguous=self.var_exclude_ambig.get(),
        )

    def on_generate_password(self) -> None:
        """Generates a new password, evaluates strength, updates display, and handles auto-copy."""
        try:
            config = self.get_config()
            new_password = generate_password(config)
            self._current_password = new_password

            # Add to memory-only history
            self._history.appendleft(new_password)

            # Update display
            self._update_display()

            # Evaluate strength
            strength = StrengthEvaluator.evaluate(new_password)
            self._update_strength_ui(strength)

            # Refresh history view
            self._render_history()

            # Handle auto-copy
            if self.var_auto_copy.get():
                success, msg = ClipboardManager.copy(new_password)
                if success:
                    self.show_status("⚡ Password generated & copied to clipboard!", "#10b981")
                else:
                    self.show_status("Password generated (Clipboard not available)", "#eab308")
            else:
                self.show_status("New password generated successfully.", "#38bdf8")

        except PasswordGenerationError as err:
            self.show_status(f"Error: {str(err)}", "#ef4444")
        except Exception as err:
            self.show_status(f"Unexpected error: {str(err)}", "#ef4444")

    def toggle_password_mask(self) -> None:
        self._is_password_masked = not self._is_password_masked
        self._update_display()
        btn_text = "👁️ Show" if self._is_password_masked else "👁️ Hide"
        if _USE_CUSTOMTKINTER:
            self.btn_toggle_mask.configure(text=btn_text)
        else:
            self.btn_toggle_mask.config(text=btn_text)

    def _update_display(self) -> None:
        if self._is_password_masked:
            masked = "•" * len(self._current_password)
            self.pass_display_var.set(masked)
        else:
            self.pass_display_var.set(self._current_password)

    def _update_strength_ui(self, strength: PasswordStrength) -> None:
        color_map = {
            StrengthLevel.STRONG: ("#10b981", 1.0),
            StrengthLevel.MEDIUM: ("#f59e0b", 0.65),
            StrengthLevel.WEAK: ("#ef4444", 0.3),
        }
        color, progress = color_map.get(strength.level, ("#ef4444", 0.2))

        badge_text = f"{strength.level.value} ({strength.score}/100)"
        entropy_text = f"Entropy: {strength.entropy_bits} bits • Brute-force resistance: ~{strength.crack_time_display}"

        if _USE_CUSTOMTKINTER:
            self.strength_badge.configure(text=badge_text, text_color=color)
            self.strength_bar.configure(progress_color=color)
            self.strength_bar.set(progress)
            self.entropy_label.configure(text=entropy_text)
        else:
            self.strength_badge.config(text=f"Strength: {badge_text}", fg=color)
            self.entropy_label.config(text=entropy_text)

    def copy_current_password(self) -> None:
        if not self._current_password:
            self.show_status("No password to copy.", "#ef4444")
            return
        success, msg = ClipboardManager.copy(self._current_password)
        if success:
            self.show_status("✅ Copied to clipboard!", "#10b981")
        else:
            self.show_status(f"⚠️ {msg}", "#ef4444")

    def copy_history_entry(self, entry: str) -> None:
        success, msg = ClipboardManager.copy(entry)
        if success:
            self.show_status(f"Copied '{entry[:4]}...' to clipboard!", "#10b981")
        else:
            self.show_status(f"⚠️ {msg}", "#ef4444")

    def clear_history(self) -> None:
        self._history.clear()
        self._render_history()
        self.show_status("Password history wiped from memory.", "#94a3b8")

    def _render_history(self) -> None:
        for widget in self.hist_items_frame.winfo_children():
            widget.destroy()

        if not self._history:
            if _USE_CUSTOMTKINTER:
                lbl = ctk.CTkLabel(
                    self.hist_items_frame,
                    text="No previous passwords in session memory.",
                    text_color="#64748b",
                    font=ctk.CTkFont(size=12, slant="italic"),
                )
                lbl.pack(pady=8)
            else:
                lbl = tk.Label(
                    self.hist_items_frame,
                    text="No previous passwords in session memory.",
                    fg="#64748b",
                    bg="#1e293b",
                    font=("Helvetica", 9, "italic"),
                )
                lbl.pack(pady=6)
            return

        for idx, pwd in enumerate(self._history):
            truncated = pwd if len(pwd) <= 32 else f"{pwd[:28]}..."
            if _USE_CUSTOMTKINTER:
                row = ctk.CTkFrame(self.hist_items_frame, fg_color="#0f172a", corner_radius=6)
                row.pack(fill="x", pady=2, padx=2)

                lbl = ctk.CTkLabel(
                    row,
                    text=f"#{idx+1}  {truncated}",
                    font=ctk.CTkFont(family="Courier", size=12),
                    text_color="#cbd5e1",
                )
                lbl.pack(side="left", padx=8, pady=6)

                btn = ctk.CTkButton(
                    row,
                    text="Copy",
                    width=60,
                    height=24,
                    font=ctk.CTkFont(size=11),
                    fg_color="#334155",
                    hover_color="#475569",
                    command=lambda p=pwd: self.copy_history_entry(p),
                )
                btn.pack(side="right", padx=6, pady=4)
            else:
                row = tk.Frame(self.hist_items_frame, bg="#0f172a")
                row.pack(fill="x", pady=2, padx=2)

                lbl = tk.Label(
                    row,
                    text=f"#{idx+1}  {truncated}",
                    font=("Courier", 10),
                    fg="#cbd5e1",
                    bg="#0f172a",
                )
                lbl.pack(side="left", padx=6, pady=4)

                btn = tk.Button(
                    row,
                    text="Copy",
                    bg="#334155",
                    fg="#ffffff",
                    relief="flat",
                    font=("Helvetica", 9),
                    command=lambda p=pwd: self.copy_history_entry(p),
                )
                btn.pack(side="right", padx=6, pady=2)

    def show_status(self, message: str, color_hex: str = "#10b981") -> None:
        if _USE_CUSTOMTKINTER:
            self.status_label.configure(text=message, text_color=color_hex)
        else:
            self.status_label.config(text=message, fg=color_hex)

    def run(self) -> None:
        if self.root:
            self.root.mainloop()
