import React from 'react';
import { Sliders, Sparkles, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { GeneratorConfig } from '../generator/passwordGenerator';

interface ControlsProps {
  config: GeneratorConfig;
  onChange: (newConfig: GeneratorConfig) => void;
  onGenerate: () => void;
  autoCopy: boolean;
  setAutoCopy: (val: boolean) => void;
  validationError: string | null;
}

export const Controls: React.FC<ControlsProps> = ({
  config,
  onChange,
  onGenerate,
  autoCopy,
  setAutoCopy,
  validationError,
}) => {
  const activeCategoriesCount = [
    config.useUppercase,
    config.useLowercase,
    config.useDigits,
    config.useSymbols,
  ].filter(Boolean).length;

  const quickLengths = [8, 12, 16, 24, 32, 64, 128];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange({ ...config, length: val });
  };

  const handleCheckboxToggle = (key: keyof GeneratorConfig) => {
    onChange({ ...config, [key]: !config[key] });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Generator Configuration
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Security Policy: Min 2 Categories
        </span>
      </div>

      {/* 1. Password Length Slider & Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="length-slider" className="text-xs font-semibold text-slate-300">
            Password Length
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">(8 - 128)</span>
            <input
              id="length-number-input"
              type="number"
              min={8}
              max={128}
              value={config.length}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onChange({ ...config, length: Math.min(128, Math.max(8, val)) });
                }
              }}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300 font-mono font-bold text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
              aria-label="Direct password length numeric input"
            />
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            id="length-slider"
            type="range"
            min={8}
            max={128}
            value={config.length}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
            <span>8 (Min)</span>
            <span>32</span>
            <span>64</span>
            <span>96</span>
            <span>128 (Max)</span>
          </div>
        </div>

        {/* Quick Length Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
          {quickLengths.map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => onChange({ ...config, length: len })}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                config.length === len
                  ? 'bg-cyan-600 text-white font-bold ring-1 ring-cyan-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {len}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Character Categories Checkboxes (Min 2 required) */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            Character Categories
            <span className="text-[11px] font-normal text-slate-400">
              ({activeCategoriesCount}/4 selected)
            </span>
          </span>
          {activeCategoriesCount < 2 && (
            <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Requires at least 2
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Uppercase */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
            config.useUppercase
              ? 'bg-slate-800/70 border-cyan-500/50 text-white'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={config.useUppercase}
              onChange={() => handleCheckboxToggle('useUppercase')}
              className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-semibold text-slate-200">Uppercase Letters</div>
              <div className="text-[11px] font-mono text-cyan-400">A B C D E F G ...</div>
            </div>
          </label>

          {/* Lowercase */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
            config.useLowercase
              ? 'bg-slate-800/70 border-cyan-500/50 text-white'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={config.useLowercase}
              onChange={() => handleCheckboxToggle('useLowercase')}
              className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-semibold text-slate-200">Lowercase Letters</div>
              <div className="text-[11px] font-mono text-blue-300">a b c d e f g ...</div>
            </div>
          </label>

          {/* Numbers */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
            config.useDigits
              ? 'bg-slate-800/70 border-cyan-500/50 text-white'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={config.useDigits}
              onChange={() => handleCheckboxToggle('useDigits')}
              className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-semibold text-slate-200">Decimal Numbers</div>
              <div className="text-[11px] font-mono text-emerald-400">0 1 2 3 4 5 6 7 8 9</div>
            </div>
          </label>

          {/* Special Symbols */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
            config.useSymbols
              ? 'bg-slate-800/70 border-cyan-500/50 text-white'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={config.useSymbols}
              onChange={() => handleCheckboxToggle('useSymbols')}
              className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-semibold text-slate-200">Special Symbols</div>
              <div className="text-[11px] font-mono text-amber-400">! @ # $ % ^ & * ( ) _ -</div>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Ambiguous Characters & Auto-Copy Settings */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
          config.excludeAmbiguous
            ? 'bg-slate-800/70 border-amber-500/50'
            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
        }`}>
          <input
            type="checkbox"
            checked={config.excludeAmbiguous}
            onChange={() => handleCheckboxToggle('excludeAmbiguous')}
            className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-4 h-4 cursor-pointer"
          />
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              Exclude Ambiguous Characters
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/50">
                0, O, l, 1
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Prevents confusion between uppercase "O" and digit "0", and lowercase "l" and number "1".
            </div>
          </div>
        </label>

        {/* Auto-copy toggle */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">
              Auto-copy password to clipboard on generation
            </span>
          </div>
          <input
            type="checkbox"
            checked={autoCopy}
            onChange={(e) => setAutoCopy(e.target.checked)}
            className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {/* Validation Banner if Invalid */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Primary Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={activeCategoriesCount < 2}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
          activeCategoriesCount < 2
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30 active:scale-[0.99]'
        }`}
      >
        <Sparkles className="w-4 h-4 text-cyan-200" />
        <span>Generate Secure Password</span>
      </button>
    </div>
  );
};
