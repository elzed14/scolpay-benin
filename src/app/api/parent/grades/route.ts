import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.user_metadata.role !== 'parent') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const parentEmail = user.email;

        // 1. Récupérer les élèves du parent (pour avoir school_id et student_id)
        const { data: students, error: studError } = await supabase
            .from("students")
            .select("id, first_name, last_name, school_id, class_name")
            .eq("parent_email", parentEmail);

        if (studError) throw studError;
        if (!students || students.length === 0) return NextResponse.json({ results: [] });

        const results = [];

        // Pour chaque enfant, récupérer ses notes
        for (const student of students) {
            // Récupérer les notes structurées
            const { data: grades, error: gradesError } = await supabase
                .from("grades")
                .select(`
                    id,
                    value,
                    type,
                    weight,
                    subjects (name, code),
                    terms (name, id)
                `)
                .eq("student_id", student.id)
                .order("created_at", { ascending: false });

            if (gradesError) console.error("Erreur notes élève " + student.id, gradesError);

            // Calculer des moyennes simples (Optionnel, peut être fait côté front)
            // On renvoie les notes brutes pour l'affichage
            results.push({
                student,
                grades: grades || []
            });
        }

        return NextResponse.json({ results });

    } catch (error) {
        console.error("Erreur API Parent Grades:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
