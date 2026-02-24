import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            schoolId,
            firstName,
            lastName,
            parentPhone,
            parentEmail,
            className
        } = body;

        // On insère dans une nouvelle table 'pre_registrations'
        // Pour l'instant, on peut aussi créer l'élève directement avec un flag 'is_pending' 
        // ou simplement enregistrer l'intérêt. 
        // Créons une table simple pour ça.

        const { error } = await supabase
            .from("pre_registrations")
            .insert({
                school_id: schoolId,
                first_name: firstName,
                last_name: lastName,
                parent_phone: parentPhone,
                parent_email: parentEmail,
                class_name: className,
                status: 'pending'
            });

        if (error) {
            console.error("Erreur insertion pre_reg:", error);
            // Si la table n'existe pas encore, on peut fallback sur un log ou notifier admin
            return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur API Registration:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
