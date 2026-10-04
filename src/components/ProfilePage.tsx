import React, { useState } from 'react';
import { User, updateUserProfile } from '../data/storage';
import { Shield, Key, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUserUpdated,
  onLogout
}) => {
  const [name, setName] = useState<string>(currentUser.name);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ text: "Name cannot be empty.", type: "error" });
      return;
    }
    try {
      const updated = updateUserProfile(currentUser.id, name);
      onUserUpdated(updated);
      setMsg({ text: "Profile display name updated successfully.", type: "success" });
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-extrabold text-white">User Profile & Security</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your account credentials and examine security parameters.</p>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Account Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Registered Email</span>
            <p className="text-slate-200">{currentUser.email}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Account Created</span>
            <p className="text-slate-200">{currentUser.createdAt}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-2 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">Display Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Update
            </button>
          </div>
        </form>
      </div>

      {/* Security Architecture Box */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-3 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Security Architecture</h2>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-center gap-2 text-emerald-400 font-semibold">
            ✓ Zero Plaintext AES Key Storage: Keys are held client-side or ephemerally.
          </li>
          <li className="flex items-center gap-2 text-emerald-400 font-semibold">
            ✓ Password Protection: Passwords hashed via Werkzeug pbkdf2:sha256.
          </li>
          <li className="flex items-center gap-2 text-emerald-400 font-semibold">
            ✓ NIST SP 800-38D Standard: Authenticated AES-256-GCM.
          </li>
        </ul>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-colors"
      >
        End Active Session (Log Out)
      </button>
    </div>
  );
};
