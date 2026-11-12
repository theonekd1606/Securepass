import React from 'react';
import { ShieldCheck, Lock, Terminal, Cpu, Check, Layers, AlertTriangle } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8 text-slate-300">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          SecurePass Engineering & Security Specification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed cryptographic principles, memory-only session isolation, and platform requirements.
        </p>
      </div>

      {/* Security Threat Model & Defense */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4" />
          1. Cryptographic Randomness vs Pseudorandom Generators
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Vector / Consideration</th>
                <th className="p-3">Standard / Flawed Approach</th>
                <th className="p-3">SecurePass Implementation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              <tr>
                <td className="p-3 font-semibold text-slate-200">Random Engine</td>
                <td className="p-3 text-rose-300">Python <code className="bg-slate-800 px-1 py-0.5 rounded">random</code> (Mersenne Twister)</td>
                <td className="p-3 text-emerald-300">Python <code className="bg-slate-800 px-1 py-0.5 rounded">secrets</code> CSPRNG (/dev/urandom)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Category Inclusion</td>
                <td className="p-3 text-amber-300">Probabilistic (symbols might be missing in short lengths)</td>
                <td className="p-3 text-emerald-300">Strict allocation: guaranteed ≥1 character per active category</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Placement Unpredictability</td>
                <td className="p-3 text-amber-300">Deterministic prefix or standard <code className="bg-slate-800 px-1 py-0.5 rounded">random.shuffle</code></td>
                <td className="p-3 text-emerald-300">Fisher-Yates shuffle powered by <code className="bg-slate-800 px-1 py-0.5 rounded">secrets.randbelow</code></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Storage Forensics</td>
                <td className="p-3 text-rose-300">Saving history to JSON, SQLite, or disk log files</td>
                <td className="p-3 text-emerald-300">In-memory <code className="bg-slate-800 px-1 py-0.5 rounded">deque(maxlen=5)</code> only. Zero disk writes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Shannon Entropy Formula */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          2. Shannon Entropy & Brute Force Calculation
        </h3>
        <p className="text-xs leading-relaxed text-slate-400">
          The information entropy $E$ represents the number of binary bits required to encode the randomness of the password:
        </p>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-cyan-300 text-center">
          Entropy (bits) = Length × log₂(Character Pool Size)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40">
            <div className="font-bold text-rose-400">Weak (&lt; 50 bits)</div>
            <div className="text-slate-400 mt-1">Cracked in seconds to minutes by offline hash clusters.</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40">
            <div className="font-bold text-amber-400">Medium (50 - 74 bits)</div>
            <div className="text-slate-400 mt-1">Resistant to basic attacks; requires months to crack.</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
            <div className="font-bold text-emerald-400">Strong (≥ 75 bits)</div>
            <div className="text-slate-400 mt-1">Estimated crack time spans centuries; infeasible to brute force.</div>
          </div>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          3. How to Run Locally on Your Desktop
        </h3>
        <div className="space-y-2 text-xs">
          <p className="text-slate-300">1. Click "Download Python App (.zip)" in the header to export the source files.</p>
          <p className="text-slate-300">2. Extract the archive and install dependencies:</p>
          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 select-all">
cd SecurePass
pip install -r requirements.txt
          </pre>
          <p className="text-slate-300">3. Run the desktop GUI:</p>
          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 select-all">
python main.py
          </pre>
          <p className="text-slate-300">4. Run unit tests:</p>
          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 select-all">
python -m unittest discover -s tests
          </pre>
        </div>
      </div>
    </div>
  );
};
