/**
 * Firestore storage for LEX FORENSICA v7.0
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
import { FastMetadata } from '../services/gemini';

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
  messages: ChatMessage[];
  updatedAt: number;
}

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

export async function saveFastMetadata(uid: string, metadata: FastMetadata): Promise<void> {
  const path = `fast_indices/${metadata.auditId}`;
  try {
    await setDoc(doc(db, 'fast_indices', metadata.auditId), {
      ...metadata,
      uid,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getFastMetadata(uid: string): Promise<FastMetadata[]> {
  const path = 'fast_indices';
  const q = query(collection(db, 'fast_indices'), where('uid', '==', uid));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FastMetadata);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveChatHistory(uid: string, messages: ChatMessage[]): Promise<void> {
  const path = `chat_histories/${uid}`;
  try {
    await setDoc(doc(db, 'chat_histories', uid), {
      uid,
      messages,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getChatHistory(uid: string): Promise<ChatMessage[]> {
  const path = `chat_histories/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'chat_histories', uid));
    if (docSnap.exists()) {
      return docSnap.data().messages as ChatMessage[];
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
