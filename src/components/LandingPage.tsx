import React from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Binary, 
  FileLock2, 
  GraduationCap,
  HardDrive
} from 'lucide-react';

interface LandingPageProps {
  onStartEncrypting: () => void;
  onLearnAES: () => void;
  onOpenViva: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartEncrypting,
  onLearnAES,
  onOpenViva
}) => {
  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Authenticated AES-256-GCM Encryption
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Secure Your Files With <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                AES Encryption
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Protect your files with fast and authenticated AES-256 encryption. Generate cryptographically random keys, prevent tampering with 128-bit authentication tags, and decrypt anytime with your secret key.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onStartEncrypting}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 group transition-all"
              >
                <span>Start Encrypting</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onLearnAES}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 transition-all"
              >
                Learn About AES
              </button>

              <button
                onClick={onOpenViva}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Viva Voce Guide
              </button>
            </div>
          </div>

          {/* Right Visual Pipeline Animation */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-white/10 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">aes256_pipeline.py</span>
              </div>

              {/* Pipeline Flow */}
              <div className="space-y-4">
                {/* Node 1: File */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plaintext Input</span>
                    <p className="text-sm font-semibold text-white font-mono">project_thesis.pdf</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-blue-500 to-indigo-500" />
                  <div className="px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold flex items-center gap-2 shadow-sm">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    AES-256-GCM (14 Rounds)
                  </div>
                  <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-emerald-500" />
                </div>

                {/* Node 2: Encrypted Package */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileLock2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Protected Ciphertext</span>
                    <p className="text-sm font-semibold text-emerald-200 font-mono">project_thesis.pdf.enc</p>
                  </div>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="mt-5 p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-slate-400 space-y-1">
                <p><span className="text-emerald-400 font-bold">✓</span> Nonce: <span className="text-slate-200">12 random bytes generated</span></p>
                <p><span className="text-emerald-400 font-bold">✓</span> GCM Tag: <span className="text-slate-200">128-bit authentication verified</span></p>
                <p><span className="text-indigo-400 font-bold">●</span> Header: <span className="text-slate-200">'AESV' (v1 container)</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Workflow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-[#0D131F]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">SIMPLE 3-STEP WORKFLOW</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How AESVault Works</h2>
            <p className="text-slate-400 text-sm mt-2">Zero complex setup. Genuine authenticated encryption in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 hover:border-indigo-500/30 transition-all">
              <span className="text-4xl font-extrabold text-white/10 font-mono">01</span>
              <h3 className="text-lg font-bold text-white mt-2 mb-2">Select Your File</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Drag and drop any document, image, source code file, or archive up to 100 MB.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111827] to-[#151d30] border border-indigo-500/40 shadow-xl shadow-indigo-500/5">
              <span className="text-4xl font-extrabold text-indigo-400/20 font-mono">02</span>
              <h3 className="text-lg font-bold text-white mt-2 mb-2">Encrypt with AES-256</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate a fresh 32-byte key. AES-GCM calculates ciphertext and a 128-bit cryptographic checksum tag.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 hover:border-indigo-500/30 transition-all">
              <span className="text-4xl font-extrabold text-white/10 font-mono">03</span>
              <h3 className="text-lg font-bold text-white mt-2 mb-2">Download Secure File</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Save your <code className="text-indigo-300 font-mono">.enc</code> file. Recover the original with 100% fidelity whenever needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is AES & Why AES Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Binary className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">What is AES?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The <strong>Advanced Encryption Standard (AES)</strong> was standardized by NIST in 2001 (FIPS 197). It is a symmetric block cipher that operates on 128-bit blocks of data using key sizes of 128, 192, or 256 bits.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Symmetric: Identical secret key for encryption & decryption</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Global gold benchmark for data at rest</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 14 substitution-permutation rounds in AES-256</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Why AES-256-GCM?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Standard modes like CBC require a separate HMAC to prevent padding oracle and bit-flipping attacks. <strong>Galois/Counter Mode (GCM)</strong> integrates confidentiality and cryptographic integrity in one step.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 2<sup>256</sup> keyspace (brute force is mathematically impossible)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 128-bit GMAC authentication tag verifies untampered bytes</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Instant rejection when the wrong AES key is provided</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Ready for your academic demonstration?</h3>
            <p className="text-sm text-slate-300 mt-1">Perform live encryption or inspect the clean Python / Flask implementation.</p>
          </div>
          <button
            onClick={onStartEncrypting}
            className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg shrink-0"
          >
            Launch System Now &rarr;
          </button>
        </div>
      </section>

      {/* Academic Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#06080F] py-8 px-4 text-center text-xs text-slate-500">
        <p className="font-mono">AESVault &copy; 2026 Academic Project &bull; Built Exclusively on the Advanced Encryption Standard (AES-256-GCM)</p>
      </footer>
    </div>
  );
};
