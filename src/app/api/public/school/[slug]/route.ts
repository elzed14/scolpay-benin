// import { createClient } from "@/lib/supabase/client"; // Removed unused
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

        // 2. Récupérer les frais de scolarité (Tarifs)
        const { data: fees } = await supabase
            .from("fees")
            .select("id, name, amount, class_name")
            .eq("school_id", school.id)
            .order("amount", { ascending: true });

        // 3. Récupérer les stats réelles
        const { count: totalStudents } = await supabase
            .from("students")
            .select("*", { count: 'exact', head: true })
            .eq("school_id", school.id);

        const stats = {
            totalStudents: totalStudents || 0,
            totalFees: fees?.length || 0,
            averageRating: 4.8, // Placeholder
            reviewCount: 5
        };

        return NextResponse.json({
            school: {
                ...school,
                stats,
                fees: fees || [],
                reviews: [
                    {
                        rating: 5,
                        comment: "Une plateforme exceptionnelle qui facilite la vie des parents. Félicitations à l'administration !",
                        created_at: new Date().toISOString(),
                        parent_name: "Parent d'élève"
                    }
                ]
            }
        });

    } catch (error) {
        console.error("Erreur API Public School:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}