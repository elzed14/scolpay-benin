import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log: string[] = [];
    const metrics: any = {};

    try {
        log.push("1. Fetching Top Debtors...");
        const { data: topDebtors, error: debtError } = await supabase
            .from("students")
            .select("id, first_name, last_name, class_name, total_fee_due")
            .gt("total_fee_due", 0)
            .order("total_fee_due", { ascending: false })
            .limit(3);

        if (debtError) throw debtError;
        metrics.topDebtors = topDebtors;
        log.push(`   -> Found ${topDebtors?.length} debtors.`);

        log.push("2. Calculating Financial KPIs...");
        // Fetch total expected (debt)
        const { data: studentsData } = await supabase.from("students").select("total_fee_due");
        const totalRemainingDebt = studentsData?.reduce((acc, curr) => acc + (curr.total_fee_due || 0), 0) || 0;

        // Fetch collected
        const { data: collectedData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("status", "completed");
        const totalColl = collectedData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

        const totalPotential = totalColl + totalRemainingDebt;
        const recRate = totalPotential > 0 ? Math.round((totalColl / totalPotential) * 100) : 0;

        metrics.financials = {
            totalCollected: totalColl,
            totalRemainingDebt,
            totalPotential,
            recoveryRate: `${recRate}%`
        };
        log.push(`   -> Recovery Rate: ${recRate}% (Collected: ${totalColl} / Potential: ${totalPotential})`);

        return NextResponse.json({ success: true, metrics, log });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, log }, { status: 500 });
    }
}
