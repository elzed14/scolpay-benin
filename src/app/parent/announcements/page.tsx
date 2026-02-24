"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Bell, FileText, Download } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    content: string;
    attachment_url?: string;
    created_at: string;
    school_name?: string;
}

export default function ParentAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // On utilise la même API que l'école pour l'instant, 
                // mais il faudra une route spécifique si l'API école filtre par owner_id.
                // L'API actuelle filtre par "owner_id" de l'utilisateur connecté.
                // Or le parent N'EST PAS l'owner de l'école.
                // DONC : Il faut modifier l'API ou en créer une nouvelle pour les parents.
                // Pour l'instant, faisons une route dédiée : /api/parent/announcements
                const response = await fetch("/api/parent/announcements");
                if (response.ok) {
                    const data = await response.json();
                    setAnnouncements(data.announcements || []);
                }
            } catch (error) {
                console.error("Erreur chargement annonces:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Actualités de l&apos;école</h1>
                    <p className="text-gray-500">Restez informé des dernières nouvelles</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : announcements.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Aucune annonce pour le moment</h3>
                        <p className="text-gray-500 mt-1">Les informations de l&apos;école apparaîtront ici.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id} className="border-l-4 border-l-blue-600">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-gray-800 flex justify-between items-start">
                                    <span>{announcement.title}</span>
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {format(new Date(announcement.created_at), "d MMM yyyy", { locale: fr })}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>

                                {announcement.attachment_url && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Pièce jointe</p>
                                                <p className="text-xs text-gray-500">Document ou image</p>
                                            </div>
                                        </div>
                                        <a
                                            href={announcement.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Download className="h-4 w-4" />
                                                Télécharger
                                            </Button>
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
