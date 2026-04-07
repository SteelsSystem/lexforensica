// LEX FORENSICA v8.0 — All-Encrypted Firestore CRUD
// Every write encrypts via crypto.ts before persisting.
// Resolves: BLOCKER-02a, BLOCKER-02b, CG-DB-DEL, GDPR Art.17, CoC 0x05

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { encryptData, decryptData } from './crypto';
import type {
  AuditResponse,
  ChatMessage,
  SKSSEntry,
  StoredAudit,
  StoredMetadata,
  StoredChatHistory,
  StoredSKSSEntry,
} from '../types';

// ---------------------------------------------------------------------------
// WRITE OPERATIONS
// ---------------------------------------------------------------------------

/**
 * Encrypt and persist a full AuditResponse to the 'audits' collection.
 * Returns the generated document ID.
 */
export async function saveAudit(
  uid: string,
  audit: AuditResponse,
  vaultPassword: string
): Promise<string> {
  const id = crypto.randomUUID();
  const plaintext = JSON.stringify(audit);
  const { encrypted, iv, salt } = await encryptData(plaintext, vaultPassword);
  const now = Date.now();

  const document: StoredAudit = {
    id,
    uid,
    encryptedData: encrypted,
    iv,
    salt,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'audits', id), document);
  return id;
}

/**
 * Encrypt and persist audit metadata to the 'audit_metadata' collection.
 * Resolves BLOCKER-02a.
 */
export async function saveMetadata(
  uid: string,
  auditId: string,
  metadata: { keyFlags: string[]; summary: string; riskLevel: string },
  vaultPassword: string
): Promise<void> {
  const plaintext = JSON.stringify(metadata);
  const { encrypted, iv, salt } = await encryptData(plaintext, vaultPassword);

  const document: StoredMetadata = {
    id: auditId,
    uid,
    encryptedData: encrypted,
    iv,
    salt,
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'audit_metadata', auditId), document);
}

/**
 * Encrypt and persist chat message history to the 'chat_histories' collection.
 * Resolves BLOCKER-02b.
 */
export async function saveChatHistory(
  uid: string,
  auditId: string,
  messages: ChatMessage[],
  vaultPassword: string
): Promise<void> {
  const plaintext = JSON.stringify(messages);
  const { encrypted, iv, salt } = await encryptData(plaintext, vaultPassword);

  const document: StoredChatHistory = {
    id: auditId,
    uid,
    auditId,
    encryptedData: encrypted,
    iv,
    salt,
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'chat_histories', auditId), document);
}

/**
 * Encrypt and persist a SKSS registry entry to the 'skss_registry' collection.
 * CoC 0x05.
 */
export async function saveSKSSEntry(
  uid: string,
  entry: SKSSEntry,
  vaultPassword: string
): Promise<void> {
  const plaintext = JSON.stringify(entry);
  const { encrypted, iv, salt } = await encryptData(plaintext, vaultPassword);

  const document: StoredSKSSEntry = {
    id: entry.id,
    uid,
    encryptedData: encrypted,
    iv,
    salt,
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'skss_registry', entry.id), document);
}

// ---------------------------------------------------------------------------
// READ OPERATIONS
// ---------------------------------------------------------------------------

/**
 * Load and decrypt a single AuditResponse by document ID.
 * Returns null if the document does not exist.
 */
export async function loadAudit(
  auditId: string,
  vaultPassword: string
): Promise<AuditResponse | null> {
  const snapshot = await getDoc(doc(db, 'audits', auditId));
  if (!snapshot.exists()) {
    return null;
  }

  const stored = snapshot.data() as StoredAudit;
  const plaintext = await decryptData(
    stored.encryptedData,
    stored.iv,
    stored.salt,
    vaultPassword
  );
  return JSON.parse(plaintext) as AuditResponse;
}

/**
 * Load and decrypt all audit metadata documents belonging to a user.
 * Returns an array of decrypted metadata objects with their document IDs.
 */
export async function loadMetadata(
  uid: string,
  vaultPassword: string
): Promise<Array<{ id: string; keyFlags: string[]; summary: string; riskLevel: string }>> {
  const q = query(collection(db, 'audit_metadata'), where('uid', '==', uid));
  const snapshot = await getDocs(q);

  const results: Array<{ id: string; keyFlags: string[]; summary: string; riskLevel: string }> = [];

  for (const docSnap of snapshot.docs) {
    const stored = docSnap.data() as StoredMetadata;
    const plaintext = await decryptData(
      stored.encryptedData,
      stored.iv,
      stored.salt,
      vaultPassword
    );
    const payload = JSON.parse(plaintext) as {
      keyFlags: string[];
      summary: string;
      riskLevel: string;
    };
    results.push({ id: stored.id, ...payload });
  }

  return results;
}

/**
 * Load and decrypt the chat history associated with a given audit for a user.
 * Returns an empty array if no history exists.
 */
export async function loadChatHistory(
  auditId: string,
  uid: string,
  vaultPassword: string
): Promise<ChatMessage[]> {
  const snapshot = await getDoc(doc(db, 'chat_histories', auditId));
  if (!snapshot.exists()) {
    return [];
  }

  const stored = snapshot.data() as StoredChatHistory;

  // Guard: only decrypt data that belongs to the requesting user.
  if (stored.uid !== uid) {
    return [];
  }

  const plaintext = await decryptData(
    stored.encryptedData,
    stored.iv,
    stored.salt,
    vaultPassword
  );
  return JSON.parse(plaintext) as ChatMessage[];
}

/**
 * Load and decrypt all SKSS registry entries belonging to a user.
 */
export async function loadSKSSRegistry(
  uid: string,
  vaultPassword: string
): Promise<SKSSEntry[]> {
  const q = query(collection(db, 'skss_registry'), where('uid', '==', uid));
  const snapshot = await getDocs(q);

  const results: SKSSEntry[] = [];

  for (const docSnap of snapshot.docs) {
    const stored = docSnap.data() as StoredSKSSEntry;
    const plaintext = await decryptData(
      stored.encryptedData,
      stored.iv,
      stored.salt,
      vaultPassword
    );
    results.push(JSON.parse(plaintext) as SKSSEntry);
  }

  return results;
}

// ---------------------------------------------------------------------------
// DELETE OPERATIONS
// ---------------------------------------------------------------------------

/**
 * CASCADE delete ALL data for a user across all four collections.
 * Resolves CG-DB-DEL and satisfies GDPR Article 17 (right to erasure).
 */
export async function deleteAllUserData(uid: string): Promise<void> {
  const collections = [
    'audits',
    'audit_metadata',
    'chat_histories',
    'skss_registry',
  ] as const;

  await Promise.all(
    collections.map(async (collectionName) => {
      const q = query(collection(db, collectionName), where('uid', '==', uid));
      const snapshot = await getDocs(q);
      await Promise.all(
        snapshot.docs.map((docSnap) =>
          deleteDoc(doc(db, collectionName, docSnap.id))
        )
      );
    })
  );
}
