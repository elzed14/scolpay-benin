"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface FeeConfig {
    id: string;
    title: string;
    total_amount: number;
    allow_installments: boolean;
    min_installment_amount: number;
}

export default function FeesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fees, setFees] = useState<FeeConfig[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newFee, setNewFee] = useState<Partial<FeeConfig>>({
        title: "",
        total_amount: 0,
        allow_installments: true,
        min_installment_amount: 0
    });

    const supabase = createClient();

    const fetchFees = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: school } = await supabase
                .from("schools")
                .select("id")
                .eq("owner_id", user.id)
                .single();

            if (!school) return;

            const { data, error } = await supabase
                .from("fees_config")
                .select("*")
                .eq("school_id", school.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setFees(data || []);
        } catch (_error: unknown) {
            toast.error("Erreur lors du chargement des frais");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    const handleAddFee = async () => {
        if (!newFee.title || !newFee.total_amount) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: school } = await supabase.from("schools").select("id").eq("owner_id", user?.id).single();

            const { error } = await supabase.from("fees_config").insert({
                school_id: school?.id,
                title: newFee.title,
                total_amount: newFee.total_amount,
                allow_installments: newFee.allow_installments,
                min_installment_amount: newFee.min_installment_amount
            });

            if (error) throw error;
            toast.success("Type de frais ajouté !");
            setIsAdding(false);
            setNewFee({ title: "", total_amount: 0, allow_installments: true, min_installment_amount: 0 });
            fetchFees();
        } catch (_error: unknown) {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce type de frais ?")) return;
        try {
            const { error } = await supabase.from("fees_config").delete().eq("id", id);
            if (error) throw error;
            toast.success("Frais supprimés");
            fetchFees();
        } catch (_error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <DashboardLayout role="school">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Configuration des Frais</h1>
                        <p className="text-sm text-gray-500">Définissez les types de frais et les modalités de paiement.</p>
                    </div>
                    <Button
                        className="bg-blue-600 gap-2"
                        onClick={() => setIsAdding(!isAdding)}
                        disabled={isAdding}
                    >
                        <Plus className="h-4 w-4" /> Nouveau type de frais
                    </Button>
                </div>

                {isAdding && (
                    <Card className="border-blue-200 bg-blue-50/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Nouveau frais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Libellé (ex: Scolarité, Transport)</label>
                                    <Input
                                        placeholder="Nom du frais"
                                        value={newFee.title}
                                        onChange={(e) => setNewFee({ ...newFee, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Montant Total (FCFA)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newFee.total_amount}
                                        onChange={(e) => setNewFee({ ...newFee, total_amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="installments"
                                    checked={newFee.allow_installments}
                                    onCheckedChange={(checked) => setNewFee({ ...newFee, allow_installments: !!checked })}
                                />
                                <label htmlFor="installments" className="text-sm font-medium leading-none cursor-pointer">
                                    Autoriser le paiement par tranches
                                </label>
                            </div>
                            {newFee.allow_installments && (
                                <div className="space-y-2 max-w-xs">
                                    <label className="text-sm font-medium">Montant minimum de tranche (FCFA)</label>
                                    <Input
                                        type="number"
                                        placeholder="ex: 25000"
                                        value={newFee.min_installment_amount}
                                        onChange={(e) => setNewFee({ ...newFee, min_installment_amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            )}
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Annuler</Button>
                                <Button className="bg-blue-600" onClick={handleAddFee} disabled={saving}>
                                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Enregistrer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : fees.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white border rounded-lg">
                            Aucun type de frais configuré. Cliquez sur &quot;Nouveau type de frais&quot; pour commencer.
                        </div>
                    ) : (
                        fees.map((fee) => (
                            <Card key={fee.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{fee.title}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(fee.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Montant Total</span>
                                        <span className="font-bold text-blue-600">{fee.total_amount.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Par tranches</span>
                                        {fee.allow_installments ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                                <Check className="h-3 w-3" /> Activé
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-gray-400">
                                                <X className="h-3 w-3" /> Désactivé
                                            </span>
                                        )}
                                    </div>
                                    {fee.allow_installments && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Tranche Min.</span>
                                            <span className="font-semibold text-gray-700">{fee.min_installment_amount?.toLocaleString() || 0} FCFA</span>
                                        </div>
                                    )}
                                    <Button variant="outline" className="w-full mt-2 text-xs h-8 border-dashed">
                                        <Pencil className="h-3 w-3 mr-2" /> Modifier
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
