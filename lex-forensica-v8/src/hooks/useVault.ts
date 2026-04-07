import { useState, useCallback } from 'react';

export function useVault() {
  const [vaultPassword, setVaultPassword] = useState<string | null>(null);

  const isUnlocked = vaultPassword !== null;

  const unlock = useCallback((password: string) => {
    setVaultPassword(password);
  }, []);

  const lock = useCallback(() => {
    setVaultPassword(null);
  }, []);

  return { vaultPassword, isUnlocked, unlock, lock };
}
