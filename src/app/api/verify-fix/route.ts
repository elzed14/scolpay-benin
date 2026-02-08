import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    // 1. Connectivity Check
    let internetCheck = "PENDING";
    let googleError = null;
    try {
        await fetch("https://www.google.com", { method: "HEAD", signal: AbortSignal.timeout(5000) });
        internetCheck = "OK";
    } catch (err: any) {
        internetCheck = `FAIL: ${err.message}`;
        googleError = err;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 2. Direct Supabase Connectivity Check
    let directSupabaseCheck = "PENDING";
    try {
        await fetch(supabaseUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
        directSupabaseCheck = "OK";
    } catch (err: any) {
        directSupabaseCheck = `FAIL: ${err.message}`;
    }

    // 3. Supabase Client Check
    let supabaseCheck = "PENDING";
    let rpcStatus = "SKIPPED";
    let rpcMessage = "";
    let schemaStatus = "SKIPPED";
    let schemaMessage = "";
    let studentData = null;
    let debugInfo: any = {};

    if (internetCheck === "OK" || googleError?.message?.includes("fetch failed") === false) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
            // Step 1: Test RPC with LOWERCASE to check sensitivity
            const matricule = "test-2024";  // Changed from TEST-2024
            const { data: student, error: rpcError } = await supabase
                .rpc("get_student_for_payment", { p_matricule: matricule })
                .single();

            supabaseCheck = "OK";

            if (rpcError) {
                rpcStatus = "FAIL";
                rpcMessage = `RPC Error: ${rpcError.message}`;

                // DEBUG PROBE
                if (rpcError.message.includes("relation")) {
                    const probes = ["classes", "class", "grade_levels", "grades"];
                    debugInfo.probes = {};

                    for (const table of probes) {
                        const { error } = await supabase.from(table).select("count").limit(1);
                        debugInfo.probes[table] = error ? error.message : "EXISTS";
                    }
                }

            } else if (!student) {
                rpcStatus = "WARN";
                rpcMessage = "Student not found";
            } else {
                studentData = student;
                if (!student.school_id) {
                    rpcStatus = "FAIL";
                    rpcMessage = "CRITICAL: school_id MISSING in RPC response.";
                } else {
                    rpcStatus = "PASS";
                    rpcMessage = `School ID found: ${student.school_id}`;
                }
            }

            // Step 2: Test Transaction Schema
            const { error: insertError } = await supabase
                .from("transactions")
                .insert({
                    school_id: "00000000-0000-0000-0000-000000000000",
                    student_id: "00000000-0000-0000-0000-000000000000",
                    amount: 100,
                    payment_method: "MTN",
                    status: "pending"
                });

            if (insertError) {
                const msg = insertError.message || "";
                if (msg.includes('column "school_id" does not exist')) {
                    schemaStatus = "FAIL";
                    schemaMessage = "CRITICAL: school_id column MISSING.";
                } else if (msg.includes('column "momo_reference" does not exist')) {
                    schemaStatus = "FAIL";
                    schemaMessage = "CRITICAL: momo_reference column MISSING.";
                } else {
                    if (msg.includes('violate') || msg.includes('constraint') || msg.includes('relation') || msg.includes('security')) {
                        schemaStatus = "PASS";
                        schemaMessage = `Column exists (Validated by error: ${msg})`;
                    } else {
                        schemaStatus = "WARN";
                        schemaMessage = `Unknown Insert Error: ${msg}`;
                    }
                }
            } else {
                schemaStatus = "PASS";
                schemaMessage = "Insert succeeded (unexpected but confirms column)";
            }

        } catch (supaErr: any) {
            supabaseCheck = `FAIL: ${supaErr.message}`;
        }
    }

    const result = {
        success: (rpcStatus === "PASS" || rpcStatus === "WARN") && (schemaStatus === "PASS"),
        connectivity: {
            internet: internetCheck,
            directSupabase: directSupabaseCheck,
            googleError: googleError ? googleError.message : null,
            supabaseKeyPresent: !!supabaseKey
        },
        supabaseCheck,
        rpcStatus,
        rpcMessage,
        schemaStatus,
        schemaMessage,
        studentData,
        debugInfo
    };

    console.log("VERIFICATION_RESULT:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
}
