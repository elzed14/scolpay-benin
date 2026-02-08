"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Clock, CheckCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Student {
    first_name: string;
    last_name: string;
    matricule: string;
}

interface PendingTransaction {
    id: string;
    amount: number;
    created_at: string;
    momo_reference: string;
    students: Student[];
}

export default function TransactionNotification() {
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchPendingTransactions();

        // Set up real-time subscription
        const channel = supabase
            .channel('pending-transactions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `status=eq.pending`
                },
                (payload) => {
                    console.log('New transaction:', payload);
                    fetchPendingTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchPendingTransactions = async () => {
        try {
            // Get current user's school_id
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) return;

            // Get school_id for the current user
            const { data: school } = await supabase
                .from("schools")
                .select("id")
                .eq("owner_id", user.id)
                .single();

            if (!school) return;

            // Fetch pending transactions
            const { data, error } = await supabase
                .from("transactions")
                .select(`
                    id,
                    amount,
                    created_at,
                    momo_reference,
                    students (
                        first_name,
                        last_name,
                        matricule
                    )
                `)
                .eq("school_id", school.id)
                .eq("status", "pending")
                .limit(5);

            if (error) throw error;

            setPendingTransactions(data || []);
            setShowNotification((data || []).length > 0);
        } catch (error) {
            console.error("Error fetching pending transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const dismissNotification = () => {
        setShowNotification(false);
    };

    if (!showNotification || pendingTransactions.length === 0 || loading) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <Card className="border-l-4 border-l-yellow-500 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-yellow-600" />
                            <CardTitle className="text-lg font-semibold text-yellow-800">
                                Nouveaux paiements
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={dismissNotification}
                            className="h-6 w-6 p-0 hover:bg-yellow-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-yellow-700 mb-3">
                        Vous avez {pendingTransactions.length} paiement(s) en attente de validation
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {pendingTransactions.map((tx) => (
                            <div key={tx.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-yellow-900">
                                            {tx.students[0]?.first_name} {tx.students[0]?.last_name}
                                        </div>
                                        <div className="text-xs text-yellow-600 font-mono">
                                            {tx.students[0]?.matricule}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-bold text-yellow-800">
                                                {tx.amount.toLocaleString()} FCFA
                                            </span>
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                                {tx.momo_reference}
                                            </span>
                                        </div>
                                    </div>
                                    <Clock className="h-4 w-4 text-yellow-600 mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Link href="/school/transactions">
                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 flex-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Voir tous
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={dismissNotification}
                        >
                            Ignorer
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}