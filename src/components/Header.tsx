import React from 'react';
import { Shield, Lock, Terminal, FileCode, BookOpen, Sparkles, Download } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDownloadZip: () => void;
  isZipping: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  isZipping,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
      {/* OS Desktop Window Bar Simulation */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/60" />
          </div>
          <span className="text-slate-400 font-mono text-[11px] ml-2 font-medium flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-400" />
            SecurePass Desktop — Python CSPRNG Edition v1.0.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] bg-emerald-950/70 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CSPRNG Active • Zero Disk Writes
          </span>
          <button
            onClick={onDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer disabled:opacity-50"
            title="Download full Python project as ZIP file"
          >
            <Download className="w-3 h-3" />
            {isZipping ? 'Bundling...' : 'Download Python App (.zip)'}
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SecurePass
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Desktop Engine
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Secure Random Password Generator • Secrets Module & CustomTkinter
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800" aria-label="Navigation Tabs">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Desktop App
          </button>

          <button
            onClick={() => setActiveTab('python_code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'python_code'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Python Source
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            CLI Simulator
          </button>

          <button
            onClick={() => setActiveTab('documentation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'documentation'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Docs & Specs
          </button>
        </nav>
      </div>
    </header>
  );
};
