import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer l'email du parent connecté (via user.email)
        const parentEmail = user.email;

        // Trouver les écoles où le parent a des enfants inscrits
        // Etape 1 : Récupérer les IDs des écoles via la table students
        const { data: students, error: studentsError } = await supabase
            .from("students")
            .select("school_id")
            .eq("parent_email", parentEmail);

        if (studentsError) throw studentsError;

        if (!students || students.length === 0) {
            return NextResponse.json({ announcements: [] });
        }

        // Extraire les school_ids uniques
        const schoolIds = Array.from(new Set(students.map(s => s.school_id)));

        // Etape 2 : Récupérer les annonces de ces écoles
        const { data: announcements, error: announcementsError } = await supabase
            .from("announcements")
            .select("*")
            .in("school_id", schoolIds)
            .order("created_at", { ascending: false });

        if (announcementsError) throw announcementsError;

        return NextResponse.json({ announcements });

    } catch (error) {
        console.error("Erreur GET Parent Announcements:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
