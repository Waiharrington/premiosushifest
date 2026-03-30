import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config({ path: '.env.local' })

async function main() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!)

    const { error: e1 } = await supabaseAdmin.from('votes').delete().not('id', 'is', null)
    const { error: e2 } = await supabaseAdmin.from('treasure_hunt_visits').delete().not('id', 'is', null)
    const { error: e3 } = await supabaseAdmin.from('treasure_hunt_prizes').delete().not('id', 'is', null)

    console.log("Error e1 (votes):", e1)
    console.log("Error e2 (visits):", e2)
    console.log("Error e3 (prizes):", e3)
}

main()
