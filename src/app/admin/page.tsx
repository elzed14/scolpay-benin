"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CheckCircle2, Clock, Loader2, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingSchools: 0,
        activeSchools: 0,
        pendingSubscriptions: 0,
        recentInscriptions: [] as any[],
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch schools stats
                const { data: schoolsData, error: schoolsError } = await supabase
                    .from("schools")
                    .select("is_verified");

                if (schoolsError) throw schoolsError;

                const pending = schoolsData?.filter(s => !s.is_verified).length || 0;
                const active = schoolsData?.filter(s => s.is_verified).length || 0;

                // Fetch pending subscriptions
                const { count: pendingSubs } = await supabase
                    .from("subscription_requests")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pending");

                // Fetch recent inscriptions
                const { data: recent, error: recentError } = await supabase
                    .from("schools")
                    .select("name, created_at, is_verified")
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (recentError) throw recentError;

                setStats({
                    pendingSchools: pending,
                    activeSchools: active,
                    pendingSubscriptions: pendingSubs || 0,
                    recentInscriptions: recent || [],
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [supabase]);

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Portail Administrateur</h1>
                    <p className="text-gray-500">Supervision globale du réseau ScolPay Bénin.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 text-orange-600">
                            <CardTitle className="text-sm font-medium">Écoles en attente</CardTitle>
                            <Clock className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingSchools}</div>
                            <p className="text-xs text-orange-600 font-medium italic">Validation requise</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 text-green-600">
                            <CardTitle className="text-sm font-medium">Écoles Actives</CardTitle>
                            <CheckCircle2 className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeSchools}</div>
                            <p className="text-xs text-green-600 font-medium italic">Certifications OK</p>
                        </CardContent>
                    </Card>
                    <Link href="/admin/subscriptions">
                        <Card className="hover:border-blue-500 transition-colors cursor-pointer border-blue-50 bg-blue-50/10">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 text-blue-600">
                                <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
                                <CreditCard className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingSubscriptions}</div>
                                <p className="text-xs text-blue-600 font-medium italic">Demandes à valider</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Dernières Inscriptions</h2>
                        <Link href="/admin/schools" className="text-sm text-blue-600 hover:underline">
                            Voir tout
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentInscriptions.length === 0 ? (
                            <p className="text-center py-8 text-gray-400 italic">Aucune inscription récente.</p>
                        ) : (
                            stats.recentInscriptions.map((school, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <GraduationCap className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{school.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(school.created_at).toLocaleDateString()} • {school.is_verified ? "Certifiée" : "En attente"}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/schools?id=${i}`} // Simplification pour le MVP
                                        className="text-xs bg-white border px-3 py-1.5 rounded-full hover:bg-gray-50 font-medium"
                                    >
                                        Détails
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
