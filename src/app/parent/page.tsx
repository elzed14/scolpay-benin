"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";

interface StudentResult {
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    school_name: string;
    school_momo: string;
    school_id: string;
}

export default function ParentPayPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<StudentResult | null>(null);
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [paymentReference, setPaymentReference] = useState("");
    const [paying, setPaying] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    const supabase = createClient();

    const findStudent = async () => {
        if (!searchTerm) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc("get_student_for_payment", { p_matricule: searchTerm })
                .maybeSingle();

            if (error || !data) throw new Error("Élève non trouvé. Vérifiez le matricule.");
            setStudent(data as any);
            setSelectedMethod(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de la recherche.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const confirmPayment = async () => {
        if (!amount || parseInt(amount) < 500) {
            toast.error("Montant invalide (Min: 500 FCFA)");
            return;
        }
        if (!paymentReference) {
            toast.error("Veuillez entrer la référence de la transaction (ID du SMS).");
            return;
        }
        if (!student || !selectedMethod) return;

        // Validation critique
        if (!student.school_id) {
            toast.error("Erreur de configuration : ID école manquant. Contactez l'admin.");
            console.error("Missing school_id in student object:", student);
            return;
        }

        setPaying(true);
        try {
            const { error: insertError } = await supabase.from("transactions").insert({
                student_id: student.id,
                school_id: student.school_id,
                amount: parseInt(amount),
                momo_reference: paymentReference,
                payment_method: selectedMethod,
                status: "pending",
            });

            if (insertError) throw insertError;

            setPaymentDone(true);
            toast.success("Paiement signalé à l'école !");
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(`Erreur: ${error.message || "Echec de l'enregistrement"}`);
        } finally {
            setPaying(false);
        }
    };

    if (paymentDone) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar role="parent" />
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center p-8 space-y-6">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold">Paiement Signalé !</h1>
                        <p className="text-gray-600">
                            L'école a été notifiée de votre paiement de <span className="font-bold">{amount} FCFA</span> (Ref: {paymentReference}).
                        </p>
                        <p className="text-sm text-gray-400 italic">
                            Dès validation par l'école, votre reçu sera disponible.
                        </p>
                        <Button className="w-full bg-blue-600" onClick={() => window.location.reload()}>Effectuer un autre paiement</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar role="parent" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="shadow-lg border-none">
                        <CardHeader>
                            <CardTitle>Régler les frais de scolarité</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!student ? (
                                <div className="space-y-4">
                                    <p className="text-gray-500 text-sm">Entrez le matricule de l'élève pour commencer.</p>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            className="pl-10"
                                            placeholder="ex: MAT-2024-001"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button className="w-full bg-blue-600" onClick={findStudent} disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trouver l'élève"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Student Info */}
                                    <div className="p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-blue-900">{student.first_name} {student.last_name}</p>
                                            <p className="text-xs text-blue-600 uppercase font-semibold">École: {student.school_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Classe</p>
                                            <p className="font-bold text-gray-900">{student.class_name}</p>
                                        </div>
                                    </div>

                                    {!selectedMethod ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Montant à verser (FCFA)</label>
                                                <Input
                                                    type="number"
                                                    placeholder="Min: 500 FCFA"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Button
                                                    variant="outline"
                                                    className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-yellow-400 transition-all"
                                                    onClick={() => setSelectedMethod("MTN MoMo")}
                                                >
                                                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-xs">MTN</div>
                                                    <span className="text-xs font-bold font-mono">MoMo Pay</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-auto py-6 flex flex-col gap-2 border-2 hover:border-green-600 transition-all"
                                                    onClick={() => setSelectedMethod("Moov Money")}
                                                >
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-xs text-white">Moov</div>
                                                    <span className="text-xs font-bold font-mono">Moov Money</span>
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                                                <p className="text-sm font-bold text-blue-900 mb-2">Instructions de Paiement ({selectedMethod})</p>
                                                <div className="text-sm space-y-2">
                                                    <p>1. Composez <span className="font-mono font-bold bg-white px-1 rounded">*880*3* {student.school_momo} * {amount} #</span></p>
                                                    <p>2. Validez le paiement de <span className="font-bold">{amount} FCFA</span>.</p>
                                                    <p>3. Attendez le SMS de confirmation.</p>
                                                </div>
                                                <div className="mt-4 flex justify-center bg-white p-2 rounded border">
                                                    <QRCodeSVG value={`https://scolpay.benin/pay/${student.school_momo}?amount=${amount}`} size={120} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-red-600">Preuve de paiement (Obligatoire)</label>
                                                <Input
                                                    placeholder="Entrez l'ID de transaction (ex: 18456239)"
                                                    value={paymentReference}
                                                    onChange={(e) => setPaymentReference(e.target.value)}
                                                    className="border-red-200 focus:border-red-500"
                                                />
                                                <p className="text-xs text-gray-500">C'est le numéro unique qui se trouve dans le SMS de confirmation.</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="ghost" onClick={() => setSelectedMethod(null)} className="flex-1">Retour</Button>
                                                <Button className="flex-[2] bg-green-600 hover:bg-green-700" onClick={confirmPayment} disabled={paying}>
                                                    {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : "J'ai effectué le paiement"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedMethod && (
                                        <Button variant="ghost" className="w-full text-gray-500 text-xs" onClick={() => setStudent(null)}>
                                            Annuler / Rechercher un autre élève
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
