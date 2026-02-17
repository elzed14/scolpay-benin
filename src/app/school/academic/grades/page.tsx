"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function GradesPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Sélections
    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTerm, setSelectedTerm] = useState("");

    const BENIN_CLASSES = [
        "CI", "CP", "CE1", "CE2", "CM1", "CM2",
        "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"
    ];
    const [selectedClass, setSelectedClass] = useState("");

    const [classSubjects, setClassSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");

    const [students, setStudents] = useState<any[]>([]);
    const [gradesValues, setGradesValues] = useState<Record<string, string>>({}); // student_id -> value

    const [gradeType, setGradeType] = useState("DEVOIR");
    const [saving, setSaving] = useState(false);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            const res = await fetch("/api/school/terms");
            const data = await res.json();
            if (res.ok) {
                setTerms(data.terms || []);
                // Auto-select active term if any
                const active = data.terms?.find((t: any) => t.is_active);
                if (active) setSelectedTerm(active.id);
            }
        };
        loadInitialData();
    }, []);

    // Load subjects when class changes
    useEffect(() => {
        if (!selectedClass) return;
        const loadSubjects = async () => {
            const res = await fetch(`/api/school/classes/${encodeURIComponent(selectedClass)}/subjects`);
            const data = await res.json();
            if (res.ok) setClassSubjects(data.subjects || []);
        };
        loadSubjects();
    }, [selectedClass]);

    // Load students when all selections are made
    useEffect(() => {
        if (!selectedClass || !selectedTerm || !selectedSubject) return;
        loadStudents();
    }, [selectedClass, selectedTerm, selectedSubject]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            // Récupérer les élèves de la classe
            // Note: On utilise l'API public ou une query RPC, ici simulons avec une query local si possible ou via une nv route.
            // Pour simplifier, on va faire une requête Supabase directe côté client (autorisée par RLS).
            const { data: studentsData, error } = await supabase
                .from("students")
                .select("id, first_name, last_name, matricule")
                .eq("class_name", selectedClass)
                .order("last_name");

            if (error) throw error;
            setStudents(studentsData || []);
            setGradesValues({}); // Reset entries
        } catch (error) {
            console.error("Erreur chargement élèves:", error);
            toast.error("Impossible de charger la liste des élèves");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTerm || !selectedSubject || !selectedClass) return;

        // Filtrer les notes saisies
        const entries = Object.entries(gradesValues)
            .filter(([_, val]) => val !== "")
            .map(([studentId, val]) => ({
                student_id: studentId,
                value: parseFloat(val),
                type: gradeType,
                weight: gradeType === "COMPOSITION" ? 2 : 1, // Logique simple, à améliorer
            }));

        if (entries.length === 0) {
            toast.warning("Aucune note saisie");
            return;
        }

        setSaving(true);
        try {
            // Récupérer school_id (via user session or context, ici on doit l'avoir)
            // L'API server récupérera le school_id via le token user.
            const { data: { user } } = await supabase.auth.getUser();
            // Petite astuce: l'API va re-vérifier le school_id. On passe juste les IDs nécessaires.

            // On a besoin du school_id pour le body de l'API? 
            // L'API attend school_id. On peut le récupérer d'un élève ou le laisser l'API le déduire (Mieux: l'API le déduit).
            // Correction de l'API nécessaire pour déduire school_id du user.
            // Pour l'instant, passons par une route qui déduit school_id.

            // Ma route API attend 'school_id' dans le body pour vérifier. 
            // On va fetch le school_id via une petite requête ou le stocker dans un contexte.
            // Faisons simple: on récupère school_id d'un élève chargé (tous ont le même school_id).
            let schoolId = "";
            if (students.length > 0) {
                const { data } = await supabase.from("students").select("school_id").eq("id", students[0].id).single();
                schoolId = data?.school_id;
            }

            const res = await fetch("/api/school/grades/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    school_id: schoolId,
                    subject_id: selectedSubject,
                    term_id: selectedTerm,
                    grades: entries
                })
            });

            if (res.ok) {
                toast.success(`${entries.length} notes enregistrées !`);
                setGradesValues({}); // Clear form ? Ou garder pour voir ? Généralement on clear ou on affiche "Saved"
                // Ici on clear pour permettre une nouvelle saisie (ex: devoir suivant)
                setGradesValues({});
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur serveur");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/school/academic">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Saisie des Notes</h1>
                    <p className="text-gray-500">Enregistrez les résultats par classe.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration de la Saisie</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Période</Label>
                        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                                {terms.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Classe</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                                {BENIN_CLASSES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Matière</Label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder={!selectedClass ? "D'abord la classe..." : "Choisir..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {classSubjects.map(s => (
                                    <SelectItem key={s.id} value={s.subject_id}>{s.name}</SelectItem> // s.id is class_subject id, but we need subject_id for grades
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Type de Note</Label>
                        <Select value={gradeType} onValueChange={setGradeType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INTERRO">Interrogation</SelectItem>
                                <SelectItem value="DEVOIR">Devoir</SelectItem>
                                <SelectItem value="COMPOSITION">Composition</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Zone de Saisie */}
            {selectedClass && selectedSubject && (
                <Card className="border-t-4 border-t-blue-600">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Liste des Élèves ({students.length})</CardTitle>
                            <CardDescription>Entrez les notes sur 20.</CardDescription>
                        </div>
                        <Button onClick={handleSave} disabled={saving || students.length === 0} className="bg-blue-600 gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Enregistrer les notes
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Matricule</TableHead>
                                    <TableHead>Nom & Prénoms</TableHead>
                                    <TableHead className="w-[150px]">Note (/20)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                                            Aucun élève trouvé dans cette classe.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-mono text-xs">{student.matricule}</TableCell>
                                            <TableCell className="font-medium">
                                                {student.last_name} {student.first_name}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    step="0.25"
                                                    className="font-mono text-right"
                                                    placeholder="-"
                                                    value={gradesValues[student.id] || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 20)) {
                                                            setGradesValues(prev => ({ ...prev, [student.id]: val }));
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
