"use client";

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface StudentIdCardProps {
    student: {
        id: string;
        first_name: string;
        last_name: string;
        matricule: string;
        class_name: string;
        school_name?: string; // Passed from parent or context
    };
    schoolName: string;
}

export default function StudentIdCard({ student, schoolName }: StudentIdCardProps) {
    const handlePrint = () => {
        const printContent = document.getElementById(`id-card-${student.id}`);
        const originalContents = document.body.innerHTML;

        if (printContent) {
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore event listeners
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                    <Printer className="h-4 w-4" /> Carte
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white p-0 overflow-hidden rounded-xl border-0">
                <div id={`id-card-${student.id}`} className="bg-white items-center flex flex-col">
                    {/* Design de la Carte - Format CR80 (Type Carte Bancaire) mais agrandi pour l'écran */}
                    <div className="w-[350px] h-[550px] relative bg-gradient-to-b from-blue-900 to-blue-800 text-white rounded-none shadow-2xl overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="h-24 flex items-center justify-center p-4 text-center border-b border-white/20">
                            <div>
                                <h2 className="font-bold text-lg uppercase tracking-wider">{schoolName}</h2>
                                <p className="text-xs text-blue-200 mt-1">Année Scolaire 2024-2025</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 bg-white text-gray-900 flex flex-col items-center pt-8 relative">
                            {/* Photo Placeholder */}
                            <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-lg -mt-16 mb-4 flex items-center justify-center">
                                <span className="text-gray-400 text-4xl">👤</span>
                            </div>

                            <h1 className="text-2xl font-bold text-blue-900 uppercase text-center px-4">
                                {student.first_name} <br /> {student.last_name}
                            </h1>

                            <div className="mt-2 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                {student.class_name}
                            </div>

                            <div className="mt-8 space-y-1 text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Matricule</p>
                                <p className="font-mono text-xl font-bold">{student.matricule}</p>
                            </div>

                            {/* QR Code Section */}
                            <div className="mt-auto mb-8 bg-white p-2 rounded-lg border-2 border-dashed border-blue-200">
                                {/* Le QR Code pointe vers une URL de vérification publique (à implémenter) */}
                                <QRCodeSVG
                                    value={`https://scolpay.benin/verify/${student.matricule}`}
                                    size={100}
                                    level="H"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="h-3 bg-red-500"></div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-center">
                    <Button onClick={handlePrint} className="bg-blue-600 gap-2">
                        <Printer className="h-4 w-4" /> Imprimer la Carte
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
