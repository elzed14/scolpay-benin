import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        const { school_id, subject_id, term_id, grades } = body;
        // grades array: [{ student_id, value, type, weight, comment }]

        // Sécurité : Vérifier school_id
        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school || school.id !== school_id) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        if (!grades || grades.length === 0) return NextResponse.json({ success: true, count: 0 });

        // Préparer les données pour upsert (INSERT ... ON CONFLICT UPDATE)
        // Note: Supabase upsert nécessite une contrainte unique si on veut update.
        // Ici, on a pas mis de contrainte unique (student, subject, term, type) car on peut avoir plusieurs notes du même type.
        // Donc ce endpoint sera pour l'AJOUT de nouvelles notes pour l'instant, ou modification par ID si fourni.

        // Approche simplifiée v1 : On ne gère que l'AJOUT de notes (Ex: Devoir 1). 
        // Pour modifier, il faudrait une UI plus complexe.
        // Mais pour une saisie rapide "Tableau", on veut souvent saisir "Devoir 1" pour toute la classe.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gradesToInsert = grades.map((g: any) => ({
            school_id,
            student_id: g.student_id,
            subject_id,
            term_id,
            value: g.value,
            type: g.type || "DEVOIR",
            weight: g.weight || 1,
            comment: g.comment
        }));

        const { error } = await supabase
            .from("grades")
            .insert(gradesToInsert);

        if (error) throw error;

        return NextResponse.json({ success: true, count: grades.length });

    } catch (error) {
        console.error("Erreur POST Grades:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
