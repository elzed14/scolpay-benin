'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Scan, X, Camera, Flashlight } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeScannerProps {
    onScan: (data: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function QRCodeScanner({ onScan, isOpen, onClose }: QRCodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const [isFlashOn, setIsFlashOn] = useState(false);

    const stopScanner = useCallback(async () => {
        try {
            if (scannerRef.current) {
                const state = scannerRef.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING) {
                    await scannerRef.current.stop();
                }
                scannerRef.current = null;
            }
            setIsScanning(false);
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    }, []);

    const handleScan = useCallback((data: string) => {
        toast.success('QR Code scanné avec succès !');
        onScan(data);
        stopScanner();
        onClose();
    }, [onScan, onClose, stopScanner]);

    const startScanner = useCallback(async () => {
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                const cameraId = devices[devices.length - 1].id;
                scannerRef.current = new Html5Qrcode('qr-reader');

                await scannerRef.current.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1,
                    },
                    (decodedText) => handleScan(decodedText),
                    () => { }
                );
                setIsScanning(true);
            } else {
                setHasCamera(false);
                toast.error('Aucune caméra détectée');
            }
        } catch (error) {
            console.error('Error starting scanner:', error);
            setHasCamera(false);
            toast.error('Erreur d\'accès à la caméra');
        }
    }, [handleScan]);

    useEffect(() => {
        if (isOpen) {
            startScanner();
        } else {
            stopScanner();
        }
        return () => { stopScanner(); };
    }, [isOpen, startScanner, stopScanner]);

    const toggleFlash = () => {
        setIsFlashOn(!isFlashOn);
        toast.info('Fonctionnalité lampe torche en développement');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scan className="h-5 w-5" />
                        Scanner un QR Code
                    </DialogTitle>
                </DialogHeader>
                <div className="relative">
                    {!hasCamera ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
                            <Camera className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 text-center">Caméra non disponible</p>
                            <Button variant="outline" className="mt-4" onClick={() => { setHasCamera(true); startScanner(); }}>
                                Réessayer
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div id="qr-reader" className="w-full aspect-square rounded-lg overflow-hidden" />
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-lg">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={toggleFlash} disabled={!hasCamera}>
                        <Flashlight className={`h-4 w-4 mr-2 ${isFlashOn ? 'text-yellow-500' : ''}`} />
                        Lampe
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => { stopScanner(); onClose(); }}>
                        <X className="h-4 w-4 mr-2" /> Fermer
                    </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Positionnez le QR Code dans le cadre</p>
            </DialogContent>
        </Dialog>
    );
}
