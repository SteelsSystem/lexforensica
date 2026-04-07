import { useState, useCallback } from 'react';
import type { AuditResponse, AuditInput, ChatMessage } from '../types';
import { SubscriptionTier } from '../types';
import { forensicEngine } from '../services/gemini';
import {
  saveAudit,
  saveMetadata,
  saveChatHistory,
  loadAudit,
  loadMetadata,
  loadChatHistory,
} from '../services/db';

interface AuditMetadata {
  id: string;
  createdAt: number;
  updatedAt: number;
  riskLevel: string;
  institutionType: string;
  language: 'cs' | 'en' | 'de';
}

export function useAudit(uid: string | null, vaultPassword: string | null) {
  const [currentAudit, setCurrentAudit] = useState<AuditResponse | null>(null);
  const [auditList, setAuditList] = useState<AuditMetadata[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(
    async (input: AuditInput, tier: SubscriptionTier) => {
      if (!uid || !vaultPassword) {
        setError('User must be authenticated and vault must be unlocked to run an audit.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const auditResult = await forensicEngine.analyzeDeep(input, tier);

        const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        await saveAudit(uid, auditId, auditResult, vaultPassword);

        const metadata: AuditMetadata = {
          id: auditId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          riskLevel: auditResult.riskAssessment.overallRiskLevel,
          institutionType: auditResult.meta.institutionType,
          language: auditResult.meta.language,
        };

        await saveMetadata(uid, auditId, metadata, vaultPassword);

        setCurrentAudit(auditResult);
        setChatMessages([]);
        setAuditList((prev) => [metadata, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during audit.');
      } finally {
        setLoading(false);
      }
    },
    [uid, vaultPassword]
  );

  const loadExistingAudit = useCallback(
    async (auditId: string) => {
      if (!uid || !vaultPassword) {
        setError('User must be authenticated and vault must be unlocked to load an audit.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [auditResult, history] = await Promise.all([
          loadAudit(uid, auditId, vaultPassword),
          loadChatHistory(uid, auditId, vaultPassword),
        ]);

        setCurrentAudit(auditResult);
        setChatMessages(history ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit.');
      } finally {
        setLoading(false);
      }
    },
    [uid, vaultPassword]
  );

  const loadAuditList = useCallback(async () => {
    if (!uid || !vaultPassword) {
      setError('User must be authenticated and vault must be unlocked to list audits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const metadataList = await loadMetadata(uid, vaultPassword);
      setAuditList(metadataList ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit list.');
    } finally {
      setLoading(false);
    }
  }, [uid, vaultPassword]);

  const sendChatMessage = useCallback(
    async (message: string, language: 'cs' | 'en' | 'de') => {
      if (!uid || !vaultPassword) {
        setError('User must be authenticated and vault must be unlocked to send messages.');
        return;
      }

      if (!currentAudit) {
        setError('No active audit. Run or load an audit before sending chat messages.');
        return;
      }

      const auditId = `audit_${currentAudit.meta.timestamp}`;

      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...chatMessages, userMessage];
      setChatMessages(updatedHistory);
      setLoading(true);
      setError(null);

      try {
        const assistantReply = await forensicEngine.chatWithAssistant(
          message,
          updatedHistory,
          currentAudit,
          language
        );

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: assistantReply,
          timestamp: new Date().toISOString(),
        };

        const finalHistory = [...updatedHistory, assistantMessage];
        setChatMessages(finalHistory);

        await saveChatHistory(uid, auditId, finalHistory, vaultPassword);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send chat message.');
        // Revert optimistic user message on error
        setChatMessages(chatMessages);
      } finally {
        setLoading(false);
      }
    },
    [uid, vaultPassword, currentAudit, chatMessages]
  );

  return {
    currentAudit,
    auditList,
    chatMessages,
    loading,
    error,
    runAudit,
    loadExistingAudit,
    loadAuditList,
    sendChatMessage,
  };
}
