import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer les données de l'école
        const { data: school, error } = await supabase
            .from("schools")
            .select(`
                id,
                name,
                slug,
                logo_url,
                banner_url,
                description,
                primary_color,
                secondary_color,
                address,
                phone,
                email,
                website,
                is_public_visible
            `)
            .eq("owner_id", user.id)
            .single();

        if (error || !school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        return NextResponse.json({ school });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();

        // Vérifier que l'école appartient à l'utilisateur
        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (schoolError || !school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // Vérifier si le slug est déjà utilisé par une autre école
        if (body.slug) {
            const { data: existingSlug } = await supabase
                .from("schools")
                .select("id")
                .eq("slug", body.slug)
                .neq("id", school.id)
                .single();

            if (existingSlug) {
                return NextResponse.json(
                    { error: "Cet identifiant URL est déjà utilisé par une autre école" },
                    { status: 400 }
                );
            }
        }

        // Mettre à jour les données
        const { error: updateError } = await supabase
            .from("schools")
            .update({
                slug: body.slug,
                description: body.description,
                primary_color: body.primary_color,
                secondary_color: body.secondary_color,
                logo_url: body.logo_url || null,
                banner_url: body.banner_url || null,
                website: body.website || null,
                is_public_visible: body.is_public_visible ?? false,
                updated_at: new Date().toISOString()
            })
            .eq("id", school.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}