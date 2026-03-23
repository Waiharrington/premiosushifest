
'use server'

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BLACKLISTED_CONTACTS = [
    '93928',
    '6245893',
    '65938897',
    '63264986', // Added from analysis
    '62317605'  // Added from analysis
]

export async function submitVote(localeId: string, name: string, contact: string) {
    // 1. Blacklist Check
    if (BLACKLISTED_CONTACTS.includes(contact.trim())) {
        console.warn(`Blocked blacklist vote attempt: ${contact}`)
        return { success: false, error: "Tu número no está autorizado para votar." }
    }

    // 2. Validate Inputs
    if (!name || !contact) {
        return { success: false, error: "Nombre y contacto son requeridos." }
    }

    // 3. Check for Existing Vote (Double Voting)
    // We check if THIS contact has already voted for THIS locale.
    const { count, error: countError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('locale_id', localeId)
        .eq('voter_contact', contact)

    if (countError) {
        console.error("Error checking existing votes:", countError)
        return { success: false, error: "Error de conexión. Intenta de nuevo." }
    }

    if (count && count > 0) {
        return { success: false, error: "Ya has votado por este participante." }
    }

    // 4. Insert Vote
    const { error } = await supabase
        .from('votes')
        .insert({
            locale_id: localeId,
            voter_name: name,
            voter_contact: contact
        })

    if (error) {
        console.error("Vote insertion error:", error)
        return { success: false, error: "Error al registrar el voto." }
    }

    revalidatePath("/")
    revalidatePath("/ranking")
    revalidatePath("/admin")

    return { success: true }
}
