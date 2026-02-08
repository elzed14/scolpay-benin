"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Loader2, GraduationCap, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SubscriptionRequest {
    id: string;
    school_id: string;
    plan_id: string;
    status: string;
    created_at: string;
    schools: {
        name: string;
    };
    plan: {
        name: string;
        duration_days: number;
    };
}

export default function AdminSubscriptionsPage() {
    const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("subscription_requests")
                .select(`
                    *,
                    schools (name),
                    plan:subscription_plans (*)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRequests(data as unknown as SubscriptionRequest[] || []);
        } catch (_error) {
            toast.error("Erreur lors du chargement des demandes.");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (request: SubscriptionRequest) => {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + (request.plan?.duration_days || 30));

            // 1. Create/Update subscription
            const { error: subError } = await supabase.from("school_subscriptions").insert({
                school_id: request.school_id,
                plan_id: request.plan_id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: "active"
            });

            if (subError) throw subError;

            // 2. Mark request as approved
            await supabase.from("subscription_requests").update({ status: "approved" }).eq("id", request.id);

            toast.success("Abonnement activé pour l'école !");
            fetchRequests();
        } catch (_error) {
            toast.error("Erreur lors de l'approbation.");
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold font-outfit">Demandes d&apos;Abonnement</h1>
                    <p className="text-sm text-gray-500">Gérez les renouvellements manuels des écoles.</p>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>École</TableHead>
                                <TableHead>Plan Demandé</TableHead>
                                <TableHead>Date Demande</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-400 italic">
                                        Aucune demande en attente.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center">
                                                    <GraduationCap className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <span className="font-bold text-sm uppercase">{req.schools?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                                {req.plan?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {req.status === "approved" ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Approuvé
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                                                    <Clock className="h-3 w-3" /> En attente
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === "pending" && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 rounded-xl" onClick={() => handleApprove(req)}>
                                                    Approuver <ArrowUpRight className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
