"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Wallet, Shield, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SchoolSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [school, setSchool] = useState<{ id: string; name: string; momo_number: string; contact_phone?: string; address?: string } | null>(null);
    const supabase = createClient();

    const fetchSchool = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("schools")
                .select("*")
                .eq("owner_id", user.id)
                .single();

            if (error) throw error;
            setSchool(data);
        } catch (_error: unknown) {
            toast.error("Erreur lors du chargement des paramètres");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchSchool();
    }, [fetchSchool]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!school) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("schools")
                .update({
                    name: school.name,
                    contact_phone: school.contact_phone,
                    address: school.address,
                })
                .eq("id", school.id);

            if (error) throw error;
            toast.success("Paramètres mis à jour !");
        } catch (_error: unknown) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="school">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="school">
            <div className="space-y-8 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold">Paramètres de l&apos;Établissement</h1>
                    <p className="text-sm text-gray-500">Gérez les informations de votre école et vos identifiants Mobile Money.</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <CardTitle>Profil de l&apos;École</CardTitle>
                            </div>
                            <CardDescription>Informations publiques affichées aux parents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nom Officiel</label>
                                        <Input
                                            value={school?.name || ""}
                                            onChange={(e) => school && setSchool({ ...school, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact WhatsApp / Téléphone</label>
                                        <Input
                                            value={school?.contact_phone || ""}
                                            onChange={(e) => school && setSchool({ ...school, contact_phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Adresse</label>
                                    <Input
                                        value={school?.address || ""}
                                        onChange={(e) => school && setSchool({ ...school, address: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="bg-blue-600" disabled={saving}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Enregistrer les modifications
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50/30">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-yellow-600" />
                                <CardTitle>Configuration Mobile Money</CardTitle>
                            </div>
                            <CardDescription>C&apos;est ici que vous recevrez les fonds des parents.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white border border-yellow-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">Numéro MoMo Pay (Marchand)</p>
                                        <p className="text-2xl font-mono text-yellow-700">{school?.momo_number || "Non configuré"}</p>
                                    </div>
                                    <Shield className="h-10 w-10 text-yellow-200" />
                                </div>
                                <p className="text-xs text-yellow-600 mt-2">Ce numéro est vérifié par l&apos;administrateur. Contactez le support pour toute modification.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
