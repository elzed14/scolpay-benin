import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer l'ID de l'école de l'utilisateur connecté
        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // Récupérer les annonces
        const { data: announcements, error } = await supabase
            .from("announcements")
            .select("*")
            .eq("school_id", school.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ announcements });

    } catch (error) {
        console.error("Erreur GET Announcements:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, attachment_url } = body;

        // Validation baisque
        if (!title || !content) {
            return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
        }

        // Récupérer l'école
        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // Créer l'annonce
        const { data: announcement, error } = await supabase
            .from("announcements")
            .insert({
                school_id: school.id,
                title,
                content,
                attachment_url
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ announcement });

    } catch (error) {
        console.error("Erreur POST Announcement:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
