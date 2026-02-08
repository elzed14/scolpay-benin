"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
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
        <Card className="border-none shadow-xl bg-white">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <GraduationCap className="text-white h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
                <CardDescription>
                    Entrez vos identifiants pour accéder à votre compte
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="email">Email</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="password">Mot de passe</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Se connecter"}
                    </Button>
                </CardContent>
            </form>
            <CardFooter className="flex flex-col gap-4">
                <div className="text-sm text-center text-gray-500">
                    Vous n&apos;avez pas de compte ?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline font-semibold">
                        Inscrivez-vous
                    </Link>
                </div>
                <div className="text-xs text-center text-gray-400">
                    En continuant, vous acceptez nos Conditions d&apos;utilisation.
                </div>
            </CardFooter>
        </Card>
    );
}
