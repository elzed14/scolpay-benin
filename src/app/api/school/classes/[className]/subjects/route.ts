import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { className: string } }
) {
    try {
        const className = decodeURIComponent(params.className);
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        // Récupérer les matières assignées à cette classe
        const { data: classSubjects, error } = await supabase
            .from("class_subjects")
            .select(`
                id,
                coefficient,
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .eq("school_id", school.id)
            .eq("class_name", className);

        if (error) throw error;

        // Formater la réponse
        const formatted = classSubjects.map((item: any) => ({
            id: item.id,
            coefficient: item.coefficient,
            subject_id: item.subjects.id,
            name: item.subjects.name,
            code: item.subjects.code
        }));

        return NextResponse.json({ subjects: formatted });

    } catch (error) {
        console.error("Erreur GET Class Subjects:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { className: string } }
) {
    try {
        const className = decodeURIComponent(params.className);
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        const { subject_id, coefficient } = body;

        const { data: school } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });

        // Vérifier si la matière existe déjà pour cette classe
        const { data: existing } = await supabase
            .from("class_subjects")
            .select("id")
            .eq("school_id", school.id)
            .eq("class_name", className)
            .eq("subject_id", subject_id)
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from("class_subjects")
                .update({ coefficient })
                .eq("id", existing.id);

            if (error) throw error;
            return NextResponse.json({ success: true, action: "updated" });
        } else {
            // Insert
            const { error } = await supabase
                .from("class_subjects")
                .insert({
                    school_id: school.id,
                    class_name: className,
                    subject_id,
                    coefficient
                });

            if (error) throw error;
            return NextResponse.json({ success: true, action: "created" });
        }

    } catch (error) {
        console.error("Erreur POST Class Subject:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { className: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        // On récupère l'ID depuis l'URL (query param) ou body. Ici simplifions avec query param ?id=...
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

        const { error } = await supabase
            .from("class_subjects")
            .delete()
            .eq("id", id); // RLS empêchera de supprimer ceux des autres écoles

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
