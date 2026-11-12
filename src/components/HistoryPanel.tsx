import React, { useState } from 'react';
import { History, Trash2, Copy, Check, Eye, EyeOff, Shield } from 'lucide-react';
import { PasswordHistoryItem } from '../types';

interface HistoryPanelProps {
  history: PasswordHistoryItem[];
  onClearHistory: () => void;
  onCopyEntry: (password: string, id: string) => void;
  copiedId: string | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onCopyEntry,
  copiedId,
}) => {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Password History
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Last {history.length} / 5
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Shield className="w-3 h-3 text-emerald-400" />
            In-Memory Only • Zero Disk Storage
          </span>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition cursor-pointer"
              title="Clear all generated passwords from memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs italic space-y-1">
          <p>No password history in current memory session.</p>
          <p className="text-[11px] text-slate-600">
            For security, passwords are never persisted to disk, database, or browser storage.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, index) => {
            const isRevealed = revealedIds.has(item.id);
            const isItemCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="text-xs font-mono font-bold text-slate-500 w-5 shrink-0">
                    #{index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs sm:text-sm text-cyan-300 truncate">
                      {isRevealed ? item.password : '•'.repeat(Math.min(24, item.length))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                      <span>{item.length} chars</span>
                      <span>•</span>
                      <span className={item.strength === 'Strong' ? 'text-emerald-400' : item.strength === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>
                        {item.strength} ({item.entropy} bits)
                      </span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Entry Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    title={isRevealed ? 'Mask entry' : 'Show entry'}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onCopyEntry(item.password, item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isItemCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title="Copy this password"
                  >
                    {isItemCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span className="text-[11px]">{isItemCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
