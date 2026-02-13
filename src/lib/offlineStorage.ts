// Stockage local pour le mode hors ligne
const DB_NAME = 'scolpay-offline';
const DB_VERSION = 1;
const TRANSACTIONS_STORE = 'pending-transactions';

interface PendingTransaction {
    id: string;
    data: {
        studentId: string;
        amount: number;
        type: string;
        description?: string;
        schoolId?: string;
    };
    timestamp: number;
    synced: boolean;
}

// Ouvrir la base de données IndexedDB
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
                const store = db.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id' });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Sauvegarder une transaction en attente
export async function savePendingTransaction(transaction: PendingTransaction['data']): Promise<string> {
    const db = await openDB();
    const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const pendingTransaction: PendingTransaction = {
        id,
        data: transaction,
        timestamp: Date.now(),
        synced: false,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.add(pendingTransaction);

        request.onsuccess = () => {
            db.close();
            resolve(id);
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

// Récupérer toutes les transactions en attente
export async function getPendingTransactions(): Promise<PendingTransaction[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction([TRANSACTIONS_STORE], 'readonly');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            db.close();
            resolve(request.result.filter((t: PendingTransaction) => !t.synced));
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

// Marquer une transaction comme synchronisée
export async function markTransactionAsSynced(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
            db.close();
            resolve();
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

// Supprimer une transaction
export async function deletePendingTransaction(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
            db.close();
            resolve();
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

// Vérifier si l'application est en ligne
export function isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
}

// Synchroniser les transactions en attente
export async function syncPendingTransactions(): Promise<{ success: number; failed: number }> {
    if (!isOnline()) {
        return { success: 0, failed: 0 };
    }

    const pending = await getPendingTransactions();
    let success = 0;
    let failed = 0;

    for (const transaction of pending) {
        try {
            const response = await fetch('/api/transactions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction.data),
            });

            if (response.ok) {
                await markTransactionAsSynced(transaction.id);
                success++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error('Sync error:', error);
            failed++;
        }
    }

    return { success, failed };
}

// Écouter les changements de connectivité
export function listenToConnectivityChanges(
    onOnline: () => void,
    onOffline: () => void
): () => void {
    if (typeof window === 'undefined') return () => { };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
}
