
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

const BLACKLISTED_NUMBERS = [
    '93928',
    '6245893',
    '65938897',
    '12345678', // New bot number detected
    '62317605'
]

async function clean() {
    console.log("--- STARTING CLEANUP OPERATION ---")
    console.log(`Targeting votes from: ${BLACKLISTED_NUMBERS.join(', ')}`)

    let totalDeleted = 0

    // Delete one by one to count them (or we can use 'in')
    const { count, error: countError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .in('voter_contact', BLACKLISTED_NUMBERS)

    if (countError) {
        console.error("Error counting target votes:", countError)
        return
    }

    console.log(`Found ${count} fraudulent votes to delete.`)

    if (count === 0) {
        console.log("No votes found to delete.")
        return
    }

    const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .in('voter_contact', BLACKLISTED_NUMBERS)

    if (deleteError) {
        console.error("Error deleting votes:", deleteError)
    } else {
        console.log(`✅ SUCCESSFULLY DELETED ${count} FRAUDULENT VOTES`)
    }
}

clean()
