import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Étape 1 : Récupérer les annonces publiques
        const { data: announcements, error: annError } = await supabase
            .from("announcements")
            .select("id, title, content, created_at, school_id, attachment_url")
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(4);

        if (annError) {
            console.error("Erreur API Global News (announcements):", annError.message, annError);
            return NextResponse.json({ announcements: [] });
        }

        console.log(`[API News] Found ${announcements?.length || 0} public announcements`);

        if (!announcements || announcements.length === 0) {
            return NextResponse.json({ announcements: [] });
        }

        // Étape 2 : Récupérer les infos des écoles séparément (évite les problèmes de RLS sur les joins)
        const schoolIds = [...new Set(announcements.map(a => a.school_id))];
        const { data: schools, error: schoolError } = await supabase
            .from("schools")
            .select("id, name, slug, logo_url")
            .in("id", schoolIds);

        if (schoolError) {
            console.error("Erreur API Global News (schools):", schoolError.message);
        }

        console.log(`[API News] Fetched ${schools?.length || 0} related schools`);

        // Étape 3 : Assembler les données
        const result = announcements.map(ann => {
            const school = schools?.find(s => s.id === ann.school_id);
            return {
                ...ann,
                schools: school || { name: "École", slug: "", logo_url: null }
            };
        });

        return NextResponse.json({ announcements: result });

    } catch (error) {
        console.error("Fetch global news error:", error);
        return NextResponse.json({ announcements: [] });
    }
}
