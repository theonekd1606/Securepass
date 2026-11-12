import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { StrengthResult } from '../generator/strengthChecker';

interface StrengthMeterProps {
  strength: StrengthResult;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ strength }) => {
  const getBadgeStyle = () => {
    switch (strength.level) {
      case 'Strong':
        return {
          bg: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
          barColor: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          percent: Math.min(100, Math.max(75, strength.score)),
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        };
      case 'Medium':
        return {
          bg: 'bg-amber-950/80 border-amber-700/60 text-amber-300',
          barColor: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          percent: Math.min(74, Math.max(45, strength.score)),
          icon: <Zap className="w-4 h-4 text-amber-400" />,
        };
      case 'Weak':
      default:
        return {
          bg: 'bg-rose-950/80 border-rose-700/60 text-rose-300',
          barColor: 'bg-gradient-to-r from-rose-600 to-red-500',
          percent: Math.min(44, Math.max(15, strength.score)),
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Password Strength & Entropy
        </span>

        {/* Dynamic Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg}`}
        >
          {style.icon}
          <span>{strength.level}</span>
          <span className="opacity-70 text-[11px]">({strength.score}%)</span>
        </div>
      </div>

      {/* Visual Strength Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
          style={{ width: `${style.percent}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-slate-400 font-medium">Shannon Entropy</div>
            <div className="text-cyan-300 font-mono font-bold text-sm">
              {strength.entropyBits} bits
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <Clock className="w-4 h-4 text-teal-400 shrink-0" />
          <div>
            <div className="text-slate-400 font-medium">Offline Crack Resistance</div>
            <div className="text-teal-300 font-medium text-xs truncate" title={strength.crackTimeDisplay}>
              {strength.crackTimeDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* Security Criteria Breakdown */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-[11px]">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${strength.length >= 12 ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-400 bg-slate-800/40'}`}>
          {strength.length >= 12 ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
          <span>Length ≥ 12</span>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${strength.hasUppercase ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-400 bg-slate-800/40'}`}>
          {strength.hasUppercase ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
          <span>Uppercase (A-Z)</span>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${strength.hasLowercase ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-400 bg-slate-800/40'}`}>
          {strength.hasLowercase ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
          <span>Lowercase (a-z)</span>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${strength.hasDigits ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-400 bg-slate-800/40'}`}>
          {strength.hasDigits ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
          <span>Digits (0-9)</span>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${strength.hasSymbols ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-400 bg-slate-800/40'}`}>
          {strength.hasSymbols ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
          <span>Symbols (!@#)</span>
        </div>
      </div>
    </div>
  );
};
