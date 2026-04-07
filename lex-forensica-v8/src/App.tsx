import { useState } from 'react';
import AuthGate from './components/AuthGate';
import VaultModal from './components/VaultModal';
import { DualInput } from './components/DualInput';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import { useAuth } from './hooks/useAuth';
import { useVault } from './hooks/useVault';
import { useAudit } from './hooks/useAudit';
import type { AuditInput } from './types';
import { SubscriptionTier } from './types';

export default function App() {
  const { user } = useAuth();
  const { vaultPassword, unlock } = useVault();
  const uid = user?.uid ?? null;

  const {
    currentAudit,
    loading,
    error,
    runAudit,
    sendChatMessage,
    chatMessages,
  } = useAudit(uid, vaultPassword);

  const [chatOpen, setChatOpen] = useState(false);
  const [language, setLanguage] = useState<'cs' | 'en' | 'de'>('en');

  const handleAnalyze = async (input: AuditInput) => {
    if (!vaultPassword) return;
    setLanguage(input.language);
    await runAudit(input, SubscriptionTier.ADVOCATE);
  };

  return (
    <AuthGate>
      {/* Vault gate */}
      {!vaultPassword && <VaultModal onUnlock={unlock} />}

      {/* Main content */}
      <div className="space-y-6">
        {/* Input section */}
        {!currentAudit && !loading && (
          <DualInput onSubmit={handleAnalyze} loading={!vaultPassword || loading} />
        )}

        {/* Loading state */}
        {loading && (
          <div className="border border-gray-800 rounded-xl p-8 text-center">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-sm">Running forensic analysis pipeline...</p>
            <p className="text-gray-600 text-xs mt-1">MIND1 → DEEP_1 → LOOP_CYCLE → Defense Synthesis</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-red-800/50 rounded-xl p-4 bg-red-950/20">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-gray-500 hover:text-gray-300 mt-2"
            >
              Reset
            </button>
          </div>
        )}

        {/* Dashboard */}
        {currentAudit && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Audit Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChatOpen(true)}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300
                             hover:border-teal-700 transition-colors"
                >
                  Open Assistant
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300
                             hover:border-gray-600 transition-colors"
                >
                  New Audit
                </button>
              </div>
            </div>
            <Dashboard audit={currentAudit} />
          </>
        )}
      </div>

      {/* Chat assistant */}
      <ChatAssistant
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        auditContext={currentAudit}
        language={language}
      />
    </AuthGate>
  );
}
