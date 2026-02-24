import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const supabase = await createClient();
        const body = await request.json();

        // Vérification proprio (via RLS ou manu)
        const { error } = await supabase
            .from("pre_registrations")
            .update({ status: body.status, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur API Update Pre-reg:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
