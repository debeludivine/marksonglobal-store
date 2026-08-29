import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'mg_stores_offline_core';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getLocalDB(): Promise<IDBPDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB cannot be accessed on the server');
  }
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Offline cache for store products
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        // Write-Ahead Queue for network operations (Cart additions, checkout)
        if (!db.objectStoreNames.contains('mutation_queue')) {
          db.createObjectStore('mutation_queue', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export type MutationType = 'ADD_CART' | 'REMOVE_CART' | 'CHECKOUT' | 'TOGGLE_WISHLIST';

export interface MutationRecord {
  id?: number;
  type: MutationType;
  payload: any;
  timestamp: number;
  attempts: number;
}

// Queue user mutations locally when network signals drop
export async function queueMutation(type: MutationType, payload: any) {
  const db = await getLocalDB();
  
  const mutation: MutationRecord = {
    type,
    payload,
    timestamp: Date.now(),
    attempts: 0
  };
  
  await db.add('mutation_queue', mutation);
  
  // Try to sync immediately if we just queued something
  // We dynamically import the trigger to avoid circular dependencies
  const { triggerSyncEngine } = await import('./syncEngine');
  triggerSyncEngine();
}
