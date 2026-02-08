"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Send, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    matricule: string;
    class_name: string;
    total_fee_due: number;
    // Pour l'instant, on se base sur 'total_fee_due' déclaré. 
    // V2: Calculer Total Configuré - Total Transactions
}

export default function RecoveryPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    const fetchDebtors = useCallback(async () => {
        try {
            // Fetch students with debts
            const { data, error } = await supabase
                .from("students")
                .select("*")
                .gt("total_fee_due", 0)
                .order("total_fee_due", { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (_error) {
            toast.error("Erreur chargement débiteurs");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchDebtors();
    }, [fetchDebtors]);

    const handleSendReminder = (student: Student, type: "sms" | "whatsapp") => {
        const message = `Bonjour, sauf erreur de notre part, le solde de scolarité de ${student.first_name} ${student.last_name} (${student.matricule}) est de ${student.total_fee_due.toLocaleString()} FCFA. Merci de régulariser au plus vite.`;

        if (type === "whatsapp") {
            // Simulation lien WhatsApp (nécessiterait le numéro de téléphone parent en DB)
            // Format: https://wa.me/[NUMBER]?text=[MESSAGE]
            const encodedMsg = encodeURIComponent(message);
            window.open(`https://wa.me/?text=${encodedMsg}`, "_blank");
            toast.success("WhatsApp ouvert !");
        } else {
            // Simulation SMS (nécessiterait API SMS)
            console.log("SMS Sent:", message);
            toast.success("Rappel marqué comme envoyé !");
        }
    };

    const filteredStudents = students.filter(s =>
        s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalDebt = students.reduce((acc, curr) => acc + curr.total_fee_due, 0);

    return (
        <DashboardLayout role="school">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">Recouvrement</h1>
                    <p className="text-gray-500">Gérez les impayés et relancez les parents.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-red-100 bg-red-50/50">
                        <CardHeader>
                            <CardTitle className="text-red-800 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Reste à Percevoir
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-red-600 font-outfit">
                                {totalDebt.toLocaleString()} <span className="text-lg text-red-400">FCFA</span>
                            </div>
                            <p className="text-sm text-red-400 mt-2">
                                Cumulé sur {students.length} élèves
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-900 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-blue-100">Action de Masse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-blue-200">
                                Relancez tous les parents en retard d'un coup (nécessite Pack Premium SMS).
                            </p>
                            <Button className="w-full bg-white text-blue-900 hover:bg-blue-50" disabled>
                                Relancer Tout (Premium)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-lg border">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher un élève..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Élève</TableHead>
                                <TableHead>Classe</TableHead>
                                <TableHead>Reste à Payer</TableHead>
                                <TableHead className="text-right">Relancer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                                        Aucun impayé trouvé. Bravo !
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="font-bold text-gray-900">{s.last_name} {s.first_name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{s.matricule}</div>
                                        </TableCell>
                                        <TableCell>{s.class_name}</TableCell>
                                        <TableCell className="font-bold text-red-600">
                                            {s.total_fee_due.toLocaleString()} FCFA
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 gap-1"
                                                onClick={() => handleSendReminder(s, "whatsapp")}
                                            >
                                                <MessageCircle className="h-3 w-3" /> WhatsApp
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 border-gray-300"
                                                onClick={() => handleSendReminder(s, "sms")}
                                            >
                                                <Send className="h-3 w-3" /> SMS
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
