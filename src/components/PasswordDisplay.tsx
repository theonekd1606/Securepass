import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, RefreshCw, Palette } from 'lucide-react';

interface PasswordDisplayProps {
  password: string;
  onRefresh: () => void;
  onCopy: (text: string) => void;
  isCopied: boolean;
  statusMessage?: string;
}

export const PasswordDisplay: React.FC<PasswordDisplayProps> = ({
  password,
  onRefresh,
  onCopy,
  isCopied,
  statusMessage,
}) => {
  const [isMasked, setIsMasked] = useState(false);
  const [colorize, setColorize] = useState(true);

  // Render character with category color
  const renderCharacter = (char: string, index: number) => {
    if (isMasked) {
      return (
        <span key={index} className="text-slate-400 select-none">
          •
        </span>
      );
    }

    if (!colorize) {
      return (
        <span key={index} className="text-cyan-300">
          {char}
        </span>
      );
    }

    if (/[A-Z]/.test(char)) {
      return (
        <span key={index} className="text-cyan-400 font-semibold" title="Uppercase Letter">
          {char}
        </span>
      );
    }
    if (/[a-z]/.test(char)) {
      return (
        <span key={index} className="text-blue-300" title="Lowercase Letter">
          {char}
        </span>
      );
    }
    if (/[0-9]/.test(char)) {
      return (
        <span key={index} className="text-emerald-400 font-bold" title="Number">
          {char}
        </span>
      );
    }
    return (
      <span key={index} className="text-amber-400 font-bold" title="Special Symbol">
        {char}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <label htmlFor="password-field" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          Generated Password
          <span className="text-[11px] font-mono text-cyan-400/80 lowercase bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
            {password.length} chars
          </span>
        </label>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setColorize(!colorize)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
              colorize
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50'
                : 'text-slate-400 hover:text-slate-300 bg-slate-800/60'
            }`}
            title="Toggle character category color-coding"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Colorize</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
            title={isMasked ? 'Reveal password' : 'Hide password'}
          >
            {isMasked ? (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Password Box */}
      <div
        id="password-field"
        tabIndex={0}
        aria-label="Generated password display"
        className="w-full min-h-[58px] bg-slate-950 border border-slate-800/90 rounded-xl px-4 py-3 font-mono text-lg sm:text-xl tracking-wider break-all flex items-center justify-between gap-3 shadow-inner select-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        <div className="flex flex-wrap items-center gap-[0.5px]">
          {password ? (
            password.split('').map((c, i) => renderCharacter(c, i))
          ) : (
            <span className="text-slate-500 text-sm italic">Click Generate below...</span>
          )}
        </div>
      </div>

      {/* Character Type Legend */}
      {colorize && !isMasked && (
        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span className="text-cyan-400 font-semibold">A-Z</span> Uppercase
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />
            <span className="text-blue-300">a-z</span> Lowercase
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-400 font-bold">0-9</span> Numbers
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-400 font-bold">!#$</span> Symbols
          </span>
        </div>
      )}

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopy(password)}
            disabled={!password}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              isCopied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 active:scale-95'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-100" /> : <Copy className="w-4 h-4" />}
            {isCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95"
            title="Generate another password with same settings"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Generate Another</span>
          </button>
        </div>

        {/* Status Confirmation Badge */}
        {statusMessage && (
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 animate-fade-in flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};
