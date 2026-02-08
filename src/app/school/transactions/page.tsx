"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, CheckCircle, Clock, Loader2, AlertTriangle, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { useSubscription } from "@/hooks/useSubscription";

interface Student {
    first_name: string;
    last_name: string;
    matricule: string;
}

interface Transaction {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    payment_method: string;
    payment_reference?: string;
    momo_reference?: string;
    student_id?: string;
    students: Student[] | null;
}

interface FilterState {
    search: string;
    status: string;
    startDate: string;
    endDate: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "",
        startDate: "",
        endDate: ""
    });
    const { isRestricted } = useSubscription();
    const supabase = createClient();

    const fetchTransactions = useCallback(async (applyFilters = false) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Starting fetch transactions...");

            // Get current user's school_id
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error("User error:", userError);
                throw new Error("Utilisateur non authentifié");
            }
            console.log("User ID:", user.id);

            // Get school_id for the current user
            const { data: school, error: schoolError } = await supabase
                .from("schools")
                .select("id, name")
                .eq("owner_id", user.id)
                .single();

            if (schoolError || !school) {
                console.error("School error:", schoolError);
                console.error("School data:", school);
                throw new Error("École non trouvée");
            }
            console.log("School ID:", school.id);

            // Build query - simplified to avoid join issues
            let query = supabase
                .from("transactions")
                .select("*")
                .eq("school_id", school.id);

            console.log("Base query built");

            // Apply filters if needed
            if (applyFilters) {
                console.log("Applying filters:", filters);
                if (filters.status) {
                    query = query.eq("status", filters.status);
                }

                // Search filter (simplified)
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    query = query.or(`student_id.ilike.%${searchLower}%,momo_reference.ilike.%${searchLower}%`);
                }
            }

            console.log("Executing query...");
            const { data, error: txError } = await query;
            console.log("Query result:", data);
            console.log("Query error:", txError);
            console.log("Number of transactions found:", data ? data.length : 0);

            if (txError) {
                console.error("Transaction fetch error:", txError);
                const errorMessage = txError.message || "Erreur lors de la récupération des transactions";
                throw new Error(errorMessage);
            }

            // Debug: Show raw data in console for troubleshooting
            console.log("Raw transaction data:", JSON.stringify(data, null, 2));

            // Transform the data to match our interface
            const transformedData = (data || []).map((tx: any) => ({
                id: tx.id,
                amount: tx.amount,
                status: tx.status,
                created_at: tx.created_at,
                payment_method: tx.payment_method,
                payment_reference: tx.payment_reference,
                momo_reference: tx.momo_reference,
                student_id: tx.student_id,
                students: null // We'll fetch student info separately if needed
            }));

            // Dictionary hack to pass debug info to UI
            const txWithDebug: any = transformedData;
            txWithDebug._debug_user = user.id;
            txWithDebug._debug_school = school.id;

            setTransactions(txWithDebug);
            console.log("Transactions set:", transformedData);
        } catch (err: unknown) {
            console.error("Fetch transactions error:", err);
            const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
            setError(errorMessage);
            toast.error("Erreur lors du chargement des transactions: " + errorMessage);
        } finally {
            setLoading(false);
        }
    }, [supabase, filters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setUpdating(id);
        try {
            const { error } = await supabase
                .from("transactions")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) {
                console.error("Update status error:", error);
                throw error;
            }
            toast.success("Transaction validée !");
            fetchTransactions(true);
        } catch (error) {
            console.error("Validation error:", error);
            toast.error("Erreur lors de la validation.");
        } finally {
            setUpdating(null);
        }
    };

    const handleDownloadReceipt = (id: string) => {
        window.open(`/api/transactions/receipt/${id}`, "_blank");
    };

    const handleExportExcel = () => {
        window.open("/api/transactions/export", "_blank");
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        fetchTransactions(true);
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilters({
            search: "",
            status: "",
            startDate: "",
            endDate: ""
        });
        fetchTransactions(true);
        setShowFilters(false);
    };

    const formatPaymentMethod = (tx: Transaction) => {
        if (tx.momo_reference) {
            return {
                main: tx.momo_reference,
                method: tx.payment_method || "Mobile Money"
            };
        }
        return {
            main: tx.payment_method || "Non spécifiée",
            method: ""
        };
    };

    const getStudentInfo = (tx: Transaction) => {
        return {
            name: "Étudiant",
            matricule: tx.student_id || "Non défini"
        };
    };

    const filteredCount = transactions.length;
    const pendingCount = transactions.filter(tx => tx.status === "pending").length;

    return (
        <DashboardLayout role="school">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Historique des Paiements</h1>
                        <p className="text-sm text-gray-500">
                            Consultez et gérez les transactions de l'établissement.
                            <span className="text-blue-600 font-medium"> {pendingCount} en attente de validation.</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="gap-2"
                            disabled={isRestricted}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? "Masquer" : "Filtres"}
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            disabled={isRestricted}
                            onClick={handleExportExcel}
                        >
                            <Download className="h-4 w-4" /> Exporter Excel
                        </Button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Recherche</label>
                                <Input
                                    placeholder="Élève, matricule ou référence..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Statut</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                >
                                    <option value="">Tous</option>
                                    <option value="pending">En attente</option>
                                    <option value="completed">Validé</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Date début</label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Date fin</label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                                Appliquer les filtres
                            </Button>
                            <Button variant="outline" onClick={resetFilters}>
                                Réinitialiser
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-800 text-sm">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>Erreur: {error}</p>
                    </div>
                )}

                {isRestricted && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-800 text-sm">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>Votre abonnement a expiré. La validation des transactions et l'export sont désactivés.</p>
                    </div>
                )}

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Élève</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Méthode / Ref</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Chargement des transactions...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                                        {error ? "Aucune transaction trouvée." : "Aucune transaction trouvée."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => {
                                    const paymentInfo = formatPaymentMethod(tx);
                                    const studentInfo = getStudentInfo(tx);
                                    return (
                                        <TableRow key={tx.id} className={tx.momo_reference && tx.status === 'pending' ? 'bg-blue-50/50' : ''}>
                                            <TableCell className="text-sm">
                                                {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                                                <div className="text-xs text-gray-400">
                                                    {new Date(tx.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium uppercase">
                                                    {studentInfo.name}
                                                </div>
                                                <div className="font-mono text-xs text-gray-500">
                                                    {studentInfo.matricule}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {tx.amount.toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="font-medium">{paymentInfo.main}</div>
                                                {paymentInfo.method && (
                                                    <div className="text-xs font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded inline-block mt-1 border border-blue-200">
                                                        {paymentInfo.method}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {tx.status === "completed" ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                                        <CheckCircle className="h-3 w-3" /> Validé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                                                        <Clock className="h-3 w-3" /> En attente
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                {tx.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-2 ring-blue-200"
                                                        onClick={() => handleUpdateStatus(tx.id, "completed")}
                                                        disabled={updating === tx.id}
                                                    >
                                                        {updating === tx.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                        )}
                                                        Valider
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-blue-600"
                                                    onClick={() => handleDownloadReceipt(tx.id)}
                                                >
                                                    <FileText className="h-3 w-3" /> Reçu
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}