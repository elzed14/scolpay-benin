"use client";

import { useEffect, useState } from "react";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const menuItems = {
    school: [
        { title: "Tableau de bord", icon: LayoutDashboard, href: "/school" },
        { title: "Élèves", icon: Users, href: "/school/students" },
        { title: "Paiements", icon: CreditCard, href: "/school/transactions" },
        { title: "Tranches & Frais", icon: Settings, href: "/school/fees" },
        { title: "Mon Abonnement", icon: CreditCard, href: "/school/subscription" },
        { title: "Paramètres", icon: Settings, href: "/school/settings" },
    ],
    admin: [
        { title: "Surveillance", icon: LayoutDashboard, href: "/admin" },
        { title: "Écoles", icon: GraduationCap, href: "/admin/schools" },
        { title: "Abonnements", icon: CreditCard, href: "/admin/subscriptions" },
        { title: "Réglages", icon: Settings, href: "/admin/settings" },
    ]
};

export default function DashboardLayout({
    children,
    role = "school"
}: {
    children: React.ReactNode;
    role?: "school" | "admin";
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { status, isRestricted } = useSubscription();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const items = menuItems[role as keyof typeof menuItems] || [];

    return (
        <div className="flex h-screen bg-gray-50 font-outfit">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r transition-all duration-300 flex flex-col shadow-sm",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="h-16 flex items-center px-6 border-b">
                    <GraduationCap className="h-8 w-8 text-blue-600 shrink-0" />
                    {isSidebarOpen && <span className="ml-3 font-bold text-lg truncate text-gray-900">ScolPay</span>}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center p-3 rounded-xl transition-all group",
                                pathname === item.href
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "text-gray-500 hover:bg-gray-100"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
                            {isSidebarOpen && <span className="ml-3 font-medium">{item.title}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {isSidebarOpen && <span className="ml-3 font-medium">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {role === "school" && isRestricted && (
                    <div className="bg-orange-600 text-white px-8 py-2.5 flex items-center justify-center gap-2 text-sm font-bold">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Votre abonnement a expiré. Accès restreint.</span>
                        <Link href="/school/subscription" className="bg-white text-orange-600 px-3 py-1 rounded-full text-[10px] uppercase ml-4 hover:bg-orange-50 transition-colors">
                            Renouveler maintenant
                        </Link>
                    </div>
                )}

                <header className="h-16 bg-white border-b flex items-center justify-between px-8">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hover:bg-gray-100">
                        <Menu className="h-5 w-5 text-gray-500" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 uppercase">{role === "school" ? "École" : "Admin"}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Connecté</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            SP
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
                    {children}
                </main>
            </div>
        </div>
    );
}
