import { useState } from 'react';

interface VaultModalProps {
  onUnlock: (password: string) => void;
}

export default function VaultModal({ onUnlock }: VaultModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Minimum 8 characters');
      return;
    }
    onUnlock(password);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-950/50 border border-teal-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-100">Vault Access</h2>
          <p className="text-sm text-gray-400 mt-1">
            {isNew
              ? 'Create a vault password. This encrypts all your data with AES-256-GCM.'
              : 'Enter your vault password to decrypt your data.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Vault Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100
                         placeholder-gray-600 focus:outline-none focus:border-teal-600 text-sm"
              placeholder="Minimum 8 characters"
              autoFocus
            />
          </div>

          {isNew && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100
                           placeholder-gray-600 focus:outline-none focus:border-teal-600 text-sm"
                placeholder="Re-enter password"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-sm
                       font-medium transition-colors"
          >
            {isNew ? 'Create Vault' : 'Unlock'}
          </button>
        </form>

        <button
          onClick={() => { setIsNew(!isNew); setError(''); }}
          className="w-full text-center text-xs text-gray-500 hover:text-gray-400 mt-4 transition-colors"
        >
          {isNew ? 'Already have a vault? Sign in' : 'First time? Create vault'}
        </button>

        <p className="text-gray-600 text-xs text-center mt-4 leading-relaxed">
          Zero-knowledge: your password never leaves this device. If lost, your data cannot be recovered.
        </p>
      </div>
    </div>
  );
}
