import { openDB } from 'idb';

const DB_NAME = 'fams_offline_db';
const DB_VERSION = 1;

export async function initOfflineDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'uuid' });
      }
      if (!db.objectStoreNames.contains('offlineAssetsCache')) {
        db.createObjectStore('offlineAssetsCache', { keyPath: 'assetId' });
      }
    }
  });
}

export async function enqueueOfflineTransaction(transaction) {
  const db = await initOfflineDB();
  const tx = {
    uuid: 'TX-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    ...transaction
  };
  await db.put('syncQueue', tx);
  return tx;
}

export async function getPendingOfflineTransactions() {
  const db = await initOfflineDB();
  return await db.getAll('syncQueue');
}

export async function clearSyncedTransaction(uuid) {
  const db = await initOfflineDB();
  await db.delete('syncQueue', uuid);
}
