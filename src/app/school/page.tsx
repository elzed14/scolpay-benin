"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    Download,
    TrendingUp,
    Calendar,
    CreditCard,
    Users,
    Wallet,
    ArrowUpRight,
    Clock,
    CheckCircle,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface Transaction {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    students: Array<{
        first_name: string;
        last_name: string;
    }> | { first_name: string; last_name: string } | null;
}

interface Debtor {
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    total_fee_due: number;
}

export default function SchoolDashboard() {
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        totalCollected: 0,
        dailyCollected: 0,
        pendingAmount: 0,
        recoveryRate: 0
    });
    const [chartData, setChartData] = useState<Array<{ name: string; amount: number }>>([]);
    const [topDebtors, setTopDebtors] = useState<Debtor[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const supabase = createClient();

    const fetchDashboardData = useCallback(async () => {
        // Fetch total students and fees
        const { data: studentsData } = await supabase
            .from("students")
            .select("total_fee_due");

        const totalRemainingDebt = studentsData?.reduce((acc, curr) => acc + (curr.total_fee_due || 0), 0) || 0;
        const studentCount = studentsData?.length || 0;

        // Fetch total completed transactions
        const { data: collectedData } = await supabase
            .from("transactions")
            .select("amount, created_at")
            .eq("status", "completed");

        // Fetch today's transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: dailyData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("status", "completed")
            .gte("created_at", today.toISOString());

        // Fetch pending transactions
        const { data: pendingData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("status", "pending");

        const totalColl = collectedData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
        const dailColl = dailyData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
        const totalPend = pendingData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

        // Recalcul PRECISION du Taux de Recouvrement
        const totalPotential = totalColl + totalRemainingDebt;
        const recRate = totalPotential > 0 ? Math.round((totalColl / totalPotential) * 100) : 0;

        setMetrics({
            totalStudents: studentCount,
            totalCollected: totalColl,
            dailyCollected: dailColl,
            pendingAmount: totalPend,
            recoveryRate: recRate
        });

        // PREPARE CHART DATA (Last 6 months)
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const currentMonth = new Date().getMonth();
        const last6Months: Array<{ name: string; amount: number; monthIndex: number; year: number }> = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            const targetMonth = new Date(d.getFullYear(), currentMonth - i, 1);
            last6Months.push({
                name: months[targetMonth.getMonth()],
                amount: 0,
                monthIndex: targetMonth.getMonth(),
                year: targetMonth.getFullYear()
            });
        }

        collectedData?.forEach(tx => {
            const d = new Date(tx.created_at);
            const month = d.getMonth();
            const year = d.getFullYear();

            const monthData = last6Months.find(m => m.monthIndex === month && m.year === year);
            if (monthData) {
                monthData.amount += tx.amount;
            }
        });

        setChartData(last6Months);
    }, [supabase]);

    const fetchTopDebtors = useCallback(async () => {
        const { data } = await supabase
            .from("students")
            .select("id, first_name, last_name, class_name, total_fee_due")
            .gt("total_fee_due", 0)
            .order("total_fee_due", { ascending: false })
            .limit(3);
        setTopDebtors(data || []);
    }, [supabase]);

    const fetchRecentTransactions = useCallback(async () => {
        const { data } = await supabase
            .from("transactions")
            .select(`
                id,
                amount,
                status,
                created_at,
                students(first_name, last_name)
            `)
            .order("created_at", { ascending: false })
            .limit(5);
        setRecentTransactions((data as Transaction[]) || []);
    }, [supabase]);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        await Promise.all([
            fetchDashboardData(),
            fetchTopDebtors(),
            fetchRecentTransactions()
        ]);
        setLoading(false);
    }, [fetchDashboardData, fetchTopDebtors, fetchRecentTransactions]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "completed":
                return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Validé</span>;
            case "pending":
                return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">En attente</span>;
            default:
                return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Échec</span>;
        }
    };

    const getStudentName = (tx: Transaction) => {
        if (!tx.students) return "N/A";
        if (Array.isArray(tx.students)) {
            return tx.students.length > 0 ? `${tx.students[0].first_name} ${tx.students[0].last_name}` : "N/A";
        }
        return `${tx.students.first_name} ${tx.students.last_name}`;
    };

    return (
        <DashboardLayout role="school">
            <div className="space-y-6">
                {/* En-tête amélioré */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-outfit">
                            Tableau de Bord
                        </h1>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date().toLocaleDateString("fr-FR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchAllData}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Actualiser
                        </Button>
                        <Link href="/school/transactions">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Exporter
                            </Button>
                        </Link>
                        <Link href="/school/transactions">
                            <Button size="sm" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                                <CreditCard className="h-4 w-4" />
                                Nouveau paiement
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Élèves</p>
                                    <p className="text-2xl font-bold">{metrics.totalStudents}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Recettes</p>
                                    <p className="text-2xl font-bold">{(metrics.totalCollected / 1000).toFixed(0)}k</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Wallet className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-green-100 text-xs">
                                <ArrowUpRight className="h-3 w-3" />
                                +{metrics.recoveryRate}% recouvré
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Aujourd'hui</p>
                                    <p className="text-2xl font-bold">{(metrics.dailyCollected / 1000).toFixed(1)}k</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">En attente</p>
                                    <p className="text-2xl font-bold">{(metrics.pendingAmount / 1000).toFixed(1)}k</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contenu principal */}
                <FinancialOverview metrics={metrics} chartData={chartData} topDebtors={topDebtors} />

                {/* Transactions récentes */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Transactions récentes</h2>
                            <Link href="/school/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Voir tout →
                            </Link>
                        </div>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {recentTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(tx.status)}
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {getStudentName(tx)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">
                                                {tx.amount.toLocaleString()} F
                                            </p>
                                            {getStatusLabel(tx.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>Aucune transaction récente</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
