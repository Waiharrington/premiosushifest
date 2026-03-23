
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyze() {
    console.log("Searching for 'Montaño's Burgers'...")

    const { data: locales, error: localeError } = await supabase
        .from('locales')
        .select('id, name')
        .ilike('name', '%montaño%')

    if (localeError || !locales || locales.length === 0) {
        console.error("Error/Not Found")
        return
    }

    const locale = locales[0]
    console.log(`Found Locale: ${locale.name} (ID: ${locale.id})`)

    console.log("Fetching ALL votes history...")

    let allVotes: any[] = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    // Fetch all votes in pages
    while (hasMore) {
        const { data, error } = await supabase
            .from('votes')
            .select('voter_contact, created_at')
            .eq('locale_id', locale.id)
            .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) {
            console.error("Fetch error:", error)
            break
        }

        if (data.length > 0) {
            allVotes = [...allVotes, ...data]
            page++
            process.stdout.write(`\rFetched ${allVotes.length} votes...`)
        } else {
            hasMore = false
        }
    }
    console.log(`\nTotal votes fetched: ${allVotes.length}`)

    // Analysis
    const contactCounts: Record<string, number> = {}
    allVotes.forEach(v => {
        const contact = v.voter_contact || 'unknown'
        contactCounts[contact] = (contactCounts[contact] || 0) + 1
    })

    // Filter Abusers (> 3 votes to be safe)
    const THRESHOLD = 3
    const abusers = Object.entries(contactCounts).filter(([_, count]) => count > THRESHOLD)

    const totalFraudVotes = abusers.reduce((sum, [_, count]) => sum + count, 0)
    const uniqueAbusers = abusers.length

    console.log("\n--- DEEP ANALYSIS REPORT ---")
    console.log(`Total Votes: ${allVotes.length}`)
    console.log(`Unique Contacts: ${Object.keys(contactCounts).length}`)
    console.log(`Contacts with > ${THRESHOLD} votes: ${uniqueAbusers}`)
    console.log(`Total suspicious votes to delete: ${totalFraudVotes}`)

    console.log("\nTop Offenders:")
    abusers.sort(([, a], [, b]) => b - a).slice(0, 10).forEach(([c, count]) => console.log(`${c}: ${count} votes`))
}

analyze()
