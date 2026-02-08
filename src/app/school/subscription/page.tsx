"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
    const { status, subscription } = useSubscription();
    const [requesting, setRequesting] = useState(false);
    const [studentCount, setStudentCount] = useState<number>(0);
    const [recommendedPlan, setRecommendedPlan] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Get School ID
                const { data: school } = await supabase.from("schools").select("id").eq("owner_id", user.id).maybeSingle();
                if (!school) return;

                // 2. Get Student Count
                const { count } = await supabase
                    .from("students")
                    .select("*", { count: "exact", head: true })
                    .eq("school_id", school.id);

                const currentCount = count || 0;
                setStudentCount(currentCount);

                // 3. Determine Tier Name
                let tierNamePart = "Tier 1";
                if (currentCount > 600) tierNamePart = "Tier 4";
                else if (currentCount > 300) tierNamePart = "Tier 3";
                else if (currentCount > 150) tierNamePart = "Tier 2";

                // 4. Fetch Plan Details
                const { data: plan } = await supabase
                    .from("subscription_plans")
                    .select("*")
                    .ilike("name", `${tierNamePart}%`)
                    .limit(1)
                    .maybeSingle();

                setRecommendedPlan(plan);
            } catch (error) {
                console.error("Error fetching subscription data:", error);
                toast.error("Erreur de chargement des données.");
            }
        };
        fetchData();
    }, []);

    const handleRequestRenewal = async () => {
        if (!recommendedPlan) return;
        setRequesting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: school } = await supabase.from("schools").select("id").eq("owner_id", user?.id).single();

            const { error } = await supabase.from("subscription_requests").insert({
                school_id: school?.id,
                plan_id: recommendedPlan.id,
            });

            if (error) throw error;
            toast.success("Demande de renouvellement envoyée !");
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la demande.");
        } finally {
            setRequesting(false);
        }
    };

    if (status === "loading") {
        return (
            <DashboardLayout role="school">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    const expiryDate = subscription ? new Date(subscription.end_date).toLocaleDateString("fr-FR") : "N/A";

    return (
        <DashboardLayout role="school">
            <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">Mon Abonnement</h1>
                    <p className="text-gray-500">Gérez votre licence ScolPay et vos accès.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Status Card */}
                    <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium opacity-90">Plan Actuel</CardTitle>
                            <div className="text-4xl font-bold mt-2 font-outfit">
                                {subscription?.plan?.name || "Essai Gratuit"}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 opacity-70" />
                                <span>Expire le : <strong>{expiryDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    status === "active" ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
                                )}>
                                    {status === "active" ? "Actif" : "Expiré"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Renewal Card */}
                    <Card className="border-gray-100 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Renouvellement (Tarif Dynamique)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <p className="text-gray-600">Nombre d'élèves inscrits :</p>
                                <p className="text-2xl font-bold text-gray-900">{studentCount}</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-blue-800 font-medium mb-1">Plan Recommandé :</p>
                                <p className="text-xl font-bold text-blue-900">
                                    {recommendedPlan?.name || "Calcul en cours..."}
                                </p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    {recommendedPlan?.price_fcfa?.toLocaleString()} FCFA <span className="text-sm font-normal text-gray-500">/ mois</span>
                                </p>
                            </div>

                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                                onClick={handleRequestRenewal}
                                disabled={requesting || !recommendedPlan}
                            >
                                {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                                Payer et Renouveler
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-white p-6 rounded-xl border border-dashed border-gray-200">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-700">
                        <CheckCircle2 className="h-5 w-5 text-green-500" /> Détails du Règlement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="font-bold block text-gray-900 mb-1">Mobile Money</span>
                            Envoyez le montant au <span className="font-mono bg-white px-1 py-0.5 rounded border">65 00 00 00</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="font-bold block text-gray-900 mb-1">Instruction</span>
                            Cliquez sur &quot;Payer et Renouveler&quot; APRÈS avoir envoyé les fonds.
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
