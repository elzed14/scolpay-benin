"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SubscriptionStatus = "active" | "expired" | "suspended" | "loading";

export function useSubscription() {
    const [status, setStatus] = useState<SubscriptionStatus>("loading");
    const [subscription, setSubscription] = useState<{
        id: string;
        plan_id: string;
        end_date: string;
        status: string;
        plan?: { name: string; duration_days: number };
    } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setStatus("expired");
                    return;
                }

                // Get school_id first
                const { data: school } = await supabase
                    .from("schools")
                    .select("id")
                    .eq("owner_id", user.id)
                    .single();

                if (!school) {
                    // This could be an admin or a user without a school profile yet
                    setStatus("active");
                    return;
                }

                const { data: sub, error } = await supabase
                    .from("school_subscriptions")
                    .select("*, plan:subscription_plans(*)")
                    .eq("school_id", school.id)
                    .order("end_date", { ascending: false })
                    .limit(1)
                    .single();

                if (error || !sub) {
                    // No subscription found means expired/inactive trial
                    setStatus("expired");
                    return;
                }

                setSubscription(sub);

                // Check status and expiration date
                const now = new Date();
                const endDate = new Date(sub.end_date);

                if (sub.status === "suspended") {
                    setStatus("suspended");
                } else if (now > endDate) {
                    setStatus("expired");
                } else {
                    setStatus("active");
                }
            } catch (err) {
                console.error("Subscription check error:", err);
                setStatus("expired");
            }
        };

        checkSubscription();
    }, [supabase]);

    const isRestricted = status !== "active" && status !== "loading";

    return { status, isRestricted, subscription };
}
