"use client";

import { useEffect, useState } from "react";
import CreateAnnouncementDialog from "@/components/communication/CreateAnnouncementDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Megaphone, ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Announcement {
    id: string;
    title: string;
    content: string;
    attachment_url?: string;
    created_at: string;
}

export default function CommunicationPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/school/announcements");
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

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/school">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Communication</h1>
                        <p className="text-gray-500">Gérez les annonces et le cahier de liaison numérique</p>
                    </div>
                </div>
                <CreateAnnouncementDialog onSuccess={fetchAnnouncements} />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : announcements.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Megaphone className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Aucune annonce</h3>
                        <p className="text-gray-500 mt-1">Commencez par publier une première annonce pour les parents.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        {announcement.title}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Publié le {format(new Date(announcement.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                    </p>
                                </div>
                                {/* Option de suppression future */}
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
