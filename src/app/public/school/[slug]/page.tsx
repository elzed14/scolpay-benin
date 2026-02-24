"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Shield,
    Star,
    CheckCircle,
    ChevronRight,
    Search,
    Megaphone,
    Download,
    FileText
} from "lucide-react";
import Link from "next/link";

interface SchoolData {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    banner_url: string | null;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    city: string | null;
    country: string | null;
    stats: {
        totalStudents: number;
        totalFees: number;
        averageRating: number | null;
        reviewCount: number;
    };
    fees: Array<{
        id: string;
        name: string;
        amount: number;
        class_name: string;
    }>;
    reviews: Array<{
        rating: number;
        comment: string;
        created_at: string;
        parent_name: string;
    }>;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    attachment_url?: string;
    created_at: string;
}

export default function PublicSchoolPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [school, setSchool] = useState<SchoolData | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [schoolRes, annRes] = await Promise.all([
                    fetch(`/api/public/school/${slug}`),
                    fetch(`/api/public/school/announcements/${slug}`)
                ]);

                if (!schoolRes.ok) throw new Error("École non trouvée");

                const schoolData = await schoolRes.json();
                setSchool(schoolData.school);

                if (annRes.ok) {
                    const annData = await annRes.json();
                    setAnnouncements(annData.announcements || []);
                }
            } catch (err) {
                setError("Impossible de charger les informations de l'école");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !school) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md mx-auto p-8 text-center">
                    <CardContent>
                        <div className="text-red-500 mb-4">
                            <Shield className="h-16 w-16 mx-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">École non trouvée</h1>
                        <p className="text-gray-600 mb-6">
                            L'école que vous recherchez n'existe pas ou n'est plus active.
                        </p>
                        <Link href="/">
                            <Button>Retour à l'accueil</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const primaryColor = school.primary_color || "#1e40af";
    const secondaryColor = school.secondary_color || "#3b82f6";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Bannière */}
            <div
                className="h-64 md:h-80 relative"
                style={{
                    background: school.banner_url
                        ? `url(${school.banner_url}) center/cover`
                        : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                }}
            >
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="max-w-6xl mx-auto flex items-end gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden -mb-12">
                            {school.logo_url ? (
                                <img
                                    src={school.logo_url}
                                    alt={school.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold" style={{ color: primaryColor }}>
                                    {school.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="text-white pb-2">
                            <h1 className="text-2xl md:text-4xl font-bold">{school.name}</h1>
                            {school.city && (
                                <p className="flex items-center gap-1 text-white/80 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {school.city}, {school.country || "Bénin"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-6xl mx-auto px-4 pt-16 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        {school.description && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">À propos</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {school.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tarifs */}
                        {school.fees.length > 0 && (
                            <Card id="tarifs">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                                        Frais de Scolarité
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="py-2 font-semibold text-gray-700">Type de Frais</th>
                                                    <th className="py-2 font-semibold text-gray-700">Classe</th>
                                                    <th className="py-2 font-semibold text-gray-700 text-right">Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {school.fees.map((fee) => (
                                                    <tr key={fee.id} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="py-3 text-gray-800">{fee.name}</td>
                                                        <td className="py-3 text-gray-600">{fee.class_name || "Toutes"}</td>
                                                        <td className="py-3 text-right font-bold text-blue-600">
                                                            {fee.amount.toLocaleString()} FCFA
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Annonces Publiques */}
                        {announcements.length > 0 && (
                            <Card id="annonces">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Megaphone className="h-6 w-6 text-blue-600" />
                                        <h2 className="text-xl font-bold text-gray-800">Actualités & Annonces</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {announcements.map((ann) => (
                                            <div key={ann.id} className="border-b last:border-0 pb-6 last:pb-0">
                                                <h3 className="font-bold text-lg text-gray-800 mb-2">{ann.title}</h3>
                                                <p className="text-gray-600 whitespace-pre-wrap mb-4">{ann.content}</p>
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <span className="text-sm text-gray-400">
                                                        Publié le {new Date(ann.created_at).toLocaleDateString("fr-FR")}
                                                    </span>
                                                    {ann.attachment_url && (
                                                        <a
                                                            href={ann.attachment_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            <span>Consulter le document</span>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Formulaire d'inscription */}
                        <Card id="inscription">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    Pré-inscription en ligne
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Remplissez ce formulaire pour manifester votre intérêt. L&apos;école vous recontactera rapidement.
                                </p>
                                <RegistrationForm schoolId={school.id} primaryColor={primaryColor} />
                            </CardContent>
                        </Card>

                        {/* Avis */}
                        {school.reviews.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-800">Avis des parents</h2>
                                        {school.stats.averageRating && (
                                            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-semibold text-yellow-700">
                                                    {school.stats.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {school.reviews.map((review, index) => (
                                            <div key={index} className="border-b pb-4 last:border-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating
                                                                    ? "text-yellow-400 fill-yellow-400"
                                                                    : "text-gray-300"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {review.parent_name}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Colonne latérale */}
                    <div className="space-y-6">
                        {/* Statistiques */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Statistiques</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Élèves inscrits</span>
                                        <span className="font-bold text-gray-800">
                                            {school.stats.totalStudents.toLocaleString()}
                                        </span>
                                    </div>
                                    {school.stats.averageRating && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Note moyenne</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-bold text-gray-800">
                                                    {school.stats.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Avis</span>
                                        <span className="font-bold text-gray-800">
                                            {school.stats.reviewCount}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Contact</h2>
                                <div className="space-y-3">
                                    {school.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{school.address}</span>
                                        </div>
                                    )}
                                    {school.phone && (
                                        <a
                                            href={`tel:${school.phone}`}
                                            className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                                        >
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            {school.phone}
                                        </a>
                                    )}
                                    {school.email && (
                                        <a
                                            href={`mailto:${school.email}`}
                                            className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                                        >
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            {school.email}
                                        </a>
                                    )}
                                    {school.website && (
                                        <a
                                            href={school.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                                        >
                                            <Globe className="h-5 w-5 text-gray-400" />
                                            Site web
                                            <ChevronRight className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* CTA Paiement */}
                        <Card className="overflow-hidden">
                            <div
                                className="p-6 text-white text-center"
                                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                            >
                                <h2 className="text-xl font-bold mb-2">Payez vos frais scolaires</h2>
                                <p className="text-white/80 text-sm mb-4">
                                    Simple, rapide et sécurisé
                                </p>
                                <Link href={`/login?school=${school.slug}`}>
                                    <Button className="w-full bg-white text-gray-800 hover:bg-gray-100">
                                        Effectuer un paiement
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        {/* QR Code */}
                        <Card>
                            <CardContent className="p-6 text-center">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">
                                    Scanner pour payer
                                </h2>
                                <div className="bg-white p-4 rounded-lg inline-block border">
                                    <div
                                        className="w-32 h-32 bg-gray-100 flex items-center justify-center"
                                        style={{ background: `url(https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(`https://scolpay.bj/public/school/${school.slug}`)}) center/cover` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    Scannez ce QR Code pour accéder à cette page
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        Propulsé par <span className="text-white font-semibold">ScolPay</span> -
                        La solution de paiement scolaire au Bénin
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        © {new Date().getFullYear()} ScolPay. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function RegistrationForm({ schoolId, primaryColor }: { schoolId: string, primaryColor: string }) {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        parentPhone: "",
        parentEmail: "",
        className: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        try {
            const response = await fetch("/api/public/registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, schoolId })
            });

            if (!response.ok) throw new Error();
            setStatus("success");
        } catch (_err) {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-800 mb-2">Demande envoyée !</h3>
                <p className="text-green-700">
                    L&apos;établissement a bien reçu votre demande de pré-inscription. Ils vous contacteront prochainement.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Prénom de l&apos;élève</label>
                    <input
                        required
                        className="w-full px-3 py-2 border rounded-md focus:ring-2"
                        style={{ outlineColor: primaryColor }}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Jean"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nom de l&apos;élève</label>
                    <input
                        required
                        className="w-full px-3 py-2 border rounded-md focus:ring-2"
                        style={{ outlineColor: primaryColor }}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="DUBOIS"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Classe souhaitée</label>
                <input
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2"
                    style={{ outlineColor: primaryColor }}
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="Ex: CM2"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Téléphone du parent</label>
                    <input
                        required
                        type="tel"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2"
                        style={{ outlineColor: primaryColor }}
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        placeholder="97000000"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email du parent (optionnel)</label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2"
                        style={{ outlineColor: primaryColor }}
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        placeholder="parent@example.com"
                    />
                </div>
            </div>
            <Button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-6 text-lg font-bold text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
            >
                {status === "submitting" ? "Envoi en cours..." : "Soumettre ma demande"}
            </Button>
            {status === "error" && (
                <p className="text-red-500 text-sm text-center">
                    Une erreur est survenue. Veuillez réessayer.
                </p>
            )}
        </form>
    );
}
