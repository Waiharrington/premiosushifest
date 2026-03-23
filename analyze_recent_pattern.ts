
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeRecent() {
    console.log("🕵️ ANALYZING RECENT VOTES FOR MONTAÑO'S BURGERS 🕵️")

    // 1. Find Locale
    const { data: locales } = await supabase
        .from('locales')
        .select('id')
        .ilike('name', '%montaño%')

    if (!locales?.length) return
    const localeId = locales[0].id

    // 2. Fetch last 100 votes sorted by newest
    const { data: votes } = await supabase
        .from('votes')
        .select('voter_name, voter_contact, created_at')
        .eq('locale_id', localeId)
        .order('created_at', { ascending: false })
        .limit(100)

    if (!votes?.length) {
        console.log("No recent votes found.")
        return
    }

    // Detailed Pattern Analysis
    const suspicious: any[] = []
    const numberLengths: Record<number, number> = {}

    votes.forEach(v => {
        const c = (v.voter_contact || '').replace(/\D/g, '') // digits only
        const len = c.length
        numberLengths[len] = (numberLengths[len] || 0) + 1

        // Heuristic: Suspicious if < 7 digits or > 12 digits or sequential 12345
        if (len < 7 || len > 12 || c.includes('12345') || c.includes('00000')) {
            suspicious.push(v)
        }
    })

    console.log(`\nPhone Number Length Distribution:`, numberLengths)
    console.log(`Suspicious Patterns Detected: ${suspicious.length}`)

    if (suspicious.length > 0) {
        console.log("Examples of suspicious detected:", suspicious.slice(0, 5))
    }

    // Frequency Check
    const counts: Record<string, number> = {}
    votes.forEach(v => counts[v.voter_contact] = (counts[v.voter_contact] || 0) + 1)
    const heavyHitters = Object.entries(counts).filter(([k, v]) => v > 2).sort((a, b) => b[1] - a[1])

    console.log(`\nRepeaters (>2 times) in this recent batch: ${heavyHitters.length}`)
    if (heavyHitters.length > 0) console.log(heavyHitters.slice(0, 5))
}

analyzeRecent()
