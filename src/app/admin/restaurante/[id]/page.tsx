import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { RestaurantDashboardClient } from "@/components/RestaurantDashboardClient"

export default async function RestauranteAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch the locale details
    const { data: locale, error: localeError } = await supabase
        .from('locales')
        .select('*')
        .eq('id', id)
        .single()

    if (localeError || !locale) {
        notFound()
    }

    // Pass data to a client component to handle PIN authentication and interactivity
    return <RestaurantDashboardClient locale={locale} />
}
