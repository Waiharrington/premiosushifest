
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export default async function DebugDBPage() {
    const { data: publicLocales, error: publicError } = await supabase.from('locales').select('id')
    
    // Check with Service Role if available in env (Server Side)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let adminLocales = null
    let adminError = null
    
    if (serviceRoleKey) {
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
        const { data, error } = await supabaseAdmin.from('locales').select('id')
        adminLocales = data
        adminError = error
    }

    return (
        <div className="p-10 bg-black text-white font-mono">
            <h1>Debug DB</h1>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <hr className="my-4" />
            
            <h2>Public Client (Anon Key)</h2>
            <p>Count: {publicLocales?.length ?? "null"}</p>
            {publicError && <p className="text-red-500">Error: {publicError.message}</p>}
            
            <hr className="my-4" />
            
            <h2>Admin Client (Service Role)</h2>
            <p>Available: {serviceRoleKey ? "YES" : "NO"}</p>
            <p>Count: {adminLocales?.length ?? "null"}</p>
            {adminError && <p className="text-red-500">Error: {adminError.message}</p>}
        </div>
    )
}
