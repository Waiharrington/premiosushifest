
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function purgeById() {
    console.log("💀 STARTING ID-BASED PURGE 💀")

    // 1. Find Locale
    const { data: locales } = await supabase
        .from('locales')
        .select('id')
        .ilike('name', '%montaño%')

    if (!locales?.length) return
    const localeId = locales[0].id

    // 2. Fetch everything including IDs
    console.log("Fetching vote IDs...")
    let allVotes: any[] = []
    let from = 0
    const STEP = 1000
    let keepFetching = true

    while (keepFetching) {
        const { data, error } = await supabase
            .from('votes')
            .select('id, voter_contact')
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

    // 3. Identify Abusers
    const contactCounts: Record<string, number> = {}
    allVotes.forEach(v => {
        const c = v.voter_contact || 'unknown' // Use RAW value
        contactCounts[c] = (contactCounts[c] || 0) + 1
    })

    const abusers = new Set(
        Object.entries(contactCounts)
            .filter(([_, count]) => count > 3)
            .map(([contact]) => contact)
    )

    console.log(`\nIdentified ${abusers.size} abusive contacts.`)

    // 4. Collect IDs of abusive votes
    const idsToDelete = allVotes
        .filter(v => abusers.has(v.voter_contact || 'unknown'))
        .map(v => v.id)

    console.log(`Found ${idsToDelete.length} specific vote IDs to delete.`)

    if (idsToDelete.length === 0) return

    // 5. Delete by ID
    const BATCH_SIZE = 100 // IDs are long, safer batch
    let deletedCount = 0

    for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        const batch = idsToDelete.slice(i, i + BATCH_SIZE)

        const { count, error } = await supabase
            .from('votes')
            .delete({ count: 'exact' })
            .in('id', batch) // Delete by UUID

        if (error) {
            console.error("Delete error:", error)
        }

        if (count) deletedCount += count
        process.stdout.write(`\rDeleted ${deletedCount} votes...`)
    }

    console.log(`\n\n✅ SUCCESS: Deleted ${deletedCount} votes using IDs.`)
}

purgeById()
