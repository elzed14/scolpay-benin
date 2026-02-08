"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function RegisterSchoolPage() {
    const [schoolName, setSchoolName] = useState("");
    const [email, setEmail] = useState("");
    const [momoNumber, setMomoNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Erreur lors de la création du compte.");

            const userId = authData.user.id;

            // 2. Create Profile
            const { error: profileError } = await supabase.from("profiles").insert({
                id: userId,
                full_name: schoolName,
                role: "school",
            });

            if (profileError) throw profileError;

            // 3. Create School
            const { data: schoolData, error: schoolError } = await supabase.from("schools").insert({
                owner_id: userId,
                name: schoolName,
                momo_number: momoNumber,
            }).select().single();

            if (schoolError) throw schoolError;

            // 4. Create Initial Subscription (Essai Gratuit)
            const { data: trialPlan } = await supabase
                .from("subscription_plans")
                .select("id, duration_days")
                .eq("name", "Essai Gratuit")
                .single();

            if (trialPlan && schoolData) {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + trialPlan.duration_days);

                await supabase.from("school_subscriptions").insert({
                    school_id: schoolData.id,
                    plan_id: trialPlan.id,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    status: "active"
                });
            }

            toast.success("Inscription réussie ! Votre période d'essai de 15 jours a commencé.");
            router.push("/login");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de l'inscription";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-none shadow-xl">
                    <CardHeader className="space-y-1 flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                            <ArrowRight className="text-white h-7 w-7 rotate-[-45deg]" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Inscrire mon École</CardTitle>
                        <CardDescription>
                            Rejoignez le réseau ScolPay et simplifiez vos paiements.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Nom de l&apos;établissement</label>
                                <Input
                                    placeholder="ex: GS La Grace"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email administratif</label>
                                <Input
                                    type="email"
                                    placeholder="admin@ecole.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Numéro MoMo Pay (Marchand)</label>
                                <Input
                                    placeholder="ex: 65000000"
                                    value={momoNumber}
                                    onChange={(e) => setMomoNumber(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-gray-400 italic">* Requis pour recevoir les fonds directement.</p>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Mot de passe</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>Créer mon compte école <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </CardContent>
                    </form>
                    <CardFooter>
                        <div className="text-sm text-center w-full text-gray-500">
                            Déjà inscrit ?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                                Connectez-vous
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
