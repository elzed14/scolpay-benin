import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data: users, error } = await supabase.rpc("get_all_users_email");

        if (error) {
            return NextResponse.json({ success: false, error: error.message, hint: "SQL Script likely not run yet." });
        }

        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
