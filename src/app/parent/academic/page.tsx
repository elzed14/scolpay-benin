"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Grade {
    id: string;
    value: number;
    type: string;
    weight: number;
    subjects: { name: string; code: string };
    terms: { name: string };
    created_at: string;
}

interface StudentResult {
    student: {
        id: string;
        first_name: string;
        last_name: string;
        class_name: string;
    };
    grades: Grade[];
}

export default function ParentAcademicPage() {
    const [results, setResults] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await fetch("/api/parent/grades");
                const data = await response.json();
                if (response.ok) {
                    setResults(data.results || []);
                }
            } catch (error) {
                console.error("Erreur chargement notes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    // Fonction utilitaire pour grouper par Trimestre > Matière
    const groupGrades = (grades: Grade[]) => {
        const grouped: Record<string, Record<string, Grade[]>> = {};

        grades.forEach(grade => {
            const termName = grade.terms?.name || "Hors Période";
            const subjectName = grade.subjects?.name || "Autre";

            if (!grouped[termName]) grouped[termName] = {};
            if (!grouped[termName][subjectName]) grouped[termName][subjectName] = [];

            grouped[termName][subjectName].push(grade);
        });

        return grouped;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <Card className="text-center py-12">
                <CardContent>
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun résultat scolaire</h3>
                    <p className="text-gray-500 mt-1">Les notes de vos enfants apparaîtront ici.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Résultats Scolaires</h1>
                <p className="text-gray-500">Suivi des notes et bulletins de vos enfants.</p>
            </div>

            {results.map((result) => {
                const grouped = groupGrades(result.grades);

                return (
                    <Card key={result.student.id} className="overflow-hidden border-t-4 border-t-blue-600">
                        <CardHeader className="bg-gray-50/50 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl">
                                            {result.student.first_name} {result.student.last_name}
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-white">
                                            {result.student.class_name}
                                        </Badge>
                                    </div>
                                    <CardDescription className="mt-1">
                                        Matricule: {result.student.id.substring(0, 8).toUpperCase()}
                                    </CardDescription>
                                </div>
                                <GraduationCap className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {Object.keys(grouped).length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Aucune note enregistrée pour le moment.</p>
                            ) : (
                                <div className="space-y-8">
                                    {Object.entries(grouped).map(([term, subjects]) => (
                                        <div key={term} className="space-y-4">
                                            <h3 className="flex items-center gap-2 font-semibold text-lg text-blue-900 border-b pb-2">
                                                <Calendar className="h-4 w-4" />
                                                {term}
                                            </h3>

                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {Object.entries(subjects).map(([subject, grades]) => (
                                                    <div key={subject} className="bg-white border rounded-lg p-3 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <BookOpen className="h-4 w-4 text-purple-500" />
                                                            <span className="font-medium text-gray-800 line-clamp-1">{subject}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {grades.map(grade => (
                                                                <div key={grade.id} className="relative group">
                                                                    <span className={`
                                                                        px-2 py-1 rounded text-sm font-mono font-bold border
                                                                        ${grade.value < 10 ? 'bg-red-50 text-red-700 border-red-100' :
                                                                            grade.value >= 16 ? 'bg-green-50 text-green-700 border-green-100' :
                                                                                'bg-gray-50 text-gray-700 border-gray-100'}
                                                                    `}>
                                                                        {grade.value}
                                                                    </span>
                                                                    {/* Tooltip simple */}
                                                                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                                                                        {grade.type} {grade.weight > 1 ? `(Coeff ${grade.weight})` : ''}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
