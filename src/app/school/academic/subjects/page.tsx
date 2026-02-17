"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Book, ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Subject {
    id: string;
    name: string;
    code: string;
}

interface ClassSubject {
    id: string;
    subject_id: string;
    name: string;
    code: string;
    coefficient: number;
}

export default function SubjectsPage() {
    // State pour Catalogue
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newSubject, setNewSubject] = useState({ name: "", code: "" });
    const [creatingSubject, setCreatingSubject] = useState(false);

    // State pour Configuration Classe
    const [classes, setClasses] = useState<string[]>([]); // Liste des noms de classes (récupérés via students ?)
    // Note: Idéalement il faudrait une table 'classes', mais on utilise un champ 'class_name' dans 'students'.
    // Pour l'instant, on va définir une liste statique ou récupérer les classes distinctes des élèves.
    // Simplification : Liste statique commune Bénin pour commencer.
    const BENIN_CLASSES = [
        "CI", "CP", "CE1", "CE2", "CM1", "CM2",
        "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"
    ];
    const [selectedClass, setSelectedClass] = useState<string>(BENIN_CLASSES[6]); // Défaut 6ème
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
    const [selectedSubjectToAdd, setSelectedSubjectToAdd] = useState("");
    const [coefficient, setCoefficient] = useState(1);
    const [addingToClass, setAddingToClass] = useState(false);

    const [loading, setLoading] = useState(true);

    // Chargement initial
    useEffect(() => {
        fetchSubjects();
    }, []);

    // Chargement quand la classe change
    useEffect(() => {
        if (selectedClass) {
            fetchClassSubjects(selectedClass);
        }
    }, [selectedClass]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch("/api/school/subjects");
            const data = await response.json();
            if (response.ok) setSubjects(data.subjects || []);
        } catch (error) {
            console.error("Erreur chargement matières:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassSubjects = async (className: string) => {
        try {
            const response = await fetch(`/api/school/classes/${encodeURIComponent(className)}/subjects`);
            const data = await response.json();
            if (response.ok) setClassSubjects(data.subjects || []);
        } catch (error) {
            console.error("Erreur chargement matières classe:", error);
        }
    };

    const createSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingSubject(true);
        try {
            const response = await fetch("/api/school/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSubject)
            });

            if (response.ok) {
                toast.success("Matière créée");
                setNewSubject({ name: "", code: "" });
                fetchSubjects();
            } else {
                toast.error("Erreur création matière");
            }
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setCreatingSubject(false);
        }
    };

    const addSubjectToClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubjectToAdd) return;

        setAddingToClass(true);
        try {
            const response = await fetch(`/api/school/classes/${encodeURIComponent(selectedClass)}/subjects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_id: selectedSubjectToAdd,
                    coefficient: coefficient
                })
            });

            if (response.ok) {
                toast.success("Matière ajoutée à la classe");
                fetchClassSubjects(selectedClass);
                setSelectedSubjectToAdd("");
                setCoefficient(1);
            } else {
                toast.error("Erreur lors de l'ajout");
            }
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setAddingToClass(false);
        }
    };

    const removeSubjectFromClass = async (id: string) => {
        if (!confirm("Retirer cette matière de la classe ?")) return;
        try {
            const response = await fetch(`/api/school/classes/${encodeURIComponent(selectedClass)}/subjects?id=${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                toast.success("Matière retirée");
                fetchClassSubjects(selectedClass);
            } else {
                toast.error("Erreur lors du retrait");
            }
        } catch (error) {
            toast.error("Erreur serveur");
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
                    <h1 className="text-2xl font-bold text-gray-800">Matières & Coefficients</h1>
                    <p className="text-gray-500">Gérez le catalogue et la configuration par classe.</p>
                </div>
            </div>

            <Tabs defaultValue="config" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="config" className="gap-2"><Settings className="h-4 w-4" /> Configuration par Classe</TabsTrigger>
                    <TabsTrigger value="catalog" className="gap-2"><Book className="h-4 w-4" /> Catalogue Global</TabsTrigger>
                </TabsList>

                {/* Onglet Configuration par Classe */}
                <TabsContent value="config" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigner des matières</CardTitle>
                            <CardDescription>Définissez quelles matières sont enseignées en {selectedClass} et leur coefficient.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Sélecteur de Classe */}
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                                <Label className="whitespace-nowrap font-bold text-blue-900">Classe à configurer :</Label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="w-[180px] bg-white">
                                        <SelectValue placeholder="Choisir une classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BENIN_CLASSES.map(cls => (
                                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Formulaire d'ajout */}
                                <div className="space-y-4 border p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-700">Ajouter une matière</h3>
                                    <form onSubmit={addSubjectToClass} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Matière</Label>
                                            <Select value={selectedSubjectToAdd} onValueChange={setSelectedSubjectToAdd}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir dans le catalogue" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map(sub => (
                                                        <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500">Matière absente ? Créez-la dans l'onglet "Catalogue Global".</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Coefficient</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={coefficient}
                                                onChange={(e) => setCoefficient(parseInt(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={addingToClass || !selectedSubjectToAdd} className="w-full bg-blue-600">
                                            {addingToClass ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter à la classe"}
                                        </Button>
                                    </form>
                                </div>

                                {/* Liste des matières de la classe */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700">Matières en {selectedClass} ({classSubjects.length})</h3>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {classSubjects.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic">Aucune matière configurée pour cette classe.</p>
                                        ) : (
                                            classSubjects.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-xs text-gray-500">Code: {item.code || "N/A"}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                                                            Coeff {item.coefficient}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => removeSubjectFromClass(item.id)}
                                                        >
                                                            Retirer
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Onglet Catalogue Global */}
                <TabsContent value="catalog">
                    <Card>
                        <CardHeader>
                            <CardTitle>Catalogue des Matières</CardTitle>
                            <CardDescription>Définissez toutes les matières enseignées dans l'établissement.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            {/* Formulaire Création */}
                            <form onSubmit={createSubject} className="space-y-4 h-fit p-4 bg-gray-50 rounded-lg border">
                                <h3 className="font-semibold text-gray-800">Nouvelle Matière</h3>
                                <div className="space-y-2">
                                    <Label>Nom (ex: Mathématiques)</Label>
                                    <Input
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Code (ex: MATH)</Label>
                                    <Input
                                        value={newSubject.code}
                                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                                        placeholder="Optionnel"
                                    />
                                </div>
                                <Button type="submit" disabled={creatingSubject} className="w-full">
                                    {creatingSubject ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter au catalogue"}
                                </Button>
                            </form>

                            {/* Liste Catalogue */}
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                <h3 className="font-semibold text-gray-800 mb-4">Liste ({subjects.length})</h3>
                                {subjects.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                        <span className="font-medium">{sub.name}</span>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{sub.code || "-"}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
