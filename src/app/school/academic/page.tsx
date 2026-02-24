"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Calendar as CalendarIcon, BookOpen, GraduationCap, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link"; // Assurez-vous d'importer Link

export default function AcademicPage() {
    const [terms, setTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTerm, setNewTerm] = useState({ name: "", start_date: "", end_date: "" });
    const [creating, setCreating] = useState(false);

    const fetchTerms = async () => {
        try {
            const response = await fetch("/api/school/terms");
            const data = await response.json();
            if (response.ok) setTerms(data.terms || []);
        } catch (error) {
            console.error("Erreur chargement trimestres:", error);
        } finally {
            setLoading(false);
        }
    };

    const createTerm = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await fetch("/api/school/terms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTerm)
            });

            if (response.ok) {
                toast.success("Période créée avec succès");
                setNewTerm({ name: "", start_date: "", end_date: "" });
                fetchTerms();
            } else {
                toast.error("Erreur lors de la création");
            }
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/school">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion Académique</h1>
                    <p className="text-gray-500">Configurez votre année scolaire, matières et examens.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            Année Scolaire & Périodes
                        </CardTitle>
                        <CardDescription>Définissez les trimestres ou semestres.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Formulaire création rapide */}
                            <form onSubmit={createTerm} className="p-4 bg-gray-50 rounded-lg border flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2 w-full">
                                    <Label>Nom (ex: 1er Trimestre)</Label>
                                    <Input
                                        value={newTerm.name}
                                        onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })}
                                        placeholder="Nom de la période"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Début</Label>
                                    <Input
                                        type="date"
                                        value={newTerm.start_date}
                                        onChange={(e) => setNewTerm({ ...newTerm, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fin</Label>
                                    <Input
                                        type="date"
                                        value={newTerm.end_date}
                                        onChange={(e) => setNewTerm({ ...newTerm, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={creating} className="bg-blue-600 w-full md:w-auto">
                                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </form>

                            {/* Liste des périodes */}
                            <div className="space-y-2">
                                {loading ? (
                                    <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
                                ) : terms.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4 italic">Aucune période définie.</p>
                                ) : (
                                    terms.map((term) => (
                                        <div key={term.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="font-semibold text-gray-800">{term.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Du {format(new Date(term.start_date), "d MMM yyyy", { locale: fr })} au {format(new Date(term.end_date), "d MMM yyyy", { locale: fr })}
                                                </p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${term.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {term.is_active ? "En cours" : "Inactif"}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Carte Navigation Rapide */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions Rapides</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/school/academic/subjects">
                                <Button variant="outline" className="w-full justify-start gap-2 h-12 text-left">
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold">Gérer les Matières</span>
                                        <span className="text-[10px] text-gray-500 font-normal">Définir les coefficients par classe</span>
                                    </div>
                                </Button>
                            </Link>

                            <Link href="/school/academic/grades">
                                <Button variant="outline" className="w-full justify-start gap-2 h-12 text-left">
                                    <GraduationCap className="h-5 w-5 text-green-600" />
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold">Saisir des Notes</span>
                                        <span className="text-[10px] text-gray-500 font-normal">Saisie par classe et matière</span>
                                    </div>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
