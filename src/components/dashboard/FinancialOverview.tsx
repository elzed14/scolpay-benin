"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Wallet, AlertCircle } from "lucide-react";

interface FinancialOverviewProps {
    metrics: {
        totalStudents: number;
        totalCollected: number;
        dailyCollected: number;
        pendingAmount: number;
        recoveryRate: number; // Taux de recouvrement
    };
    topDebtors?: Array<{
        id: string;
        first_name: string;
        last_name: string;
        class_name: string;
        total_fee_due: number;
    }>;
    chartData?: Array<{
        name: string;
        amount: number;
    }>;
}

export default function FinancialOverview({ metrics, chartData, topDebtors = [] }: FinancialOverviewProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ... existing cards ... */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Élèves</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-outfit">{metrics.totalStudents}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            Effectif total
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Recettes Totales</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-outfit text-green-700">
                            {(metrics.totalCollected || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span>
                        </div>
                        <div className="flex items-center mt-1">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" />
                                {metrics.recoveryRate}% Recouvré
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Encaissé Aujourd'hui</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-outfit text-purple-700">
                            {(metrics.dailyCollected || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span>
                        </div>
                        <p className="text-xs text-purple-400 mt-1">
                            Flux journalier
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">En Attente</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-outfit text-yellow-600">
                            {(metrics.pendingAmount || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span>
                        </div>
                        <p className="text-xs text-yellow-500 mt-1 font-medium">
                            Nécessite validation
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS SECTION & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution Chart */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-800">Évolution des Recettes (6 mois)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Montant'] as [string, string]}
                                />
                                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                    {(chartData ?? []).map((entry, index, array) => (
                                        <Cell key={`cell-${index}`} fill={index === array.length - 1 ? '#2563eb' : '#9ca3af'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Actions & ALERTS */}
                <div className="space-y-6">
                    {/* CRITICAL ALERTS */}
                    {topDebtors.length > 0 && (
                        <Card className="shadow-sm border-l-4 border-l-red-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" /> Retards Critiques
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {topDebtors.map(student => (
                                    <div key={student.id} className="flex justify-between items-center text-sm p-2 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="font-bold text-gray-800">{student.first_name} {student.last_name}</p>
                                            <p className="text-xs text-gray-500">{student.class_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">{student.total_fee_due.toLocaleString()} F</p>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="link" className="text-red-600 p-0 h-auto text-xs w-full text-right" onClick={() => window.location.href = '/school/recovery'}>
                                    Voir tout &rarr;
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="shadow-sm bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white">Actions Rapides</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors" onClick={() => window.location.href = '/school/transactions'}>
                                <h3 className="font-bold text-sm">📥 Valider les paiements</h3>
                                <p className="text-xs text-blue-100 mt-1">Consulter les {metrics.pendingAmount > 0 ? 'transactions en attente' : 'transactions'}</p>
                            </div>

                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors" onClick={() => window.location.href = '/school/students'}>
                                <h3 className="font-bold text-sm">🖨️ Imprimer Cartes ID</h3>
                                <p className="text-xs text-blue-100 mt-1">Générer les QR Codes élèves</p>
                            </div>

                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors" onClick={() => window.location.href = '/school/recovery'}>
                                <h3 className="font-bold text-sm">📢 Lancer Recouvrement</h3>
                                <p className="text-xs text-blue-100 mt-1">Envoyer des rappels SMS</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
