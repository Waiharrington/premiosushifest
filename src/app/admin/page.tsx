import { supabase } from "@/lib/supabase"
import { checkAuth } from "@/actions/admin"
import { AdminDashboard } from "@/components/AdminDashboard"
import { AdminLogin } from "@/components/AdminLogin"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
    const isAuth = await checkAuth()

    if (!isAuth) {
        return <AdminLogin />
    }

    // Fetch locales and votes for the dashboard
    const { data: locales } = await supabase
        .from("locales")
        .select("*")
        .order("name")

    const { data: visits } = await supabase
        .from("treasure_hunt_visits")
        .select("id, locale_id")

    // Adapt visits to the "Vote" interface expected by AdminDashboard for stats
    const adaptedVotes = (visits || []).map(v => ({
        id: v.id,
        locale_id: v.locale_id
    }))

    return (
        <main className="min-h-screen bg-background py-10">
            <AdminDashboard 
                locales={locales || []} 
                votes={adaptedVotes} 
            />
        </main>
    )
}
