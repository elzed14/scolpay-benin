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

        const { data: terms, error } = await supabase
            .from("terms")
            .select("*")
            .eq("school_id", school.id)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ terms });

    } catch {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        const { name, start_date, end_date } = body;

        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        const { data: term, error } = await supabase
            .from("terms")
            .insert({
                school_id: school.id,
                name,
                start_date,
                end_date,
                is_active: false // Par défaut inactif
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ term });

    } catch {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
