import React from 'react';
import { 
  Lock, 
  Unlock, 
  Zap, 
  HardDrive, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  Clock
} from 'lucide-react';
import { User, getUserStatistics, getUserHistory } from '../data/storage';

interface DashboardPageProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  const stats = getUserStatistics(currentUser.id);
  const recentHistory = getUserHistory(currentUser.id, 'All', '').slice(0, 5);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser.name} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time cryptographic file security summary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('encrypt')}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>+ Encrypt New File</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Total Operations</span>
            <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{stats.totalOperations}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Encrypted Files</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">{stats.encryptedCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Decrypted Files</span>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">{stats.decryptedCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Data Processed</span>
            <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{formatBytes(stats.totalBytesProcessed)}</p>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#141b2c] border border-indigo-500/30 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AES-256-GCM
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">🔐 Encrypt a File</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Generate a 256-bit symmetric key, fresh 12-byte nonce, and append an authenticated 128-bit checksum tag.
          </p>
          <button
            onClick={() => onNavigate('encrypt')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <span>Encrypt File</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#121c27] border border-cyan-500/30 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Unlock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              INTEGRITY VERIFY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">🔓 Decrypt a File</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Verify GMAC authentication tag integrity and recover your original file using your 256-bit AES secret key.
          </p>
          <button
            onClick={() => onNavigate('decrypt')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Decrypt File</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Cryptographic Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real SQLite audit log of your encryption and decryption actions</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View Full History &rarr;
          </button>
        </div>

        {recentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono text-slate-400 uppercase">
                  <th className="pb-3 font-semibold">File Name</th>
                  <th className="pb-3 font-semibold">Operation</th>
                  <th className="pb-3 font-semibold">File Size</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {recentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 text-white font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{item.originalFilename}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${
                        item.operation === 'Encryption'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {item.operation === 'Encryption' ? '🔐 Encryption' : '🔓 Decryption'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">{formatBytes(item.fileSize)}</td>
                    <td className="py-3.5 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.createdAt}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <p>No cryptographic operations performed yet.</p>
            <button
              onClick={() => onNavigate('encrypt')}
              className="text-xs text-indigo-400 underline font-semibold"
            >
              Encrypt your first file now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
