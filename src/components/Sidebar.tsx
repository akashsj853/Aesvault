import React from 'react';
import { 
  LayoutDashboard, 
  Lock, 
  Unlock, 
  History, 
  BookOpen, 
  User, 
  LogOut, 
  GraduationCap, 
  Code2,
  ShieldCheck
} from 'lucide-react';
import { User as UserType } from '../data/storage';

interface SidebarProps {
  currentUser: UserType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'encrypt', label: 'Encrypt File', icon: Lock },
    { id: 'decrypt', label: 'Decrypt File', icon: Unlock },
    { id: 'history', label: 'File History', icon: History },
    { id: 'learn', label: 'Learn AES', icon: BookOpen },
    { id: 'viva', label: 'Viva Preparation', icon: GraduationCap },
    { id: 'code', label: 'Python Source & Repo', icon: Code2 },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-white/10 flex flex-col p-4 shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
      {/* User Card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
          {currentUser.name[0]?.toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
          <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Security Info Card */}
      <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AES-256-GCM Mode</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          14 rounds with 128-bit authentication tag. Plaintext keys are never stored.
        </p>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="mt-3 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </aside>
  );
};
