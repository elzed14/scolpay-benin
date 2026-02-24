import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Récupérer l'école de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        // 2. Récupérer les pré-inscriptions
        const { data: registrations, error } = await supabase
            .from("pre_registrations")
            .select("*")
            .eq("school_id", school.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ registrations });
    } catch (error) {
        console.error("Erreur API Get Pre-reg:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
