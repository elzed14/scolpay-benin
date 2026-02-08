import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Student {
    first_name: string;
    last_name: string;
    matricule: string;
    class_name: string;
}

interface Transaction {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    payment_method: string;
    momo_reference: string | null;
    students: Student[] | null;
}

export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user's school_id
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
        }

        // Get school_id for the current user
        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("id, name")
            .eq("owner_id", user.id)
            .single();

        if (schoolError || !school) {
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // Fetch transactions with student info
        const { data: transactions, error: txError } = await supabase
            .from("transactions")
            .select(`
        id,
        amount,
        status,
        created_at,
        payment_method,
        momo_reference,
        students (
          first_name,
          last_name,
          matricule,
          class_name
        )
      `)
            .eq("school_id", school.id)
            .order("created_at", { ascending: false });

        if (txError) {
            console.error("Export error:", txError);
            return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
        }

        // Generate CSV content
        const headers = [
            "Date",
            "Nom de l'élève",
            "Prénom de l'élève",
            "Matricule",
            "Classe",
            "Montant (FCFA)",
            "Méthode de paiement",
            "Référence",
            "Statut"
        ];

        const rows = transactions?.map((tx: Transaction) => [
            format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", { locale: fr }),
            tx.students?.[0]?.first_name || "",
            tx.students?.[0]?.last_name || "",
            tx.students?.[0]?.matricule || "",
            tx.students?.[0]?.class_name || "",
            tx.amount.toString(),
            tx.payment_method || "",
            tx.momo_reference || "",
            tx.status === "completed" ? "Validé" : "En attente"
        ]) || [];

        // Create CSV content
        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
        ].join("\n");

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="transactions-${school.name}-${format(new Date(), "yyyy-MM-dd")}.csv"`,
            },
        });

    } catch (error: unknown) {
        console.error("Export error:", error);
        return NextResponse.json({
            error: "Erreur lors de l'export des transactions"
        }, { status: 500 });
    }
}
