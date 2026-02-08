"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, PlusCircle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const supabase = createClient();

    const log = (msg: string) => setLogs(prev => [...prev, msg]);

    const runTest = async () => {
        setLogs([]);
        log("Starting test...");

        // 1. Test Auth Signup
        const email = `debug_${Date.now()}@test.com`;
        const password = "password123";
        log(`1. Attempting Signup with ${email}...`);

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            log(`❌ Signup Error: ${authError.message} (Code: ${authError.status})`);
            return;
        }

        if (!authData.user) {
            log("❌ No user returned (Email confirmation required?)");
            return;
        }

        log(`✅ Signup Valid. User ID: ${authData.user.id}`);

        // 2. Test Profile Insert
        log("2. Attempting Profile Insert...");
        const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            full_name: "Debug User",
            role: "school"
        });

        if (profileError) {
            log(`❌ Profile Insert Error: ${profileError.message} (${profileError.code})`);
            log(`Hint: RLS on 'profiles' might be blocking INSERT.`);
            return;
        }
        log("✅ Profile Insert Success");

        // 3. Test School Insert
        log("3. Attempting School Insert...");
        const { error: schoolError } = await supabase.from("schools").insert({
            owner_id: authData.user.id,
            name: "Debug School",
            momo_number: "123456"
        });

        if (schoolError) {
            log(`❌ School Insert Error: ${schoolError.message} (${schoolError.code})`);
            return;
        }
        log("✅ School Insert Success");
        log("🎉 ALL TESTS PASSED!");
    };

    // Transaction Add Form
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("pending");
    const [momoReference, setMomoReference] = useState("");
    const [studentId, setStudentId] = useState("");
    const [schoolId, setSchoolId] = useState("10fe5cda-7eb1-4dd0-b6a0-c9c5a73f4946");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/transactions/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    status,
                    momo_reference: momoReference || undefined,
                    student_id: studentId || undefined,
                    school_id: schoolId,
                    payment_method: "Mobile Money"
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create transaction");
            }

            toast.success("Transaction créée avec succès !", {
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            });

            // Reset form
            setAmount("");
            setMomoReference("");
            setStudentId("");

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(`Erreur: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <h1 className="text-2xl font-bold">Outil de Debug & Test</h1>

            <Tabs defaultValue="transactions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="transactions">Ajouter Transaction</TabsTrigger>
                    <TabsTrigger value="diagnostic">Diagnostic Supabase</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <PlusCircle className="h-5 w-5 text-blue-600" />
                                Créer une transaction de test
                            </h2>
                            <p className="text-sm text-blue-700 mb-4">
                                Utilisez ce formulaire pour créer des transactions de test et vérifier que le système fonctionne correctement.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Montant (FCFA) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Ex: 5000"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Statut</Label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="pending">En attente</option>
                                        <option value="completed">Validé</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="momoReference">Référence Mobile Money</Label>
                                <Input
                                    id="momoReference"
                                    value={momoReference}
                                    onChange={(e) => setMomoReference(e.target.value)}
                                    placeholder="Ex: 237678901234"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="studentId">ID Étudiant (optionnel)</Label>
                                <Input
                                    id="studentId"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="Ex: ETU001"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schoolId">School ID</Label>
                                <Input
                                    id="schoolId"
                                    value={schoolId}
                                    onChange={(e) => setSchoolId(e.target.value)}
                                    className="bg-gray-100"
                                    disabled
                                />
                                <p className="text-xs text-gray-500">
                                    Votre School ID actuel. Modifiable dans le code si nécessaire.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Créer la transaction
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 mb-2">Instructions :</h3>
                            <ol className="text-sm text-green-700 space-y-1">
                                <li>1. Remplissez les champs (le montant est obligatoire)</li>
                                <li>2. Cliquez sur "Créer la transaction"</li>
                                <li>3. Allez sur la page "Transactions" de votre école</li>
                                <li>4. Rafraîchissez la page - votre transaction devrait apparaître !</li>
                            </ol>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="diagnostic">
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Diagnostic Supabase</h2>
                            <p className="text-sm text-yellow-700">
                                Testez les opérations de base de Supabase pour vérifier que tout fonctionne correctement.
                            </p>
                        </div>

                        <Button onClick={runTest} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                            Exécuter le diagnostic
                        </Button>

                        <div className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap border max-h-96 overflow-auto">
                            {logs.length === 0 ? (
                                <p className="text-gray-500">Les logs apparaîtront ici...</p>
                            ) : (
                                logs.map((l, i) => <div key={i}>{l}</div>)
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}