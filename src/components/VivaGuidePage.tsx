import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronUp, Quote, CheckCircle2, BookOpen } from 'lucide-react';

export const VivaGuidePage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: "What is AES and why did you choose it?",
      a: "AES (Advanced Encryption Standard) is a symmetric block cipher standardized by NIST in 2001 (FIPS 197). We chose AES because it is the global industry and governmental benchmark for data-at-rest encryption. It offers superior mathematical security, high throughput in hardware and software, and is resistant to all known classical cryptanalytic attacks."
    },
    {
      q: "What is AES-256?",
      a: "AES-256 is the strongest variant of AES, utilizing a 256-bit (32-byte) key and executing 14 transformation rounds (SubBytes, ShiftRows, MixColumns, AddRoundKey). It provides 2^256 potential key combinations, rendering brute-force attacks mathematically and physically impossible with modern computing."
    },
    {
      q: "What is symmetric encryption?",
      a: "In symmetric encryption, the identical secret key is used for both encrypting plaintext into ciphertext and decrypting ciphertext back into plaintext. As a result, maintaining the confidentiality of the secret key is paramount."
    },
    {
      q: "What is GCM (Galois/Counter Mode) and why use it over CBC?",
      a: "GCM is an Authenticated Encryption with Associated Data (AEAD) mode. While CBC (Cipher Block Chaining) only guarantees confidentiality and requires padding (making it susceptible to padding oracle attacks), GCM combines Counter (CTR) mode with Galois Message Authentication Code (GMAC). GCM computes a 128-bit authentication tag that verifies data integrity and authenticity alongside confidentiality."
    },
    {
      q: "What is a Nonce (Initialization Vector)?",
      a: "A Nonce ('Number used ONCE') is a 96-bit (12-byte) random initialization vector. In AES-GCM, the nonce is combined with a 32-bit counter to generate unique keystreams for each block."
    },
    {
      q: "Why must nonce values NEVER be reused with the same key?",
      a: "In GCM, reusing a nonce with the same key allows an attacker to XOR two ciphertexts together to eliminate keystream randomness, and worse, solve a polynomial equation to recover the internal Galois authentication subkey (H). Once H is compromised, the attacker can forge arbitrary authentication tags. AESVault guarantees a fresh 12-byte random nonce per file."
    },
    {
      q: "Where is the AES key stored in AESVault?",
      a: "The AES key is NEVER stored in the database or server filesystem. The key is provided directly to the user upon generation. When decrypting, the user must supply the key. This zero-knowledge design ensures that even a full database compromise cannot expose the plaintext files."
    },
    {
      q: "What happens if an incorrect key is entered during decryption?",
      a: "During decryption, AES-GCM recalculates the 128-bit authentication tag over the ciphertext using the supplied key. If the key is incorrect, the computed tag will not match the stored tag, triggering an InvalidTag exception. Decryption aborts instantly with zero plaintext output."
    },
    {
      q: "What happens if an attacker modifies even 1 bit of an encrypted file?",
      a: "Because AES-GCM provides authenticated encryption, any bit-flip in the ciphertext will alter the Galois field multiplication result. The tag check fails immediately, and AESVault reports that the file has been tampered with or corrupted."
    },
    {
      q: "Why should passwords be hashed using Werkzeug (PBKDF2-SHA256)?",
      a: "Plaintext passwords must never be stored because a database leak would directly compromise user credentials. Werkzeug's generate_password_hash applies PBKDF2 with SHA-256 and a random cryptographic salt, making dictionary and rainbow-table attacks computationally prohibitive."
    },
    {
      q: "What is the difference between Plaintext and Ciphertext?",
      a: "Plaintext is the original readable data (e.g. PDF, image, text). Ciphertext is the unreadable, pseudorandom binary stream produced after running the plaintext through the 14 rounds of AES-256 with the secret key."
    },
    {
      q: "What are the limitations of this project?",
      a: "1) Key distribution: Since it is purely symmetric AES, the sender and receiver must securely exchange the 32-byte key out-of-band. 2) Memory usage: Bulk encryption of extremely large files (>1 GB) requires streaming chunks, whereas this academic project focuses on files up to 100 MB. 3) Key loss: There is no password recovery or backdoor for lost AES keys."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">EXAMINATION READY</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center justify-center gap-3">
          <GraduationCap className="w-8 h-8 text-emerald-400" />
          <span>Viva Voce Preparation Guide</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Master these core questions and answers to confidently explain and defend AESVault in front of your professor or external examiners.
        </p>
      </div>

      {/* 30-Second Elevator Pitch */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Quote className="w-4 h-4" />
          <span>Your 30-Second Opening Explanation to the Professor:</span>
        </div>
        <blockquote className="p-4 rounded-xl bg-black/40 border border-white/5 text-sm sm:text-base text-slate-200 leading-relaxed font-sans italic">
          "My project is <strong>AESVault</strong>, a secure file encryption and decryption system based on the <strong>Advanced Encryption Standard (AES)</strong>. The system uses <strong>AES-256-GCM</strong> to encrypt files before storage or download. AES is a symmetric-key algorithm, so the same secret key is required for encryption and decryption. GCM also provides authentication, allowing the application to detect an incorrect key or modified encrypted data. The project provides user authentication, file encryption, decryption, history tracking, and an educational AES visualization."
        </blockquote>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {vivaQuestions.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className="rounded-xl bg-[#111827] border border-white/10 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Q{idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">{item.q}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="p-4 sm:p-5 pt-0 text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-black/20">
                  <p className="mt-3"><strong className="text-emerald-400">Model Answer:</strong> {item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
