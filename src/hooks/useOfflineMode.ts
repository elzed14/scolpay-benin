'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    isOnline,
    listenToConnectivityChanges,
    savePendingTransaction,
    getPendingTransactions,
    syncPendingTransactions,
} from '@/lib/offlineStorage';
import { toast } from 'sonner';

interface UseOfflineModeReturn {
    online: boolean;
    pendingCount: number;
    isSyncing: boolean;
    saveTransaction: (data: {
        studentId: string;
        amount: number;
        type: string;
        description?: string;
        schoolId?: string;
    }) => Promise<void>;
    syncNow: () => Promise<void>;
}

export function useOfflineMode(): UseOfflineModeReturn {
    const [online, setOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Mettre à jour le statut de connexion
    useEffect(() => {
        setOnline(isOnline());

        const unsubscribe = listenToConnectivityChanges(
            () => {
                setOnline(true);
                toast.success('Connexion rétablie !', {
                    description: 'Synchronisation des transactions en cours...',
                });
                // Auto-sync quand on revient en ligne
                syncNow();
            },
            () => {
                setOnline(false);
                toast.warning('Mode hors ligne activé', {
                    description: 'Les transactions seront sauvegardées localement.',
                });
            }
        );

        return unsubscribe;
    }, []);

    // Mettre à jour le compteur de transactions en attente
    const updatePendingCount = useCallback(async () => {
        const pending = await getPendingTransactions();
        setPendingCount(pending.length);
    }, []);

    useEffect(() => {
        updatePendingCount();
        // Mettre à jour toutes les 5 secondes
        const interval = setInterval(updatePendingCount, 5000);
        return () => clearInterval(interval);
    }, [updatePendingCount]);

    // Sauvegarder une transaction (en ligne ou hors ligne)
    const saveTransaction = useCallback(
        async (data: {
            studentId: string;
            amount: number;
            type: string;
            description?: string;
            schoolId?: string;
        }) => {
            if (isOnline()) {
                // Mode en ligne : envoyer directement
                try {
                    const response = await fetch('/api/transactions/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        throw new Error('Erreur serveur');
                    }

                    toast.success('Transaction enregistrée avec succès !');
                } catch (error) {
                    // En cas d'erreur, sauvegarder localement
                    await savePendingTransaction(data);
                    toast.info('Transaction sauvegardée localement', {
                        description: 'Elle sera synchronisée automatiquement.',
                    });
                    updatePendingCount();
                }
            } else {
                // Mode hors ligne : sauvegarder localement
                await savePendingTransaction(data);
                toast.info('Transaction sauvegardée localement', {
                    description: 'Elle sera synchronisée quand la connexion sera rétablie.',
                });
                updatePendingCount();
            }
        },
        [updatePendingCount]
    );

    // Synchroniser manuellement
    const syncNow = useCallback(async () => {
        if (!isOnline()) {
            toast.error('Impossible de synchroniser : vous êtes hors ligne');
            return;
        }

        setIsSyncing(true);
        toast.info('Synchronisation en cours...');

        try {
            const result = await syncPendingTransactions();

            if (result.success > 0) {
                toast.success(`${result.success} transaction(s) synchronisée(s) !`);
            }
            if (result.failed > 0) {
                toast.error(`${result.failed} transaction(s) en échec`);
            }
            if (result.success === 0 && result.failed === 0) {
                toast.info('Aucune transaction en attente');
            }

            updatePendingCount();
        } catch (error) {
            toast.error('Erreur lors de la synchronisation');
            console.error(error);
        } finally {
            setIsSyncing(false);
        }
    }, [updatePendingCount]);

    return {
        online,
        pendingCount,
        isSyncing,
        saveTransaction,
        syncNow,
    };
}
