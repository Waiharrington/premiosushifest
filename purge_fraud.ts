
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function purge() {
    console.log("💀 STARTING MASSIVE PURGE FOR MONTAÑO'S BURGERS 💀")

    // 1. Find Locale
    const { data: locales } = await supabase
        .from('locales')
        .select('id')
        .ilike('name', '%montaño%')

    if (!locales?.length) return
    const localeId = locales[0].id

    // 2. Fetch everything
    console.log("Fetching vote data to identify abusers...")
    let allVotes: any[] = []
    let from = 0
    const STEP = 1000
    let keepFetching = true

    while (keepFetching) {
        const { data, error } = await supabase
            .from('votes')
            .select('voter_contact')
            .eq('locale_id', localeId)
            .range(from, from + STEP - 1)

        if (error) break

        if (data && data.length > 0) {
            allVotes = [...allVotes, ...data]
            from += data.length
            process.stdout.write(`\rFetched ${allVotes.length} records...`)

            if (data.length < STEP) keepFetching = false
        } else {
            keepFetching = false
        }
    }

    console.log("\nAnalyzing...")
    const contactCounts: Record<string, number> = {}
    allVotes.forEach(v => {
        const c = (v.voter_contact || 'unknown').trim()
        if (c) contactCounts[c] = (contactCounts[c] || 0) + 1
    })

    // Identify abusers (> 3 votes)
    const abusers = Object.entries(contactCounts)
        .filter(([_, count]) => count > 3)
        .map(([contact]) => contact)

    console.log(`\nIdentified ${abusers.length} unique phone numbers used for spamming.`)
    console.log(`Purging ALL votes from these numbers GLOBALLY...`)

    if (abusers.length === 0) {
        console.log("No abusers found.")
        return
    }

    const BATCH_SIZE = 50
    let deletedCount = 0

    for (let i = 0; i < abusers.length; i += BATCH_SIZE) {
        const batch = abusers.slice(i, i + BATCH_SIZE)
        console.log(`\nPurging batch starting with ${batch[0]}...`)

        const { count, error } = await supabase
            .from('votes')
            .delete({ count: 'exact' })
            .in('voter_contact', batch) // Global purge for these numbers

        if (error) console.error("Error:", error)
        if (count) deletedCount += count
        console.log(`Deleted: ${count}`)
    }

    console.log(`\n\n✅ OPERATION COMPLETE.`)
    console.log(`Total Fraudulent Votes Removed: ${deletedCount}`)
}

purge()
