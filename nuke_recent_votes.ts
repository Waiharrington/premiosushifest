
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

const LOCALE_ID = 'c86a6342-7992-46e9-aeea-af624996077b' // Montaño's Burgers

async function nuke() {
    console.log("🔥 STARTING AGGRESSIVE CLEANUP FOR MONTAÑO'S BURGERS 🔥")

    // Calculate timestamp for 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    console.log(`Targeting votes created after: ${oneHourAgo}`)

    // Get count first
    const { count, error: countError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('locale_id', LOCALE_ID)
        .gt('created_at', oneHourAgo)

    if (countError) {
        console.error("Error counting target votes:", countError)
        return
    }

    console.log(`Found ${count} recent votes to delete.`)

    if (!count || count === 0) {
        console.log("No recent votes found.")
        return
    }

    // Prepare deletion
    // Since we want to delete ALL of them, we might need to do it in batches if it's huge, 
    // but assuming < 10k it should be fine in one go or multiple small deletes.
    // Supabase delete with filters works directly.

    const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('locale_id', LOCALE_ID)
        .gt('created_at', oneHourAgo)

    if (deleteError) {
        console.error("Error deleting votes:", deleteError)
    } else {
        console.log(`✅ SUCCESSFULLY DELETED ${count} RECENT VOTES`)
    }
}

nuke()
