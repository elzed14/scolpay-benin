"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    UserPlus,
    Check,
    X,
    Phone,
    Mail,
    Calendar,
    Search,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface PreRegistration {
    id: string;
    first_name: string;
    last_name: string;
    parent_phone: string;
    parent_email: string | null;
    class_name: string;
    status: string;
    created_at: string;
}

export default function PreRegistrationsPage() {
    const [registrations, setRegistrations] = useState<PreRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await fetch("/api/school/pre-registrations");
            if (!response.ok) throw new Error("Erreur");
            const data = await response.json();
            setRegistrations(data.registrations);
        } catch (error) {
            toast.error("Impossible de charger les pré-inscriptions");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/school/pre-registrations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error();

            setRegistrations(prev =>
                prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg)
            );
            toast.success("Statut mis à jour");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        `${reg.first_name} ${reg.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parent_phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/school/students">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pré-inscriptions</h1>
                        <p className="text-gray-500">
                            Gérez les demandes reçues via votre page publique
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg">Demandes en attente</CardTitle>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-10 pr-4 py-2 border rounded-md w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Élève</th>
                                    <th className="px-4 py-3 font-semibold">Classe</th>
                                    <th className="px-4 py-3 font-semibold">Contact Parent</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Statut</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            Aucune demande trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {reg.first_name} {reg.last_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                    {reg.class_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3" />
                                                        {reg.parent_phone}
                                                    </div>
                                                    {reg.parent_email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Mail className="h-3 w-3" />
                                                            {reg.parent_email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(reg.created_at), 'dd MMM yyyy', { locale: fr })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {reg.status === 'pending' ? 'En attente' :
                                                        reg.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {reg.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                                onClick={() => handleStatusUpdate(reg.id, 'confirmed')}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={() => handleStatusUpdate(reg.id, 'cancelled')}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        Convertir
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
