import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { whatsappService, ReminderData } from "@/lib/whatsapp/service";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Vérifier l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { type, data } = body;

        switch (type) {
            case "single":
                return await sendSingleReminder(supabase, user.id, data);
            case "bulk":
                return await sendBulkReminders(supabase, user.id, data);
            case "confirmation":
                return await sendConfirmation(supabase, user.id, data);
            default:
                return NextResponse.json({ error: "Type non supporté" }, { status: 400 });
        }
    } catch (error) {
        console.error("Erreur WhatsApp API:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

/**
 * Envoyer un rappel unique
 */
async function sendSingleReminder(
    supabase: any,
    userId: string,
    data: { studentId: string; parentId?: string }
) {
    // Vérifier que l'utilisateur a accès à cette école
    const { data: school } = await supabase
        .from("schools")
        .select("id, name")
        .eq("owner_id", userId)
        .single();

    if (!school) {
        return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    }

    // Récupérer les informations de l'élève
    const { data: student } = await supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            class_name,
            total_fee_due,
            parent_phone,
            parent_name
        `)
        .eq("id", data.studentId)
        .eq("school_id", school.id)
        .single();

    if (!student) {
        return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    if (!student.parent_phone) {
        return NextResponse.json(
            { error: "Numéro de téléphone du parent non renseigné" },
            { status: 400 }
        );
    }

    // Envoyer le rappel
    const reminderData: ReminderData = {
        parentPhone: student.parent_phone,
        parentName: student.parent_name || "Parent",
        studentName: `${student.first_name} ${student.last_name}`,
        className: student.class_name,
        amountDue: student.total_fee_due,
        schoolName: school.name,
        paymentLink: `${process.env.NEXT_PUBLIC_URL}/public/school/${school.id}`,
    };

    const result = await whatsappService.sendPaymentReminder(reminderData);

    // Enregistrer le log
    await supabase.from("whatsapp_logs").insert({
        school_id: school.id,
        student_id: student.id,
        phone_number: student.parent_phone,
        message_type: "reminder",
        status: result.success ? "sent" : "failed",
        error_message: result.error,
        message_id: result.messageId,
    });

    return NextResponse.json(result);
}

/**
 * Envoyer des rappels en masse
 */
async function sendBulkReminders(
    supabase: any,
    userId: string,
    data: { studentIds?: string[]; filter?: "all_debtors" | "high_debtors" }
) {
    // Vérifier que l'utilisateur a accès à cette école
    const { data: school } = await supabase
        .from("schools")
        .select("id, name")
        .eq("owner_id", userId)
        .single();

    if (!school) {
        return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    }

    // Construire la requête
    let query = supabase
        .from("students")
        .select(`
            id,
            first_name,
            last_name,
            class_name,
            total_fee_due,
            parent_phone,
            parent_name
        `)
        .eq("school_id", school.id)
        .gt("total_fee_due", 0)
        .not("parent_phone", "is", null);

    if (data.studentIds && data.studentIds.length > 0) {
        query = query.in("id", data.studentIds);
    } else if (data.filter === "high_debtors") {
        query = query.gte("total_fee_due", 50000); // Plus de 50 000 FCFA
    }

    const { data: students } = await query;

    if (!students || students.length === 0) {
        return NextResponse.json(
            { error: "Aucun élève éligible pour un rappel" },
            { status: 400 }
        );
    }

    // Préparer les rappels
    const reminders: ReminderData[] = students.map((student: any) => ({
        parentPhone: student.parent_phone,
        parentName: student.parent_name || "Parent",
        studentName: `${student.first_name} ${student.last_name}`,
        className: student.class_name,
        amountDue: student.total_fee_due,
        schoolName: school.name,
        paymentLink: `${process.env.NEXT_PUBLIC_URL}/public/school/${school.id}`,
    }));

    // Envoyer les rappels
    const results = await whatsappService.sendBulkReminders(reminders);

    // Enregistrer les logs
    const logs = students.map((student: any, index: number) => ({
        school_id: school.id,
        student_id: student.id,
        phone_number: student.parent_phone,
        message_type: "bulk_reminder",
        status: index < results.success ? "sent" : "failed",
    }));

    await supabase.from("whatsapp_logs").insert(logs);

    return NextResponse.json({
        total: students.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
    });
}

/**
 * Envoyer une confirmation de paiement
 */
async function sendConfirmation(
    supabase: any,
    userId: string,
    data: { transactionId: string }
) {
    // Vérifier que l'utilisateur a accès à cette école
    const { data: school } = await supabase
        .from("schools")
        .select("id, name")
        .eq("owner_id", userId)
        .single();

    if (!school) {
        return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    }

    // Récupérer la transaction
    const { data: transaction } = await supabase
        .from("transactions")
        .select(`
            id,
            amount,
            students (
                first_name,
                last_name,
                parent_phone,
                parent_name
            )
        `)
        .eq("id", data.transactionId)
        .eq("school_id", school.id)
        .single();

    if (!transaction) {
        return NextResponse.json({ error: "Transaction non trouvée" }, { status: 404 });
    }

    const student = transaction.students as any;
    if (!student?.parent_phone) {
        return NextResponse.json(
            { error: "Numéro de téléphone du parent non renseigné" },
            { status: 400 }
        );
    }

    // Envoyer la confirmation
    const result = await whatsappService.sendPaymentConfirmation({
        parentPhone: student.parent_phone,
        parentName: student.parent_name || "Parent",
        studentName: `${student.first_name} ${student.last_name}`,
        amount: transaction.amount,
        transactionId: transaction.id.substring(0, 8).toUpperCase(),
        schoolName: school.name,
    });

    // Enregistrer le log
    await supabase.from("whatsapp_logs").insert({
        school_id: school.id,
        student_id: student.id,
        phone_number: student.parent_phone,
        message_type: "confirmation",
        status: result.success ? "sent" : "failed",
        error_message: result.error,
        message_id: result.messageId,
    });

    return NextResponse.json(result);
}