import { getLocalDB, MutationRecord } from './localDb';

let isSyncing = false;
let syncTimeout: NodeJS.Timeout | null = null;

export async function triggerSyncEngine() {
  if (typeof window === 'undefined') return;
  if (isSyncing) return;
  
  // Only try to sync if we actually have a connection
  if (!navigator.onLine) {
    scheduleNextSync(10000);
    return;
  }

  isSyncing = true;

  try {
    const db = await getLocalDB();
    const tx = db.transaction('mutation_queue', 'readwrite');
    const store = tx.objectStore('mutation_queue');
    const mutations = (await store.getAll()) as MutationRecord[];

    for (const mutation of mutations) {
      if (!mutation.id) continue;

      if (mutation.attempts >= 5) {
        // Move task to a dead-letter log (or just delete for now to keep unblocked)
        console.error('[SyncEngine] Mutation failed max retries:', mutation);
        await store.delete(mutation.id);
        continue;
      }

      try {
        // Calculate delay based on previous connection attempts (exponential backoff)
        // 0 attempts = 0s, 1 attempt = 2s, 2 = 4s, 3 = 8s
        const backoffDelay = mutation.attempts === 0 ? 0 : Math.pow(2, mutation.attempts) * 1000;
        
        if (Date.now() - mutation.timestamp < backoffDelay && mutation.attempts > 0) {
          // Not ready to retry yet
          continue; 
        }

        // We use a new transaction to update attempts since the old one might have closed during awaits
        const updateTx = db.transaction('mutation_queue', 'readwrite');
        mutation.attempts += 1;
        mutation.timestamp = Date.now(); // reset timestamp for backoff window
        await updateTx.objectStore('mutation_queue').put(mutation);

        // Execute payload transmission over the wire
        const response = await fetch('/api/sync-mutation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mutation),
        });

        if (response.ok) {
          // Successful transmission, safe to clear out of local database storage
          const delTx = db.transaction('mutation_queue', 'readwrite');
          await delTx.objectStore('mutation_queue').delete(mutation.id);
        } else {
          console.warn('[SyncEngine] Server rejected mutation', response.status);
        }
      } catch (networkError) {
        // Network timed out or failed; silently catch and retry during the next loop cycle
        console.warn('[SyncEngine] Network link unstable. Retrying in background...');
      }
    }
  } catch (err) {
    console.error('[SyncEngine] Critical error reading local DB', err);
  } finally {
    isSyncing = false;
    // Schedule subsequent background evaluation check
    scheduleNextSync(10000);
  }
}

function scheduleNextSync(ms: number) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(triggerSyncEngine, ms);
}

// Initial kickoff if loaded in browser
if (typeof window !== 'undefined') {
  // Wait a few seconds for initial page render before stealing cycles
  setTimeout(triggerSyncEngine, 3000);
  
  // Try instantly when network comes back online
  window.addEventListener('online', triggerSyncEngine);
}
