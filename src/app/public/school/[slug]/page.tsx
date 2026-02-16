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
    Users,
    Star,
    Shield,
    Clock,
    ChevronRight,
    CheckCircle
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
    reviews: Array<{
        rating: number;
        comment: string;
        created_at: string;
        parent_name: string;
    }>;
}

export default function PublicSchoolPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [school, setSchool] = useState<SchoolData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const response = await fetch(`/api/public/school/${slug}`);
                if (!response.ok) {
                    throw new Error("École non trouvée");
                }
                const data = await response.json();
                setSchool(data.school);
            } catch (err) {
                setError("Impossible de charger les informations de l'école");
            } finally {
                setLoading(false);
            }
        };

        fetchSchool();
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

                        {/* Pourquoi utiliser ScolPay */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Pourquoi payer via ScolPay ?
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-6 w-6 text-green-500 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Paiements sécurisés</h3>
                                            <p className="text-sm text-gray-600">
                                                Vos transactions sont protégées et cryptées
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-6 w-6 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Disponible 24h/24</h3>
                                            <p className="text-sm text-gray-600">
                                                Payez à tout moment, où que vous soyez
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-purple-500 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Reçus instantanés</h3>
                                            <p className="text-sm text-gray-600">
                                                Recevez une confirmation immédiate par SMS
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="h-6 w-6 text-orange-500 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Suivi en temps réel</h3>
                                            <p className="text-sm text-gray-600">
                                                Consultez l'historique de vos paiements
                                            </p>
                                        </div>
                                    </div>
                                </div>
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