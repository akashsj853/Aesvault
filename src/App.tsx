import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardPage } from './components/DashboardPage';
import { EncryptPage } from './components/EncryptPage';
import { DecryptPage } from './components/DecryptPage';
import { HistoryPage } from './components/HistoryPage';
import { LearnAESPage } from './components/LearnAESPage';
import { VivaGuidePage } from './components/VivaGuidePage';
import { CodeExplorerPage } from './components/CodeExplorerPage';
import { ProfilePage } from './components/ProfilePage';
import { AuthModals } from './components/AuthModals';
import { User, getActiveUser, setActiveUser } from './data/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getActiveUser());
  const [activeTab, setActiveTab] = useState<string>(currentUser ? 'dashboard' : 'landing');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  // Sync active tab when login status changes
  useEffect(() => {
    if (!currentUser && ['dashboard', 'encrypt', 'decrypt', 'history', 'profile'].includes(activeTab)) {
      setActiveTab('landing');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setActiveUser(null);
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleAuthSuccess = (user: User) => {
    setActiveUser(user);
    setCurrentUser(user);
    setAuthModal(null);
    setActiveTab('dashboard');
  };

  const handleProtectedAction = (targetTab: string) => {
    if (currentUser) {
      setActiveTab(targetTab);
    } else {
      setAuthModal('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setAuthModal('login')}
        onOpenRegister={() => setAuthModal('register')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Render Sidebar only when user is logged in AND tab is an app screen */}
        {currentUser && !['landing'].includes(activeTab) && (
          <Sidebar
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
        )}

        {/* Tab View Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'landing' && (
            <LandingPage
              onStartEncrypting={() => handleProtectedAction('encrypt')}
              onLearnAES={() => setActiveTab('learn')}
              onOpenViva={() => setActiveTab('viva')}
            />
          )}

          {activeTab === 'dashboard' && currentUser && (
            <DashboardPage
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'encrypt' && (
            currentUser ? (
              <EncryptPage currentUser={currentUser} />
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400">Please sign in to access encryption services.</p>
                <button
                  onClick={() => setAuthModal('login')}
                  className="mt-4 px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {activeTab === 'decrypt' && (
            currentUser ? (
              <DecryptPage currentUser={currentUser} />
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400">Please sign in to decrypt files.</p>
                <button
                  onClick={() => setAuthModal('login')}
                  className="mt-4 px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm"
                >
                  Sign In
                </button>
              </div>
            )
          )}

          {activeTab === 'history' && currentUser && (
            <HistoryPage currentUser={currentUser} />
          )}

          {activeTab === 'learn' && <LearnAESPage />}

          {activeTab === 'viva' && <VivaGuidePage />}

          {activeTab === 'code' && <CodeExplorerPage />}

          {activeTab === 'profile' && currentUser && (
            <ProfilePage
              currentUser={currentUser}
              onUserUpdated={(u) => setCurrentUser(u)}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(mode) => setAuthModal(mode)}
      />
    </div>
  );
}
