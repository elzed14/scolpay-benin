"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Upload, Trash2, Loader2, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useSubscription } from "@/hooks/useSubscription";
import { AlertTriangle } from "lucide-react";
import StudentIdCard from "@/components/students/StudentIdCard";

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    matricule: string;
    class_name: string;
    total_fee_due: number;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { isRestricted } = useSubscription();
    const [newStudent, setNewStudent] = useState({
        first_name: "",
        last_name: "",
        matricule: "",
        class_name: "",
        total_fee_due: 0
    });
    const [adding, setAdding] = useState(false);

    const supabase = createClient();

    const fetchStudents = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("students")
                .select("*")
                .order("last_name", { ascending: true });

            if (error) throw error;
            setStudents(data || []);
        } catch (_error: unknown) {
            toast.error("Erreur lors du chargement des élèves");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const [schoolName, setSchoolName] = useState("");

    // ... imports

    const fetchSchoolDetails = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("schools").select("name").eq("owner_id", user.id).single();
        if (data) setSchoolName(data.name);
    }, [supabase]);

    useEffect(() => {
        fetchStudents();
        fetchSchoolDetails();
    }, [fetchStudents, fetchSchoolDetails]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isRestricted) {
            toast.error("Action impossible : Abonnement expiré.");
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        toast.promise(
            fetch("/api/students/import", {
                method: "POST",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) throw new Error("Erreur import");
                fetchStudents();
            }),
            {
                loading: "Importation des élèves...",
                success: "Élèves importés avec succès !",
                error: "Erreur lors de l'importation.",
            }
        );
    };

    const handleAddStudent = async () => {
        if (isRestricted) return;
        if (!newStudent.first_name || !newStudent.last_name || !newStudent.matricule) {
            toast.error("Veuillez remplir les champs obligatoires.");
            return;
        }

        setAdding(true);
        try {
            // Get current user's school_id
            const { data: { user } } = await supabase.auth.getUser();
            const { data: school } = await supabase.from("schools").select("id").eq("owner_id", user?.id).single();

            const { error } = await supabase.from("students").insert({
                ...newStudent,
                school_id: school?.id
            });

            if (error) throw error;

            toast.success("Élève ajouté !");
            setIsAddModalOpen(false);
            setNewStudent({ first_name: "", last_name: "", matricule: "", class_name: "", total_fee_due: 0 });
            fetchStudents();
        } catch (error) {
            toast.error("Erreur lors de l'ajout.");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (isRestricted) {
            toast.error("Action impossible : Abonnement expiré.");
            return;
        }
        if (!confirm("Supprimer cet élève ?")) return;

        try {
            const { error } = await supabase.from("students").delete().eq("id", id);
            if (error) throw error;
            toast.success("Élève supprimé");
            fetchStudents();
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const filteredStudents = students.filter(s =>
        s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="school">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Gestion des Élèves</h1>
                        <p className="text-sm text-gray-500">Gérez la base de données des élèves de votre établissement.</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 gap-2" disabled={isRestricted}>
                                    <UserPlus className="h-4 w-4" /> Ajouter un élève
                                </Button>
                            </DialogTrigger>
                            {!isRestricted && (
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nouvel Élève</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nom</Label>
                                                <Input value={newStudent.last_name} onChange={e => setNewStudent({ ...newStudent, last_name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Prénoms</Label>
                                                <Input value={newStudent.first_name} onChange={e => setNewStudent({ ...newStudent, first_name: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Matricule</Label>
                                            <Input value={newStudent.matricule} onChange={e => setNewStudent({ ...newStudent, matricule: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Classe</Label>
                                            <Input value={newStudent.class_name} onChange={e => setNewStudent({ ...newStudent, class_name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Frais Scolaires (FCFA)</Label>
                                            <Input type="number" value={newStudent.total_fee_due} onChange={e => setNewStudent({ ...newStudent, total_fee_due: parseInt(e.target.value) })} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
                                        <Button className="bg-blue-600" onClick={handleAddStudent} disabled={adding}>
                                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            )}
                        </Dialog>

                        <Button variant="outline" className="gap-2 relative" disabled={isRestricted}>
                            <Upload className="h-4 w-4" /> Import Excel
                            {!isRestricted && (
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                />
                            )}
                        </Button>
                    </div>
                </div>

                {isRestricted && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-800 text-sm">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>Votre abonnement a expiré. Pour ajouter ou modifier des élèves, veuillez renouveler votre licence.</p>
                    </div>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher par nom, prénom ou matricule..."
                        className="pl-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Élève</TableHead>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Classe</TableHead>
                                <TableHead>Frais dus</TableHead>
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
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                                        Aucun élève trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                    <GraduationCap className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <span className="font-bold text-sm uppercase">{s.last_name} {s.first_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{s.matricule}</TableCell>
                                        <TableCell className="text-sm">{s.class_name}</TableCell>
                                        <TableCell className="font-semibold">{s.total_fee_due.toLocaleString()} FCFA</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <StudentIdCard student={s} schoolName={schoolName} />
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}>
                                                <Trash2 className="h-4 w-4" />
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
