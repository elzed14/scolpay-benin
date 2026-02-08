import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Test basic connection
        const { data: testData, error: testError } = await supabase
            .from("schools")
            .select("id, name")
            .limit(1);

        if (testError) {
            console.error("Supabase connection error:", testError);
            return NextResponse.json({
                error: "Erreur de connexion Supabase",
                details: testError
            }, { status: 500 });
        }

        // Test getting current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        // Test transactions query
        let transactionsTest = null;
        let transactionsError = null;

        if (user) {
            // Get user's school
            const { data: school } = await supabase
                .from("schools")
                .select("id")
                .eq("owner_id", user.id)
                .single();

            if (school) {
                const { data, error } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("school_id", school.id)
                    .limit(5);

                transactionsTest = data;
                transactionsError = error;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Connexion Supabase réussie",
            testData,
            user: user ? { id: user.id, email: user.email } : null,
            transactions: transactionsTest,
            transactionsError: transactionsError ? transactionsError.message : null
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({
            error: "Erreur inattendue",
            details: error
        }, { status: 500 });
    }
}
