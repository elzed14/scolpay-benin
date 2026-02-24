import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createClient();

        // 1. Trouver l'école par son slug
        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("id")
            .eq("slug", slug)
            .single();

        if (schoolError || !school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // 2. Récupérer les annonces PUBLIQUES de cette école
        const { data: announcements, error: announcementsError } = await supabase
            .from("announcements")
            .select("*")
            .eq("school_id", school.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false });

        if (announcementsError) throw announcementsError;

        return NextResponse.json({ announcements });

    } catch (error) {
        console.error("Erreur API Public Announcements:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
