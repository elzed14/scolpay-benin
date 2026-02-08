import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Get the test student
        const { data: student } = await supabase
            .from("students")
            .select("id, school_id")
            .eq("matricule", "TEST-2024")
            .single();

        if (!student) throw new Error("Student TEST-2024 not found");

        // 2. Insert a COMPLETED transaction
        const { error } = await supabase.from("transactions").insert({
            student_id: student.id,
            school_id: student.school_id,
            amount: 2500, // Partial payment
            status: "completed",
            payment_method: "MTN",
            momo_reference: "TEST-AUTO-REF",
            payment_reference: "REF-" + Date.now()
        });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Transaction simulated: 2500 FCFA" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
