import React, { useState, useRef } from 'react';
import { 
  Unlock, 
  Upload, 
  Key, 
  Eye, 
  EyeOff, 
  Clipboard, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  ShieldCheck,
  X
} from 'lucide-react';
import { decryptFilePackage } from '../crypto/aesEngine';
import { User, recordFileOperation } from '../data/storage';

interface DecryptPageProps {
  currentUser: User;
}

export const DecryptPage: React.FC<DecryptPageProps> = ({ currentUser }) => {
  const [file, setFile] = useState<File | null>(null);
  const [aesKey, setAesKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(true);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptedBlobUrl, setDecryptedBlobUrl] = useState<string | null>(null);
  const [recoveredFilename, setRecoveredFilename] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pastedStatus, setPastedStatus] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAesKey(text.trim());
        setPastedStatus(true);
        setTimeout(() => setPastedStatus(false), 1500);
      }
    } catch {
      setErrorMsg("Please manually paste your key into the text field.");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setErrorMsg(null);
    setFile(f);
  };

  const handleDecryptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!file) {
      setErrorMsg("Please select an encrypted (.enc) file.");
      return;
    }
    if (!aesKey.trim()) {
      setErrorMsg("Please enter the AES key.");
      return;
    }

    try {
      setIsDecrypting(true);

      const arrayBuffer = await file.arrayBuffer();
      const encryptedPackage = new Uint8Array(arrayBuffer);

      // REAL AES-256-GCM Decryption and 128-bit authentication tag verification
      const { decryptedBytes, originalFilename } = await decryptFilePackage(
        encryptedPackage,
        aesKey
      );

      const blob = new Blob([decryptedBytes as unknown as BlobPart]);
      const blobUrl = URL.createObjectURL(blob);

      setDecryptedBlobUrl(blobUrl);
      setRecoveredFilename(originalFilename);

      // Record successful decryption
      recordFileOperation(
        currentUser.id,
        originalFilename,
        file.name,
        decryptedBytes.length,
        'Decryption',
        'Success'
      );
    } catch (err: any) {
      // Record failed attempt in audit log
      recordFileOperation(
        currentUser.id,
        file.name,
        file.name,
        file.size,
        'Decryption',
        'Failed'
      );
      setErrorMsg("Decryption failed. The AES key is incorrect or the file has been modified.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDecryptedBlobUrl(null);
    setRecoveredFilename('');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Unlock className="w-6 h-6 text-cyan-400" />
            <span>Decrypt Your File</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify GCM authentication tag integrity and recover your original file.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4" />
          AES-256-GCM Integrity Check
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {decryptedBlobUrl ? (
        /* Decryption Success Card */
        <div className="p-8 rounded-2xl bg-[#111827] border border-cyan-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-cyan-500/15 border-2 border-cyan-500 text-cyan-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Decryption Successful!</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              The 128-bit AES-GCM authentication tag verified cryptographic integrity. The original file has been fully restored with 100% bit-for-bit fidelity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Restored File:</span>
              <span className="text-cyan-400 font-bold truncate max-w-[200px]">{recoveredFilename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Integrity:</span>
              <span className="text-emerald-400 font-bold">✓ Tag Verified (Untampered)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={decryptedBlobUrl}
              download={recoveredFilename}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Restored File ({recoveredFilename})</span>
            </a>

            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Decrypt Another File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Decryption Form */
        <form onSubmit={handleDecryptSubmit} className="space-y-6">
          {/* File Selection Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl bg-[#111827] border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer text-center group"
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
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white font-mono truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">Encrypted Package &bull; {(file.size / 1024).toFixed(1)} KB</p>
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
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Select your encrypted (.enc) file</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Upload packages previously generated by AESVault</span>
              </div>
            )}
          </div>

          {/* Key Input Section */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Enter AES-256 Secret Key</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Provide the 32-byte Base64 key used during encryption.</p>
              </div>
              <button
                type="button"
                onClick={handlePasteKey}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>{pastedStatus ? "Pasted!" : "Paste from Clipboard"}</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={aesKey}
                onChange={(e) => setAesKey(e.target.value)}
                placeholder="Paste your 256-bit AES key here..."
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 pr-12"
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white text-xs"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300">
              <p>
                <strong>How GCM Integrity Works:</strong> AES-GCM recalculates the 128-bit authentication tag over the received ciphertext. If the key is off by even one character or if someone altered a single byte, decryption is aborted immediately.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDecrypting || !file || !aesKey}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Unlock className="w-4 h-4" />
            <span>{isDecrypting ? "Verifying Integrity & Decrypting..." : "Decrypt & Verify File"}</span>
          </button>
        </form>
      )}
    </div>
  );
};
