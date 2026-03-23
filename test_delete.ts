
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log("TESTING DELETION...")

    // 1. Fetch one vote from a known abuser
    const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_contact', '93928')
        .limit(1)

    if (error || !data?.length) {
        console.error("Could not find test candidate.", error)
        return
    }

    const vote = data[0]
    console.log("Candidate found:", vote)

    // 2. Try delete by ID
    console.log(`Attempting to delete by Locale + Timestamp...`)
    const { count: countId, error: errId } = await supabase
        .from('votes')
        .delete({ count: 'exact' })
        .eq('locale_id', vote.locale_id)
        .eq('created_at', vote.created_at)

    if (errId) console.error("Error ID delete:", errId)
    console.log(`Delete by ID result count: ${countId}`)

    // 3. Try to fetch it again (to see if it's really gone)
    const { data: check } = await supabase.from('votes').select('id').eq('id', vote.id)
    if (!check?.length) {
        console.log("✅ Row is physically GONE.")
    } else {
        console.log("❌ Row STILL EXISTS.")
    }

}
test()
