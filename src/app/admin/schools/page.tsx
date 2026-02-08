"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Search, Loader2, Phone, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface School {
    id: string;
    name: string;
    momo_number: string;
    is_verified: boolean;
    created_at: string;
    contact_phone: string;
    address: string;
}

export default function AdminSchoolsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    const fetchSchools = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("schools")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSchools(data || []);
        } catch (_error) {
            toast.error("Erreur lors du chargement des écoles.");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    const handleToggleVerify = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("schools")
                .update({ is_verified: !currentStatus })
                .eq("id", id);

            if (error) throw error;

            toast.success(currentStatus ? "École dévalidée" : "École validée avec succès !");
            fetchSchools();
        } catch (_error) {
            toast.error("Erreur lors de la mise à jour.");
        }
    };

    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.momo_number?.includes(searchTerm)
    );

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Écoles</h1>
                    <p className="text-sm text-gray-500">Validez les établissements pour autoriser les paiements.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher par nom ou numéro MoMo..."
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>École</TableHead>
                                <TableHead>MoMo Pay</TableHead>
                                <TableHead>Date Inscription</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSchools.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-400 italic">
                                        Aucune école trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSchools.map((school) => (
                                    <TableRow key={school.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm uppercase">{school.name}</p>
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Phone className="h-2 w-2" /> {school.contact_phone || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">
                                                {school.momo_number}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {new Date(school.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {school.is_verified ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2">
                                                    <CheckCircle className="h-3 w-3" /> Certifiée
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 px-2">
                                                    <XCircle className="h-3 w-3" /> En attente
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant={school.is_verified ? "outline" : "default"}
                                                className={school.is_verified ? "text-gray-500" : "bg-blue-600 hover:bg-blue-700"}
                                                onClick={() => handleToggleVerify(school.id, school.is_verified)}
                                            >
                                                {school.is_verified ? "Revoquer" : "Valider"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
