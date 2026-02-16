"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle,
    Building2,
    Mail,
    Phone,
    Lock,
    Gift,
    Users,
    TrendingUp,
    Shield
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterSchoolPage() {
    const [schoolName, setSchoolName] = useState("");
    const [email, setEmail] = useState("");
    const [momoNumber, setMomoNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const supabase = createClient();
    const router = useRouter();

    // Password strength indicator
    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ["Faible", "Moyen", "Bon", "Fort"];
    const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

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
        <div className="min-h-screen flex">
            {/* Côté gauche - Formulaire */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">ScolPay</span>
                    </div>

                    {/* En-tête */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Inscrivez votre école
                        </h1>
                        <p className="text-gray-500">
                            Rejoignez plus de 500 écoles au Bénin
                        </p>
                    </div>

                    {/* Bannière essai gratuit */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <Gift className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold">15 jours d'essai gratuit</p>
                                <p className="text-sm text-green-100">Aucune carte bancaire requise</p>
                            </div>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl bg-white">
                        <form onSubmit={handleRegister}>
                            <CardContent className="space-y-4 pt-6">
                                {/* Nom de l'école */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        Nom de l'établissement
                                    </label>
                                    <Input
                                        placeholder="ex: GS La Grace"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        required
                                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        Email administratif
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="admin@ecole.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Numéro MoMo */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        Numéro Mobile Money
                                    </label>
                                    <Input
                                        placeholder="ex: 65000000"
                                        value={momoNumber}
                                        onChange={(e) => setMomoNumber(e.target.value)}
                                        required
                                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        Pour recevoir les paiements directement
                                    </p>
                                </div>

                                {/* Mot de passe */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {/* Indicateur de force */}
                                    {password && (
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Force : {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "Très faible"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            Créer mon compte
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </form>
                        <CardFooter className="flex flex-col gap-4 pt-0">
                            <div className="text-center text-sm text-gray-600">
                                Déjà inscrit ?{" "}
                                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                    Connectez-vous
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-400 mt-6">
                        En continuant, vous acceptez nos{" "}
                        <Link href="/terms" className="hover:text-gray-600 underline">
                            Conditions d'utilisation
                        </Link>.
                    </div>
                </div>
            </div>

            {/* Côté droit - Avantages */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
                {/* Éléments décoratifs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                {/* Contenu */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="h-7 w-7 text-indigo-600" />
                        </div>
                        <span className="text-2xl font-bold text-white">ScolPay</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Pourquoi choisir ScolPay ?
                        </h2>
                        <p className="text-purple-100 text-lg">
                            La solution complète pour gérer les frais scolaires de votre établissement.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">+40% de recouvrement</h3>
                                <p className="text-purple-100 text-sm">En moyenne chez nos écoles partenaires</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Suivi en temps réel</h3>
                                <p className="text-purple-100 text-sm">Tableau de bord complet et notifications</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Installation en 5 minutes</h3>
                                <p className="text-purple-100 text-sm">Aucune formation requise</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Témoignage */}
                <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-white italic mb-4">
                        "Depuis que nous utilisons ScolPay, le recouvrement de nos frais a augmenté de 50%. Les parents adorent la simplicité."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">MA</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold">Marie Adjovi</p>
                            <p className="text-purple-200 text-sm">Directrice, GS L'Espoir</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
