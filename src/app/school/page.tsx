"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import FinancialOverview from "@/components/dashboard/FinancialOverview";

export default function SchoolDashboard() {
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        totalCollected: 0,
        dailyCollected: 0,
        pendingAmount: 0,
        recoveryRate: 0
    });
    const [chartData, setChartData] = useState<Array<{ name: string; amount: number }>>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchDashboardData = async () => {
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
            // Total Potentiel = Ce qu'on a déjà encaissé + Ce qui reste à payer
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

            // Initialize last 6 months
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

            // Fill with real data
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
        };

        const fetchTopDebtors = async () => {
            const { data } = await supabase
                .from("students")
                .select("id, first_name, last_name, class_name, total_fee_due")
                .gt("total_fee_due", 0)
                .order("total_fee_due", { ascending: false })
                .limit(3);
            setTopDebtors(data || []);
        };

        fetchDashboardData();
        fetchTopDebtors();
    }, [supabase]);

    const [topDebtors, setTopDebtors] = useState<any[]>([]);

    return (
        <DashboardLayout role="school">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-outfit">Tableau de Bord</h1>
                    <p className="text-gray-500">Pilotage financier et scolaire.</p>
                </div>

                {/* NEW DASHBOARD COMPONENT */}
                <FinancialOverview metrics={metrics} chartData={chartData} topDebtors={topDebtors} />
            </div>
        </DashboardLayout>
    );
}
