import { checkAuth, login } from "@/actions/admin"
import { AdminLogin } from "@/components/AdminLogin"
import { AdminDashboard } from "@/components/AdminDashboard"
import { supabase } from "@/lib/supabase"

// Force dynamic rendering so data is always fresh
export const dynamic = 'force-dynamic'

export default async function AdminPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Correctly await searchParams for Next.js 15
    const searchParams = await props.searchParams
    const pin = searchParams.pin as string

    // Check if the user is authenticated via cookie
    const isAuthenticated = await checkAuth()

    // If not authenticated via cookie, check if we have a valid PIN in the URL
    // (This allows immediate access if navigating with ?pin=1234)
    if (!isAuthenticated && pin) {
        const res = await login(pin)
        // If the PIN in URL is valid, we'll continue. Login() already set the cookie.
        if (!res.success) {
            return <AdminLogin />
        }
    } else if (!isAuthenticated) {
        return <AdminLogin />
    }

    try {
        // Fetch data for the dashboard
        const { data: locales, error: localesError } = await supabase.from('locales').select('*').order('name')

        if (localesError) throw localesError

        // Fetch ALL votes using batching to bypass the 1000-row limit per request
        let allVotes: { id: string; locale_id: string }[] = []
        let hasMore = true
        let page = 0
        const pageSize = 1000

        while (hasMore) {
            const { data, error } = await supabase
                .from('votes')
                .select('*')
                .range(page * pageSize, (page + 1) * pageSize - 1)

            if (error) {
                console.error('Error fetching votes batch:', error)
                break
            }

            if (data) {
                allVotes = [...allVotes, ...data]
                if (data.length < pageSize) {
                    hasMore = false
                } else {
                    page++
                }
            } else {
                hasMore = false
            }
        }

        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <AdminDashboard
                    locales={locales || []}
                    votes={allVotes}
                />
            </div>
        )
    } catch (error) {
        console.error("Critical Admin Page Error:", error)
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Error de Servidor ⚠️</h1>
                <p className="max-w-md text-slate-400">
                    No pudimos cargar el panel de administración. Por favor verifica los secretos en Vercel
                    (SUPABASE_URL y ENV) y reintenta.
                </p>
                <div className="mt-6 p-4 bg-slate-900 rounded-lg text-xs font-mono text-red-300">
                    {error instanceof Error ? error.message : "Error desconocido"}
                </div>
            </div>
        )
    }
}
