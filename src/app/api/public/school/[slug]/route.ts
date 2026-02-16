import { createClient } from "@/lib/supabase/client"; // Note: Client car public, mais dans Route Handler on peut utiliser createClient (server) sans cookies auth si on utilise anon key sur tables publiques, ou service role.
// Mieux: utiliser createClient du server sans auth user context pour lire des données publiques.
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> } // Next.js 15+ params are promises
) {
    try {
        const slug = (await params).slug;
        const supabase = await createServerClient();

        // Récupérer les données publiques de l'école
        // Note: On suppose que les politiques RLS autorisent la lecture publique de 'schools' ou on utilise Service Role si besoin (mais dangereux si mal filtré).
        // Ici on utilise le client standard, donc RLS s'applique. Il faut que la table 'schools' soit lisible par 'anon' pour ces colonnes.
        // ALTERNATIVE: Utiliser une fonction RPC sécurisée "get_public_school_info".
        // Pour l'instant, essayons une requête directe, si RLS bloque, on fera une RPC.

        const { data: school, error } = await supabase
            .from("schools")
            .select(`
                id,
                name,
                slug,
                logo_url,
                banner_url,
                description,
                primary_color,
                secondary_color,
                address,
                phone,
                email,
                website,
                city,
                country
            `)
            .eq("slug", slug)
            .single();

        if (error || !school) {
            console.error("Erreur fetch school public:", error);
            return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
        }

        // Récupérer quelques stats (simulées ou réelles si RLS le permet)
        // Pour l'instant, on mocke les stats pour éviter les problèmes de sécurité RLS sur 'students'/'transactions'
        const stats = {
            totalStudents: 150 + Math.floor(Math.random() * 500), // Placeholder
            totalFees: 0,
            averageRating: 4.5 + Math.random() * 0.5,
            reviewCount: 12 + Math.floor(Math.random() * 50)
        };

        // Récupérer des avis (mock pour l'instant)
        const reviews = [
            {
                rating: 5,
                comment: "Excellente école, très bonne gestion.",
                created_at: new Date().toISOString(),
                parent_name: "Jean D."
            },
            {
                rating: 4,
                comment: "Les paiements sont beaucoup plus simples maintenant.",
                created_at: new Date().toISOString(),
                parent_name: "Marie A."
            }
        ];

        return NextResponse.json({
            school: {
                ...school,
                stats,
                reviews
            }
        });

    } catch (error) {
        console.error("Erreur API Public School:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}