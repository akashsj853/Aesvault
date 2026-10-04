import React, { useState } from 'react';
import { Code2, Copy, Download, Check, FileCode, Terminal } from 'lucide-react';
import { PYTHON_PROJECT_FILES, ProjectFile } from '../data/pythonFiles';

export const CodeExplorerPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-cyan-400" />
            <span>Python / Flask Project Repository</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete, runnable Python codebase ready to execute locally on <code className="text-cyan-300 font-mono">http://127.0.0.1:5000</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleDownloadSingle}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Terminal Quick Run Instructions */}
      <div className="p-4 rounded-xl bg-[#080C14] border border-cyan-500/20 font-mono text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Terminal className="w-4 h-4" />
          <span>Local Python Execution Commands (macOS / Linux / Windows):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400">
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/5">
            <p className="text-emerald-400 font-semibold mb-1">macOS / Linux:</p>
            <code>python3 -m venv venv && source venv/bin/activate</code><br />
            <code>pip install -r requirements.txt</code><br />
            <code className="text-white font-bold">python3 app.py</code>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/5">
            <p className="text-cyan-400 font-semibold mb-1">Windows (PowerShell):</p>
            <code>python -m venv venv; .\venv\Scripts\Activate.ps1</code><br />
            <code>pip install -r requirements.txt</code><br />
            <code className="text-white font-bold">python app.py</code>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left File List */}
        <div className="lg:col-span-4 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 px-2 tracking-wider block mb-2">Project Files</span>
          {PYTHON_PROJECT_FILES.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                selectedFile.path === file.path
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                  : 'bg-[#111827] border border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                selectedFile.path === file.path ? 'text-cyan-400' : 'text-slate-500'
              }`} />
              <div className="overflow-hidden">
                <p className="font-mono font-bold truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{file.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-8 rounded-2xl bg-[#090C15] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
          <div className="px-4 py-3 bg-[#111827] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-300 font-bold ml-2">{selectedFile.path}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{selectedFile.content.split('\n').length} lines</span>
          </div>

          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[550px] overflow-y-auto">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
