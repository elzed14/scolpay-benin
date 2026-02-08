import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Get school_id for the current user
        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_id", session.user.id)
            .single();

        if (schoolError || !school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // Prepare students data
        const students = data.map((row) => ({
            school_id: school.id,
            matricule: row.Matricule?.toString(),
            first_name: row.Prénoms?.toString(),
            last_name: row.Nom?.toString(),
            class_name: row.Classe?.toString(),
        })).filter(s => s.matricule && s.last_name);

        if (students.length === 0) {
            return NextResponse.json({ error: "Aucune donnée valide trouvée dans le fichier" }, { status: 400 });
        }

        // Bulk insert students
        const { error: insertError } = await supabase
            .from("students")
            .insert(students);

        if (insertError) throw insertError;

        return NextResponse.json({
            success: true,
            count: students.length
        });

    } catch (error: unknown) {
        console.error("Import error:", error);
        const message = error instanceof Error ? error.message : "Erreur lors de l'importation";
        return NextResponse.json({
            error: message
        }, { status: 500 });
    }
}
