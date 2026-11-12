import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Copy, Check } from 'lucide-react';
import { generatePassword, GeneratorConfig } from '../generator/passwordGenerator';
import { evaluateStrength } from '../generator/strengthChecker';

interface TerminalLog {
  id: string;
  command: string;
  output: string;
}

export const CliTerminal: React.FC = () => {
  const [commandInput, setCommandInput] = useState('python main.py --cli -l 24 --exclude-ambiguous');
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init',
      command: 'python -m unittest discover -s tests',
      output: `Ran 10 tests in 0.027s\n\nOK\n[INFO] All 10 security & entropy tests passed successfully.`,
    },
    {
      id: 'demo1',
      command: 'python main.py --cli -l 16',
      output: `============================================================\n  🛡️  SecurePass - Cryptographically Secure Password Tool  \n============================================================\n🔑 Generated Password: 7k#P9@xL2$vW1!zQ\n📊 Length:            16 characters\n💪 Security Strength: Strong (95/100)\n⚡ Entropy:           98.4 bits\n⏱️  Crack Resistance:  ~Centuries (virtually uncrackable)\n📋 Clipboard:         Copied to clipboard!\n============================================================`,
    },
  ]);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    let output = '';

    if (trimmed.includes('unittest') || trimmed.includes('pytest')) {
      output = `Ran 10 tests in 0.028s\n\nOK (10/10 passed)\n- test_default_generation: OK\n- test_length_boundaries: OK\n- test_minimum_two_categories_enforcement: OK\n- test_guaranteed_category_representation: OK\n- test_ambiguous_character_exclusion: OK\n- test_secure_shuffle_randomness: OK\n- test_strength_evaluator: OK`;
    } else if (trimmed.includes('--help') || trimmed === 'python main.py -h') {
      output = `usage: main.py [-h] [--cli] [-l LENGTH] [--no-upper] [--no-lower] [--no-digits]\n               [--no-symbols] [--exclude-ambiguous] [--copy]\n\nSecurePass – Cryptographically Secure Random Password Generator\n\noptions:\n  -h, --help            show this help message and exit\n  --cli                 Run in command-line mode instead of GUI\n  -l LENGTH, --length   Password length (8-128, default: 16)\n  --no-upper            Exclude uppercase letters (A-Z)\n  --no-lower            Exclude lowercase letters (a-z)\n  --no-digits           Exclude digits (0-9)\n  --no-symbols          Exclude special symbols\n  --exclude-ambiguous   Exclude ambiguous characters (0, O, l, 1)\n  --copy                Copy to clipboard on generation (default: True)`;
    } else if (trimmed.startsWith('python main.py')) {
      // Parse length
      let length = 16;
      const lenMatch = trimmed.match(/-l\s+(\d+)/) || trimmed.match(/--length\s+(\d+)/);
      if (lenMatch) {
        length = Math.min(128, Math.max(8, parseInt(lenMatch[1], 10)));
      }

      const excludeAmbig = trimmed.includes('--exclude-ambiguous');
      const noUpper = trimmed.includes('--no-upper');
      const noLower = trimmed.includes('--no-lower');
      const noDigits = trimmed.includes('--no-digits');
      const noSymbols = trimmed.includes('--no-symbols');

      const config: GeneratorConfig = {
        length,
        useUppercase: !noUpper,
        useLowercase: !noLower,
        useDigits: !noDigits,
        useSymbols: !noSymbols,
        excludeAmbiguous: excludeAmbig,
      };

      try {
        const password = generatePassword(config);
        const strength = evaluateStrength(password);
        output = `============================================================\n  🛡️  SecurePass - Cryptographically Secure Password Tool  \n============================================================\n🔑 Generated Password: ${password}\n📊 Length:            ${password.length} characters\n💪 Security Strength: ${strength.level} (${strength.score}/100)\n⚡ Entropy:           ${strength.entropyBits} bits\n⏱️  Crack Resistance:  ~${strength.crackTimeDisplay}\n📋 Clipboard:         Copied to clipboard!\n============================================================`;
      } catch (e: any) {
        output = `❌ Security Policy Error: ${e.message}`;
      }
    } else {
      output = `bash: command not found: ${trimmed}. Try: python main.py --cli -l 20`;
    }

    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        command: trimmed,
        output,
      },
    ]);
  };

  const handleCopyOutput = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-mono">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Interactive Terminal Emulator — SecurePass CLI</span>
        </div>

        <button
          type="button"
          onClick={() => setLogs([])}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear Terminal</span>
        </button>
      </div>

      {/* Preset Quick Commands */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800/80 text-xs">
        <span className="text-slate-500 font-sans text-[11px]">Quick Commands:</span>
        {[
          'python main.py --cli -l 24',
          'python main.py --cli -l 32 --exclude-ambiguous',
          'python main.py --help',
          'python -m unittest discover tests',
        ].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => {
              setCommandInput(cmd);
              executeCommand(cmd);
            }}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-[11px] border border-slate-700/60 transition cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 bg-slate-950 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4 text-xs">
        {logs.map((log) => (
          <div key={log.id} className="space-y-1 group">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="text-slate-500">user@desktop:~/SecurePass$</span>
                <span className="text-slate-200 font-bold">{log.command}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyOutput(log.id, log.output)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {copiedLogId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLogId === log.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
              {log.output}
            </pre>
          </div>
        ))}
      </div>

      {/* Interactive Command Input Line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand(commandInput);
        }}
        className="flex items-center gap-2 p-3 bg-slate-950 border-t border-slate-800"
      >
        <span className="text-emerald-400 text-xs shrink-0 select-none">
          user@desktop:~/SecurePass$&nbsp;
        </span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          className="flex-1 bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
          placeholder="Enter command (e.g., python main.py --cli -l 24)"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-sans font-semibold transition cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
