/**
 * Firestore storage for LEX FORENSICA v8.0
 * Stores encrypted audit data scoped by user UID.
 */

import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  handleFirestoreError,
  OperationType,
  deleteDoc,
  getDocs
} from '../firebase';
import { FastMetadata } from '../types';
import { encryptData, decryptData } from './crypto';
import { get, set, del } from 'idb-keyval';

export interface AuditRecord {
  id: string;
  uid: string;
  encryptedData: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserChatHistory {
  uid: string;
  encryptedMessages: string;
  updatedAt: number;
}

/**
 * IndexedDB Storage for Inputs (Zero-Knowledge)
 */
export async function saveEncryptedInput(uid: string, type: 'inputA' | 'inputB', data: string, password: string): Promise<void> {
  const encrypted = await encryptData(data, password);
  await set(`input_${uid}_${type}`, encrypted);
}

export async function getEncryptedInput(uid: string, type: 'inputA' | 'inputB', password: string): Promise<string> {
  const encrypted = await get(`input_${uid}_${type}`);
  if (!encrypted) return "";
  try {
    return await decryptData(encrypted, password);
  } catch (e) {
    return "";
  }
}

export async function clearEncryptedInputs(uid: string): Promise<void> {
  await del(`input_${uid}_inputA`);
  await del(`input_${uid}_inputB`);
}

/**
 * Firestore Storage
 */
export async function saveAudit(record: AuditRecord): Promise<void> {
  const path = `audits/${record.id}`;
  try {
    await setDoc(doc(db, 'audits', record.id), {
      ...record,
      createdAt: Timestamp.fromMillis(record.createdAt),
      updatedAt: Timestamp.fromMillis(record.updatedAt)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveFastMetadata(uid: string, metadata: FastMetadata, password: string): Promise<void> {
  const path = `fast_indices/${metadata.auditId}`;
  try {
    const encryptedMetadata = await encryptData(JSON.stringify(metadata), password);
    await setDoc(doc(db, 'fast_indices', metadata.auditId), {
      auditId: metadata.auditId,
      encryptedMetadata,
      uid,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getFastMetadata(uid: string, password: string): Promise<FastMetadata[]> {
  const path = 'fast_indices';
  const q = query(collection(db, 'fast_indices'), where('uid', '==', uid));
  try {
    const snapshot = await getDocs(q);
    const results: FastMetadata[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.encryptedMetadata) {
        try {
          const decrypted = await decryptData(data.encryptedMetadata, password);
          results.push(JSON.parse(decrypted));
        } catch (e) {
          console.error("Failed to decrypt metadata for audit:", data.auditId);
        }
      }
    }
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveChatHistory(uid: string, messages: ChatMessage[], password: string): Promise<void> {
  const path = `chat_histories/${uid}`;
  try {
    const encryptedMessages = await encryptData(JSON.stringify(messages), password);
    await setDoc(doc(db, 'chat_histories', uid), {
      uid,
      encryptedMessages,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getChatHistory(uid: string, password: string): Promise<ChatMessage[]> {
  const path = `chat_histories/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'chat_histories', uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.encryptedMessages) {
        try {
          const decrypted = await decryptData(data.encryptedMessages, password);
          return JSON.parse(decrypted) as ChatMessage[];
        } catch (e) {
          console.error("Failed to decrypt chat history");
        }
      }
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getAudit(id: string): Promise<AuditRecord | undefined> {
  const path = `audits/${id}`;
  try {
    const docSnap = await getDoc(doc(db, 'audits', id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
      } as AuditRecord;
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeToUserAudits(uid: string, callback: (audits: AuditRecord[]) => void) {
  const path = 'audits';
  const q = query(collection(db, 'audits'), where('uid', '==', uid));
  
  return onSnapshot(q, (snapshot) => {
    const audits = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
      } as AuditRecord;
    });
    callback(audits);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function deleteAudit(id: string): Promise<void> {
  const path = `audits/${id}`;
  try {
    await deleteDoc(doc(db, 'audits', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
