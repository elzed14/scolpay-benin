import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const supabase = await createClient();

        // Récupérer les données publiques de l'école
        const { data: school, error } = await supabase
            .from("schools")
            .select(`
                id,
                name,
                slug,
                logo_url,
                banner_url,
                description,
                address,
                phone,
                email,
                website,
                primary_color,
                secondary_color,
                city,
                country,
                created_at
            `)
            .eq("slug", params.slug)
            .eq("is_active", true)
            .single();

        if (error || !school) {
            return NextResponse.json(
                { error: "École non trouvée" },
                { status: 404 }
            );
        }

        // Récupérer quelques statistiques publiques
        const { count: totalStudents } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("school_id", school.id);

        const { data: feeStats } = await supabase
            .from("fee_structures")
            .select("amount")
            .eq("school_id", school.id);

        const totalFees = feeStats?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

        // Récupérer les avis (si la table existe)
        const { data: reviews } = await supabase
            .from("school_reviews")
            .select("rating, comment, created_at, parent_name")
            .eq("school_id", school.id)
            .order("created_at", { ascending: false })
            .limit(5);

        const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

        return NextResponse.json({
            school: {
                ...school,
                stats: {
                    totalStudents: totalStudents || 0,
                    totalFees,
                    averageRating,
                    reviewCount: reviews?.length || 0
                },
                reviews: reviews || []
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'école:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}