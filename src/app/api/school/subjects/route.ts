import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        const { data: subjects, error } = await supabase
            .from("subjects")
            .select("*")
            .eq("school_id", school.id)
            .order("name", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ subjects });

    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        const { name, code } = body;

        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        const { data: subject, error } = await supabase
            .from("subjects")
            .insert({
                school_id: school.id,
                name,
                code
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ subject });

    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
