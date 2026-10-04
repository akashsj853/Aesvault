import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  FileText, 
  Clock, 
  ShieldCheck,
  Lock,
  Unlock
} from 'lucide-react';
import { User, getUserHistory, clearUserHistory } from '../data/storage';

interface HistoryPageProps {
  currentUser: User;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ currentUser }) => {
  const [filter, setFilter] = useState<'All' | 'Encryption' | 'Decryption'>('All');
  const [search, setSearch] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const historyRecords = getUserHistory(currentUser.id, filter, search);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your cryptographic activity log?")) {
      clearUserHistory(currentUser.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Cryptographic Audit History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical log of all AES-256 operations performed by your account.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Zero Key Storage: Secret keys are never logged</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#111827] border border-white/10 text-xs">
          {(['All', 'Encryption', 'Decryption'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'All' ? 'All Operations' : tab === 'Encryption' ? '🔐 Encryptions' : '🔓 Decryptions'}
            </button>
          ))}
        </div>

        {/* Search Input & Clear */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename..."
              className="pl-9 pr-4 py-1.5 rounded-xl bg-[#111827] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>

          {historyRecords.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs transition-colors"
              title="Clear audit log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 overflow-hidden">
        {historyRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono text-slate-400 uppercase">
                  <th className="pb-3 font-semibold">Original File</th>
                  <th className="pb-3 font-semibold">Encrypted Package</th>
                  <th className="pb-3 font-semibold">Operation</th>
                  <th className="pb-3 font-semibold">File Size</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {historyRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 text-white font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{item.originalFilename}</span>
                    </td>
                    <td className="py-3.5 text-slate-400 truncate max-w-[180px]">
                      {item.encryptedFilename}
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
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.createdAt}</span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        item.status === 'Success' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Success' ? 'bg-emerald-400' : 'bg-red-400'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <p className="text-sm">No cryptographic records matching your filter.</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-indigo-400 underline font-semibold"
              >
                Clear search query
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
