'use client';

import { useOfflineMode } from '@/hooks/useOfflineMode';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OfflineStatus() {
    const { online, pendingCount, isSyncing, syncNow } = useOfflineMode();

    return (
        <div className="flex items-center gap-2" title={online ? 'Connecté' : 'Mode hors ligne'}>
            {pendingCount > 0 && (
                <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
                    onClick={syncNow}
                >
                    <Database className="h-3 w-3 mr-1" />
                    {pendingCount} en attente
                </Badge>
            )}

            {online ? (
                <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs hidden sm:inline">En ligne</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-red-500">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs hidden sm:inline">Hors ligne</span>
                </div>
            )}

            {pendingCount > 0 && online && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={syncNow}
                    disabled={isSyncing}
                    className="h-6 w-6 p-0"
                    title="Synchroniser maintenant"
                >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
            )}
        </div>
    );
}
