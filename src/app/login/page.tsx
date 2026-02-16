"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    GraduationCap,
    Loader2,
    Eye,
    EyeOff,
    Shield,
    Clock,
    Smartphone,
    CheckCircle,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Connexion réussie !");
            router.push("/school");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur de connexion";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Côté gauche - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Éléments décoratifs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                {/* Logo et nom */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <GraduationCap className="h-7 w-7 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-white">ScolPay</span>
                    </div>
                </div>

                {/* Contenu central */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Gérez vos frais scolaires en toute simplicité
                        </h1>
                        <p className="text-blue-100 text-lg">
                            La solution de paiement scolaire n°1 au Bénin. Simple, sécurisé et accessible à tous.
                        </p>
                    </div>

                    {/* Avantages */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Paiements sécurisés</h3>
                                <p className="text-blue-100 text-sm">Vos transactions sont 100% protégées</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Disponible 24h/24</h3>
                                <p className="text-blue-100 text-sm">Payez à tout moment, où que vous soyez</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Mobile Money</h3>
                                <p className="text-blue-100 text-sm">MTN, Moov, Wave acceptés</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="relative z-10 flex gap-8">
                    <div>
                        <div className="text-3xl font-bold text-white">500+</div>
                        <div className="text-blue-200 text-sm">Écoles partenaires</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">50K+</div>
                        <div className="text-blue-200 text-sm">Transactions/mois</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">99.9%</div>
                        <div className="text-blue-200 text-sm">Disponibilité</div>
                    </div>
                </div>
            </div>

            {/* Côté droit - Formulaire */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">ScolPay</span>
                    </div>

                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold text-gray-800">
                                Bonne retour !
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Connectez-vous à votre compte
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="email">
                                        Adresse email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nom@exemple.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700" htmlFor="password">
                                            Mot de passe
                                        </label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
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
                                </div>
                                <Button
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Connexion en cours...
                                        </>
                                    ) : (
                                        <>
                                            Se connecter
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </form>
                        <CardFooter className="flex flex-col gap-4 pt-0">
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">ou</span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Vous n'avez pas de compte ?{" "}
                                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                    Créer un compte
                                </Link>
                            </div>

                            {/* Sécurité */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4">
                                <CheckCircle className="h-4 w-4" />
                                <span>Connexion sécurisée SSL</span>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-400 mt-6">
                        En continuant, vous acceptez nos{" "}
                        <Link href="/terms" className="hover:text-gray-600 underline">
                            Conditions d'utilisation
                        </Link>{" "}
                        et notre{" "}
                        <Link href="/privacy" className="hover:text-gray-600 underline">
                            Politique de confidentialité
                        </Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}
