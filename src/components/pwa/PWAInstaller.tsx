'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);

            // Show banner after 5 seconds
            setTimeout(() => {
                setShowBanner(true);
            }, 5000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowBanner(false);
            toast.success('ScolPay installé avec succès !');
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowBanner(false);
            toast.success('Installation en cours...');
        }
    };

    const dismissBanner = () => {
        setShowBanner(false);
        // Hide for 24 hours
        localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    };

    if (isInstalled || !showBanner) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-blue-200 p-4 z-50 animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Installer ScolPay</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Installez l'application sur votre appareil pour un accès rapide et hors ligne.
                    </p>
                    <div className="flex gap-2 mt-3">
                        <Button
                            size="sm"
                            onClick={handleInstall}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Installer
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={dismissBanner}
                        >
                            Plus tard
                        </Button>
                    </div>
                </div>
                <button
                    onClick={dismissBanner}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}