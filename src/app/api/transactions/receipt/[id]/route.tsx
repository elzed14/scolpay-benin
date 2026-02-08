import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptPDF } from "@/components/payment/ReceiptPDF";
import React from "react";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const transactionId = id;

        // Fetch transaction data with related info
        const { data: transaction, error } = await supabase
            .from("transactions")
            .select(`
        *,
        students (
          first_name,
          last_name,
          matricule,
          schools (
            name
          )
        )
      `)
            .eq("id", transactionId)
            .single();

        if (error || !transaction) {
            return NextResponse.json({ error: "Transaction non trouvée" }, { status: 404 });
        }

        // Get payment method - prioritize payment_method, fallback to momo_reference
        const paymentMethod = transaction.payment_method ||
            (transaction.momo_reference ? "Mobile Money" : "Non spécifiée");

        // Render PDF to buffer
        const tx: any = transaction;
        const PDFDocument: any = ReceiptPDF;

        const pdfBuffer = await renderToBuffer(
            <PDFDocument
                transactionId={tx.id?.substring(0, 8).toUpperCase() || "---"}
                date={new Date(tx.created_at).toLocaleDateString("fr-FR")}
                studentName={`${tx.students?.first_name || ""} ${tx.students?.last_name || ""}`}
                matricule={tx.students?.matricule || ""}
                schoolName={tx.students?.schools?.name || "École Partenaire"}
                amount={tx.amount || 0}
                paymentMethod={paymentMethod}
            />
        );

        // Return PDF with proper headers
        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="recu-scolpay-${transactionId}.pdf"`,
            },
        });

    } catch (error: unknown) {
        console.error("PDF Generation error:", error);
        return NextResponse.json({
            error: "Erreur lors de la génération du reçu"
        }, { status: 500 });
    }
}
