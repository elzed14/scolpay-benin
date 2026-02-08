"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface NavbarProps {
    role?: "parent" | "school" | "visitor";
}

export default function Navbar({ role = "visitor" }: NavbarProps) {
    return (
        <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white sticky top-0 z-50">
            <Link href="/" className="flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 font-outfit">ScolPay Bénin</span>
                {role === "parent" && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Parents</span>}
            </Link>
            <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                <Link href="/#features" className="text-sm font-medium hover:text-blue-600 transition-colors hidden sm:block">Fonctionnalités</Link>
                <Link href="/parent" className="text-sm font-medium hover:text-blue-600 transition-colors">Payer</Link>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors border px-4 py-1.5 rounded-full">Connexion</Link>
                <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-all shadow-sm">École</Link>
            </nav>
        </header>
    );
}
