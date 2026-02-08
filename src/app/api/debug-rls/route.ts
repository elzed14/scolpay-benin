import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Run SQL to check policies
        const { data, error } = await supabase
            .from("pg_policies")
            .select("*")
            .eq("tablename", "transactions");

        // Also check if we can see any pending transactions as anon (should be empty usually)
        const { data: txData } = await supabase.from("transactions").select("id, status, school_id").limit(5);

        return NextResponse.json({ success: true, policies: data, visible_tx: txData, error });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
