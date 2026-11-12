/**
 * SecurePass – Secure Random Password Generator
 * Desktop Application Engine & Simulator
 */

import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { PasswordDisplay } from './components/PasswordDisplay';
import { StrengthMeter } from './components/StrengthMeter';
import { Controls } from './components/Controls';
import { HistoryPanel } from './components/HistoryPanel';
import { PythonExplorer } from './components/PythonExplorer';
import { CliTerminal } from './components/CliTerminal';
import { DocumentationView } from './components/DocumentationView';
import {
  GeneratorConfig,
  generatePassword,
  validateConfig,
  PasswordGenerationError,
} from './generator/passwordGenerator';
import { evaluateStrength, StrengthResult } from './generator/strengthChecker';
import { PasswordHistoryItem, ActiveTab } from './types';
import { PYTHON_FILES } from './data/pythonFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');

  // Generator configuration
  const [config, setConfig] = useState<GeneratorConfig>({
    length: 16,
    useUppercase: true,
    useLowercase: true,
    useDigits: true,
    useSymbols: true,
    excludeAmbiguous: false,
  });

  const [autoCopy, setAutoCopy] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [strength, setStrength] = useState<StrengthResult>(() => evaluateStrength(''));
  const [history, setHistory] = useState<PasswordHistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  // Core password generation function
  const handleGenerate = useCallback(() => {
    try {
      validateConfig(config);
      setValidationError(null);

      const newPass = generatePassword(config);
      setCurrentPassword(newPass);

      const strResult = evaluateStrength(newPass);
      setStrength(strResult);

      // Add to in-memory history (last 5 only, strictly in RAM)
      const newItem: PasswordHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        password: newPass,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        length: newPass.length,
        strength: strResult.level,
        entropy: strResult.entropyBits,
      };

      setHistory((prev) => [newItem, ...prev.slice(0, 4)]);

      // Auto-copy if enabled
      if (autoCopy) {
        navigator.clipboard.writeText(newPass).then(() => {
          setIsCopied(true);
          setStatusMessage('Auto-copied to clipboard!');
          setTimeout(() => {
            setIsCopied(false);
            setStatusMessage('');
          }, 2500);
        }).catch(() => {
          setStatusMessage('Password generated');
        });
      } else {
        setStatusMessage('Password generated');
        setTimeout(() => setStatusMessage(''), 2500);
      }
    } catch (err: any) {
      if (err instanceof PasswordGenerationError) {
        setValidationError(err.message);
      } else {
        setValidationError(err?.message || 'Failed to generate password.');
      }
    }
  }, [config, autoCopy]);

  // Initial generation on first mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // Update validation status live when config changes
  const handleConfigChange = (newConfig: GeneratorConfig) => {
    setConfig(newConfig);
    try {
      validateConfig(newConfig);
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  // Manual copy handler for current password
  const handleCopyCurrent = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setStatusMessage('Copied to clipboard!');
      setTimeout(() => {
        setIsCopied(false);
        setStatusMessage('');
      }, 2000);
    });
  };

  // Manual copy handler for a history item
  const handleCopyHistory = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // Clear in-memory history
  const handleClearHistory = () => {
    setHistory([]);
    setStatusMessage('History wiped from memory');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  // Download entire Python package as .zip
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const folder = zip.folder('SecurePass');

      if (folder) {
        PYTHON_FILES.forEach((file) => {
          // Remove the SecurePass/ prefix for the inner structure
          const relativePath = file.path.replace(/^SecurePass\//, '');
          folder.file(relativePath, file.code);
        });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SecurePass_Python_App.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP archive:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadZip={handleDownloadZip}
        isZipping={isZipping}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Password Display Field */}
            <PasswordDisplay
              password={currentPassword}
              onRefresh={handleGenerate}
              onCopy={handleCopyCurrent}
              isCopied={isCopied}
              statusMessage={statusMessage}
            />

            {/* Strength Meter Bar & Metrics */}
            <StrengthMeter strength={strength} />

            {/* Split Grid: Generator Controls & History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Configuration Controls (7 cols) */}
              <div className="lg:col-span-7">
                <Controls
                  config={config}
                  onChange={handleConfigChange}
                  onGenerate={handleGenerate}
                  autoCopy={autoCopy}
                  setAutoCopy={setAutoCopy}
                  validationError={validationError}
                />
              </div>

              {/* Right Column: In-Memory History (5 cols) */}
              <div className="lg:col-span-5">
                <HistoryPanel
                  history={history}
                  onClearHistory={handleClearHistory}
                  onCopyEntry={handleCopyHistory}
                  copiedId={copiedId}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'python_code' && (
          <PythonExplorer
            onDownloadZip={handleDownloadZip}
            isZipping={isZipping}
          />
        )}

        {activeTab === 'terminal' && <CliTerminal />}

        {activeTab === 'documentation' && <DocumentationView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SecurePass</span>
            <span>—</span>
            <span>Cryptographically Secure CSPRNG Password Tool</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Python 3.10+ • secrets • CustomTkinter • pyperclip
          </div>
        </div>
      </footer>
    </div>
  );
}
