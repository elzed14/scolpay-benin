"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ExternalLink,
    Palette,
    Image,
    Save,
    Eye,
    QrCode,
    Copy,
    Check
} from "lucide-react";
import { toast } from "sonner";

interface SchoolData {
    id: string;
    name: string;
    slug: string | null;
    logo_url: string | null;
    banner_url: string | null;
    description: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
}

interface PublicPagePreviewProps {
    school: SchoolData;
    onUpdate: (data: Partial<SchoolData>) => Promise<void>;
}

export default function PublicPagePreview({ school, onUpdate }: PublicPagePreviewProps) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        slug: school.slug || school.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: school.description || "",
        primary_color: school.primary_color || "#1e40af",
        secondary_color: school.secondary_color || "#3b82f6",
        logo_url: school.logo_url || "",
        banner_url: school.banner_url || "",
        website: school.website || ""
    });

    const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/public/school/${formData.slug}`;

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate(formData);
            toast.success("Page publique mise à jour avec succès");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    const copyUrl = async () => {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        toast.success("URL copiée dans le presse-papier");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* URL et QR Code */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        URL de votre page publique
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            value={publicUrl}
                            readOnly
                            className="bg-gray-50"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyUrl}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="icon">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center gap-6">
                        <div className="bg-white p-3 rounded-lg border">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`}
                                alt="QR Code"
                                className="w-32 h-32"
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            <p className="font-medium mb-1">Partagez ce QR Code</p>
                            <p>Les parents peuvent scanner ce code pour accéder directement à votre page de paiement.</p>
                            <Button
                                variant="link"
                                className="p-0 h-auto mt-2"
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;
                                    link.download = `qrcode-${formData.slug}.png`;
                                    link.click();
                                }}
                            >
                                Télécharger en haute résolution
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personnalisation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Personnalisation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="slug">Identifiant URL</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                                placeholder="mon-ecole"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Utilisé dans l'URL de votre page publique
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="website">Site web (optionnel)</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://www.mon-ecole.com"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Présentez votre établissement aux parents..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="primary_color">Couleur principale</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    id="primary_color"
                                    value={formData.primary_color}
                                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                    className="w-10 h-10 rounded cursor-pointer"
                                />
                                <Input
                                    value={formData.primary_color}
                                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="secondary_color">Couleur secondaire</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    id="secondary_color"
                                    value={formData.secondary_color}
                                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                    className="w-10 h-10 rounded cursor-pointer"
                                />
                                <Input
                                    value={formData.secondary_color}
                                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Images */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Images
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="logo_url">URL du logo</Label>
                        <Input
                            id="logo_url"
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            placeholder="https://exemple.com/logo.png"
                        />
                        {formData.logo_url && (
                            <div className="mt-2 p-4 bg-gray-50 rounded-lg inline-block">
                                <img
                                    src={formData.logo_url}
                                    alt="Logo preview"
                                    className="h-16 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="banner_url">URL de la bannière</Label>
                        <Input
                            id="banner_url"
                            type="url"
                            value={formData.banner_url}
                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                            placeholder="https://exemple.com/banner.jpg"
                        />
                        {formData.banner_url && (
                            <div className="mt-2 rounded-lg overflow-hidden h-32">
                                <img
                                    src={formData.banner_url}
                                    alt="Banner preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Aperçu et Actions */}
            <div className="flex items-center justify-between">
                <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Prévisualiser
                    </Button>
                </a>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
            </div>
        </div>
    );
}