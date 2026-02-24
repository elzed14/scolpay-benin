"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface CreateAnnouncementDialogProps {
    onSuccess: () => void;
}

export default function CreateAnnouncementDialog({ onSuccess }: CreateAnnouncementDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: ""
    });
    const [isPublic, setIsPublic] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let attachment_url = "";

            if (file) {
                setUploading(true);
                const supabase = createClient();
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `attachments/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('announcements')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('announcements')
                    .getPublicUrl(filePath);

                attachment_url = publicUrl;
                setUploading(false);
            }

            const response = await fetch("/api/school/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, attachment_url, is_public: isPublic })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de la création");
            }

            toast.success("Annonce publiée avec succès !");
            setFormData({ title: "", content: "" });
            setIsPublic(false);
            setFile(null);
            setOpen(false);
            onSuccess();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle annonce
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Publier une annonce</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Réunion des parents"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Contenu</Label>
                        <Textarea
                            id="content"
                            placeholder="Détails de l'annonce..."
                            className="h-32"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                        <input
                            type="checkbox"
                            id="is_public"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <Label htmlFor="is_public" className="cursor-pointer font-medium text-gray-700">
                            Rendre cette annonce publique (visible sur la page de l&apos;école)
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Pièce jointe (Optionnel - PDF, Image...)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                className="cursor-pointer"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            {file && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setFile(null)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {file && <p className="text-xs text-gray-500 italic">Fichier sélectionné: {file.name}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading || uploading} className="bg-blue-600">
                            {(loading || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {uploading ? "Envoi du fichier..." : "Publier"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
