import React, { useState, useRef } from 'react';
import { 
  Lock, 
  Upload, 
  FileText, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { generateAESKey, encryptFilePackage } from '../crypto/aesEngine';
import { User, recordFileOperation } from '../data/storage';

interface EncryptPageProps {
  currentUser: User;
  onSuccessDone?: () => void;
}

export const EncryptPage: React.FC<EncryptPageProps> = ({ currentUser }) => {
  const [file, setFile] = useState<File | null>(null);
  const [aesKey, setAesKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [encryptedBlobUrl, setEncryptedBlobUrl] = useState<string | null>(null);
  const [encryptedFilename, setEncryptedFilename] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateKey = () => {
    const newKey = generateAESKey();
    setAesKey(newKey);
    setShowKey(true);
  };

  const handleCopyKey = () => {
    if (!aesKey) return;
    navigator.clipboard.writeText(aesKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadKey = () => {
    if (!aesKey) return;
    const blob = new Blob([aesKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aesvault_secret_${Date.now()}.key`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setErrorMsg(null);
    if (f.size > 100 * 1024 * 1024) {
      setErrorMsg("File exceeds the 100 MB limit.");
      return;
    }
    setFile(f);
    if (!aesKey) {
      handleGenerateKey();
    }
  };

  const handleEncryptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!file) {
      setErrorMsg("Please select a file to encrypt.");
      return;
    }
    if (!aesKey.trim()) {
      setErrorMsg("Please generate or enter a 256-bit AES key.");
      return;
    }

    try {
      setIsEncrypting(true);
      setProgressStep(1); // Preparing file

      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

      await new Promise(r => setTimeout(r, 200));
      setProgressStep(2); // Generating 12-byte nonce

      await new Promise(r => setTimeout(r, 250));
      setProgressStep(3); // Performing AES-256-GCM cipher

      // REAL AES-256-GCM encryption with 100% bit-for-bit standard binary package
      const encryptedPackage = await encryptFilePackage(fileBytes, file.name, aesKey);

      await new Promise(r => setTimeout(r, 250));
      setProgressStep(4); // Packaging format

      const blob = new Blob([encryptedPackage as unknown as BlobPart], { type: 'application/octet-stream' });
      const blobUrl = URL.createObjectURL(blob);
      const outName = `${file.name}.enc`;

      setEncryptedBlobUrl(blobUrl);
      setEncryptedFilename(outName);

      // Record to audit history
      recordFileOperation(
        currentUser.id,
        file.name,
        outName,
        file.size,
        'Encryption',
        'Success'
      );

      setProgressStep(5); // Complete
    } catch (err: any) {
      setErrorMsg(err.message || "Encryption failed.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setEncryptedBlobUrl(null);
    setEncryptedFilename('');
    setProgressStep(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-indigo-400" />
            <span>Encrypt Your File</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard AES-256-GCM authenticated encryption with a unique 12-byte nonce.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AES-256-GCM (256-bit Key)
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {encryptedBlobUrl ? (
        /* Result Success Card */
        <div className="p-8 rounded-2xl bg-[#111827] border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">File Encrypted Successfully!</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              Your file has been transformed into a secure binary package with an authenticated GCM checksum tag.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Encrypted File:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[200px]">{encryptedFilename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cipher standard:</span>
              <span className="text-slate-200">AES-256-GCM (NIST SP 800-38D)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Integrity Tag:</span>
              <span className="text-emerald-400">128-bit GMAC appended</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={encryptedBlobUrl}
              download={encryptedFilename}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Encrypted File (.enc)</span>
            </a>

            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Encrypt Another File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Encryption Form */
        <form onSubmit={handleEncryptSubmit} className="space-y-6">
          {/* File Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl bg-[#111827] border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer text-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 overflow-hidden text-left">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white font-mono truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)} &bull; {file.type || 'binary'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Drag & Drop your file here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Maximum size: 100 MB &bull; All file types supported</span>
              </div>
            )}
          </div>

          {/* Key Management Section */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>Secret AES-256 Key</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Symmetric 32-byte key used for both encryption and decryption.</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateKey}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate AES Key</span>
              </button>
            </div>

            {/* Key Field with Controls */}
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={aesKey}
                onChange={(e) => setAesKey(e.target.value)}
                placeholder="Click 'Generate AES Key' or paste a 32-byte Base64 key"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 pr-32"
              />

              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white text-xs"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono font-medium flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadKey}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Download .key file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Crucial Security Warning */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Keep your AES key safe.</strong> If you lose it, the encrypted file cannot be decrypted. For security, your key is never saved on our server.
              </p>
            </div>
          </div>

          {/* Live Progress Visualizer */}
          {isEncrypting && (
            <div className="p-5 rounded-2xl bg-[#090D16] border border-indigo-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-indigo-300 font-bold">
                <span>Executing AES-256-GCM pipeline...</span>
                <span>{progressStep * 20}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 transition-all duration-300"
                  style={{ width: `${progressStep * 20}%` }}
                />
              </div>
              <div className="space-y-1 text-slate-400">
                <p className={progressStep >= 1 ? "text-emerald-400" : ""}>✓ Validating file parameters</p>
                <p className={progressStep >= 2 ? "text-emerald-400" : ""}>✓ Generating unique 12-byte random nonce</p>
                <p className={progressStep >= 3 ? "text-emerald-400" : ""}>✓ AES-256-GCM encryption & 128-bit auth tag</p>
                <p className={progressStep >= 4 ? "text-emerald-400" : ""}>✓ Packing binary package with 'AESV' header</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isEncrypting || !file || !aesKey}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>{isEncrypting ? "Encrypting with AES-256..." : "Encrypt File With AES-256"}</span>
          </button>
        </form>
      )}
    </div>
  );
};
