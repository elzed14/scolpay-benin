'use client';

import { useState } from 'react';
import { Scan, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCodeScanner from './QRCodeScanner';
import { toast } from 'sonner';

interface QRScanButtonProps {
    onScanSuccess?: (data: string) => void;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showLabel?: boolean;
}

export default function QRScanButton({
    onScanSuccess,
    variant = 'default',
    size = 'default',
    className = '',
    showLabel = true,
}: QRScanButtonProps) {
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScan = (data: string) => {
        // Essayer de parser les données JSON
        try {
            const parsed = JSON.parse(data);
            if (parsed.studentId || parsed.matricule) {
                toast.success('Élève identifié !', {
                    description: `Matricule: ${parsed.matricule || parsed.studentId}`,
                });
            }
        } catch {
            // Si ce n'est pas du JSON, utiliser tel quel
            toast.success('QR Code scanné', { description: data });
        }

        if (onScanSuccess) {
            onScanSuccess(data);
        }
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={() => setIsScannerOpen(true)}
                className={className}
            >
                {size === 'icon' ? (
                    <QrCode className="h-4 w-4" />
                ) : (
                    <>
                        <Scan className="h-4 w-4 mr-2" />
                        {showLabel && 'Scanner QR'}
                    </>
                )}
            </Button>

            <QRCodeScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
        </>
    );
}
