import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Download,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { PYTHON_FILES, PythonSourceFile } from '../data/pythonFiles';

interface PythonExplorerProps {
  onDownloadZip: () => void;
  isZipping: boolean;
}

export const PythonExplorer: React.FC<PythonExplorerProps> = ({
  onDownloadZip,
  isZipping,
}) => {
  const [selectedFile, setSelectedFile] = useState<PythonSourceFile>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/80 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              SecurePass Python Project Structure
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade modular architecture adhering to strict CSPRNG security principles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>10 Unit Tests Passing</span>
          </div>

          <button
            type="button"
            onClick={onDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md shadow-cyan-600/25 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isZipping ? 'Archiving...' : 'Download Project (.zip)'}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Sidebar File Tree & Code Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left Sidebar: File Tree */}
        <div className="md:col-span-4 border-r border-slate-800 p-3 bg-slate-950/50 space-y-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Workspace Files
          </div>

          <div className="space-y-1 text-xs">
            {/* Root item */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300 font-mono font-semibold">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>SecurePass/</span>
            </div>

            {/* Sub files list */}
            <div className="ml-4 pl-2 border-l border-slate-800 space-y-1">
              {PYTHON_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg font-mono transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 shrink-0 uppercase">
                      {file.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Terminal Command Hint */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Run Command</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-cyan-300 select-all border border-slate-800">
              python main.py
            </div>
            <div className="text-[11px] text-slate-400">
              Run <code className="text-cyan-400">python main.py --cli -l 24</code> for terminal mode.
            </div>
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="md:col-span-8 flex flex-col bg-slate-950">
          {/* File Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-200">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                — {selectedFile.description}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer text-xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 flex-1 overflow-auto max-h-[600px] font-mono text-xs text-slate-300 leading-relaxed select-text">
            <pre className="whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
