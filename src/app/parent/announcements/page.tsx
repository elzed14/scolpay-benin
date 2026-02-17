"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Megaphone, Bell } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
    school_name?: string; // Optionnel si on récupère le nom de l'école
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
                    <h1 className="text-2xl font-bold text-gray-800">Actualités de l'école</h1>
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
                        <p className="text-gray-500 mt-1">Les informations de l'école apparaîtront ici.</p>
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
                            <CardContent>
                                <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
