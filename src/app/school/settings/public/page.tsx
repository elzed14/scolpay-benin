"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PublicPagePreview from "@/components/school/PublicPagePreview";
import { Loader2, Settings, Globe, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SchoolData {
    id: string;
    name: string;
    slug: string | null;
    logo_url: string | null;
    banner_url: string | null;
    description: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    is_public_visible: boolean;
}

export default function PublicPageSettings() {
    const [school, setSchool] = useState<SchoolData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchoolData();
    }, []);

    const fetchSchoolData = async () => {
        try {
            const response = await fetch("/api/school/public-page");
            if (!response.ok) throw new Error("Erreur");
            const data = await response.json();
            setSchool(data.school);
        } catch (error) {
            toast.error("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updates: Partial<SchoolData>) => {
        const response = await fetch("/api/school/public-page", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Erreur lors de la mise à jour");
        }

        setSchool(prev => prev ? { ...prev, ...updates } : null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!school) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Aucune école trouvée</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Page publique</h1>
                    <p className="text-gray-500">
                        Personnalisez la page publique de votre établissement
                    </p>
                </div>
            </div>

            <Tabs defaultValue="appearance" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Apparence
                    </TabsTrigger>
                    <TabsTrigger value="sharing" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Partage
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="appearance">
                    <PublicPagePreview school={school} onUpdate={handleUpdate} />
                </TabsContent>

                <TabsContent value="sharing">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Intégration réseaux sociaux */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Partage sur les réseaux</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Partagez le lien de votre page publique sur les réseaux sociaux pour atteindre plus de parents.
                                </p>
                                <div className="flex gap-2">
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/public/school/${school.slug || school.id}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button variant="outline" className="w-full bg-[#1877f2] text-white hover:bg-[#1864d4] border-0">
                                            Facebook
                                        </Button>
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/public/school/${school.slug || school.id}`)}&text=${encodeURIComponent(`Payez vos frais de scolarité à ${school.name} en toute sécurité via ScolPay`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button variant="outline" className="w-full bg-[#1da1f2] text-white hover:bg-[#1a8cd8] border-0">
                                            Twitter
                                        </Button>
                                    </a>
                                </div>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Payez vos frais de scolarité à ${school.name} en toute sécurité: ${typeof window !== "undefined" ? window.location.origin : ""}/public/school/${school.slug || school.id}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" className="w-full bg-[#25d366] text-white hover:bg-[#22c55e] border-0">
                                        WhatsApp
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        {/* Flyers imprimables */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Flyers imprimables</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Imprimez des flyers avec le QR Code de votre école pour distribuer aux parents.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        // Générer un flyer PDF simple
                                        const flyerContent = `
                                            <html>
                                            <head>
                                                <title>Flyer - ${school.name}</title>
                                                <style>
                                                    body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                                                    .logo { max-width: 150px; margin: 0 auto 20px; }
                                                    h1 { color: ${school.primary_color || '#1e40af'}; }
                                                    .qr { margin: 20px auto; }
                                                    .url { color: #666; font-size: 14px; }
                                                </style>
                                            </head>
                                            <body>
                                                ${school.logo_url ? `<img src="${school.logo_url}" class="logo" alt="Logo" />` : ''}
                                                <h1>${school.name}</h1>
                                                <p>Payez vos frais de scolarité en ligne</p>
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/public/school/${school.slug || school.id}`)}" class="qr" alt="QR Code" />
                                                <p class="url">${typeof window !== "undefined" ? window.location.origin : ""}/public/school/${school.slug || school.id}</p>
                                            </body>
                                            </html>
                                        `;
                                        const printWindow = window.open('', '_blank');
                                        if (printWindow) {
                                            printWindow.document.write(flyerContent);
                                            printWindow.document.close();
                                            printWindow.print();
                                        }
                                    }}
                                >
                                    Imprimer un flyer
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Statistiques de visite */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Conseils pour attirer plus de parents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h3 className="font-semibold text-blue-800 mb-2">Partagez sur WhatsApp</h3>
                                        <p className="text-sm text-blue-600">
                                            Envoyez le lien à vos groupes de parents pour un accès rapide au paiement.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <h3 className="font-semibold text-green-800 mb-2">Imprimez le QR Code</h3>
                                        <p className="text-sm text-green-600">
                                            Affichez le QR Code à l'entrée de l'école et sur les documents officiels.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <h3 className="font-semibold text-purple-800 mb-2">Mettez à jour régulièrement</h3>
                                        <p className="text-sm text-purple-600">
                                            Une page bien renseignée inspire confiance aux parents.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Palette icon component
function Palette({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
        </svg>
    );
}