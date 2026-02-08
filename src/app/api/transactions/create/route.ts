import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user for authentication
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("Current user:", user);

        if (userError || !user) {
            console.error("Authentication error:", userError);
            return NextResponse.json(
                { error: "Utilisateur non authentifié", details: userError?.message },
                { status: 401 }
            );
        }

        const { amount, status, momo_reference, student_id, school_id, payment_method } = await req.json();

        // Validate required fields
        if (!amount || !status || !school_id) {
            return NextResponse.json(
                { error: "Missing required fields: amount, status, and school_id are required" },
                { status: 400 }
            );
        }

        // Insert transaction into database
        console.log("Attempting to insert transaction:", {
            amount,
            status,
            momo_reference: momo_reference || null,
            student_id: student_id || null,
            school_id,
            payment_method: payment_method || "Mobile Money"
        });

        const { data, error } = await supabase
            .from("transactions")
            .insert([
                {
                    amount,
                    status,
                    momo_reference: momo_reference || null,
                    student_id: student_id || null,
                    school_id,
                    payment_method: payment_method || "Mobile Money"
                }
            ])
            .select();

        console.log("Supabase response:", { data, error });

        if (error) {
            console.error("Detailed error creating transaction:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return NextResponse.json(
                {
                    error: "Failed to create transaction",
                    details: error.message,
                    code: error.code,
                    hint: error.hint,
                    fullError: error
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Transaction created successfully",
                transaction: data[0]
            },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error("Unexpected error creating transaction:", error);
        return NextResponse.json(
            {
                error: "Unexpected error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}