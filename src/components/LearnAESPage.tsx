import React, { useState } from 'react';
import { 
  BookOpen, 
  Binary, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Key
} from 'lucide-react';
import { generateAESKey, visualizeAESText, visualizeDecryptText } from '../crypto/aesEngine';

export const LearnAESPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('Hello AESVault');
  const [currentKey, setCurrentKey] = useState<string>(generateAESKey());
  const [visResult, setVisResult] = useState<any>(null);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleEncrypt = async () => {
    try {
      setIsProcessing(true);
      const res = await visualizeAESText(inputText, currentKey);
      setVisResult(res);
      setDecryptedResult(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!visResult) return;
    try {
      setIsProcessing(true);
      const plain = await visualizeDecryptText(
        visResult.combinedB64,
        visResult.nonceB64,
        currentKey
      );
      setDecryptedResult(plain);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewKey = () => {
    setCurrentKey(generateAESKey());
    setVisResult(null);
    setDecryptedResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">CRYPTOGRAPHIC ACADEMY</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Understanding the Advanced Encryption Standard (AES)
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          An in-depth, academic explanation of AES-256, Galois/Counter Mode (GCM), symmetric key cryptography, and authenticated data integrity.
        </p>
      </div>

      {/* Live Educational Visualizer */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-indigo-500/40 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">Interactive Demonstration</span>
            <h2 className="text-xl font-bold text-white mt-0.5">Live AES-256-GCM Visualizer</h2>
          </div>
          <button
            onClick={handleNewKey}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate New Key</span>
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">1. Plaintext Input (Data to Encrypt):</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Type any message..."
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleEncrypt}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25"
          >
            <Zap className="w-4 h-4" />
            <span>Step 1: Encrypt Plaintext &rarr;</span>
          </button>
        </div>

        {/* Visualizer Stages */}
        {visResult && (
          <div className="space-y-4 pt-2">
            {/* Key & Nonce Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">🔑 Secret Key (256-bit)</span>
                  <span className="text-indigo-400 font-mono">32 Bytes</span>
                </div>
                <p className="font-mono text-xs text-slate-200 break-all">{visResult.keyHex}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">🎲 Nonce / IV (96-bit)</span>
                  <span className="text-indigo-400 font-mono">12 Bytes (Unique)</span>
                </div>
                <p className="font-mono text-xs text-slate-200 break-all">{visResult.nonceHex}</p>
              </div>
            </div>

            {/* Pipeline transformation banner */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center font-mono text-xs text-indigo-300">
              Plaintext &rarr; [ AES-256 CTR Mode (14 Rounds) + Galois Multiplier GMAC ] &rarr; Ciphertext + 128-bit Tag
            </div>

            {/* Ciphertext + Tag */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">🔒 Ciphertext + 128-bit GCM Authentication Tag</span>
                <span className="text-emerald-400 font-mono text-[11px]">Hex Representation</span>
              </div>
              <p className="font-mono text-xs text-slate-300 break-all leading-relaxed">
                {visResult.combinedHex}
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5 space-y-0.5">
                <p>Pure Ciphertext: <span className="text-slate-200">{visResult.pureCipherHex}</span></p>
                <p>16-Byte GMAC Tag: <span className="text-emerald-400 font-bold">{visResult.authTagHex}</span></p>
              </div>
            </div>

            {/* Decrypt Verification */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleDecrypt}
                disabled={isProcessing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/25"
              >
                <span>Step 2: Decrypt Ciphertext & Verify Tag &rarr;</span>
              </button>

              {decryptedResult !== null && (
                <div className="w-full sm:flex-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Restored: <strong className="text-emerald-300">{decryptedResult}</strong></span>
                  <span className="text-emerald-400 font-bold">✓ 100% Matched</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-400 pt-3 border-t border-white/5">
          ℹ️ <strong>Educational Note:</strong> This visualizer calls the real Web Crypto standard AES-256-GCM engine. No fake or simulated mathematics are used.
        </div>
      </div>

      {/* Deep Dive Academic Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1 */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">1. Symmetric Cryptography</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            In symmetric algorithms, the exact same secret key is used for both encryption and decryption. Both parties must securely possess the secret key.
          </p>
          <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-indigo-300 border border-white/5 space-y-1">
            <p>Plaintext + Key &rarr; Ciphertext (Encryption)</p>
            <p>Ciphertext + Key &rarr; Plaintext (Decryption)</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">2. AES-128 vs 192 vs 256</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            AES operates on fixed 128-bit blocks with three standardized key sizes and internal substitution-permutation network (SPN) rounds:
          </p>
          <ul className="text-xs text-slate-400 font-mono space-y-1">
            <li>&bull; AES-128: 16 bytes key &bull; 10 rounds</li>
            <li>&bull; AES-192: 24 bytes key &bull; 12 rounds</li>
            <li className="text-indigo-400 font-bold">&bull; AES-256: 32 bytes key &bull; 14 rounds (Used here)</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">3. Galois/Counter Mode (GCM)</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            GCM is an Authenticated Encryption with Associated Data (AEAD) scheme. It transforms the block cipher into a stream cipher using Counter mode (CTR) and computes a 128-bit GMAC authentication tag using universal hashing over Galois Field GF(2<sup>128</sup>).
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">4. Nonce Rule & Integrity</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            A Nonce ("Number used once") must never be reused with the same AES key in GCM. Reusing a nonce exposes the Galois authentication subkey and allows attackers to forge tags. AESVault guarantees a fresh 12-byte random vector on every operation.
          </p>
        </div>
      </div>
    </div>
  );
};
