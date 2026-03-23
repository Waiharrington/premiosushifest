
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)
const LOCALE_ID = 'c86a6342-7992-46e9-aeea-af624996077b'

async function testNuke() {
    console.log("TESTING NUKE RECENT...")
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    // Check count first
    const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('locale_id', LOCALE_ID)
        .gt('created_at', tenMinsAgo)

    console.log(`Votes in last 10 mins: ${count}`)
    if (!count) return

    // DELETE like nuke did
    const { count: deleted, error } = await supabase
        .from('votes')
        .delete({ count: 'exact' })
        .eq('locale_id', LOCALE_ID)
        .gt('created_at', tenMinsAgo)

    if (error) console.error(error)
    console.log(`Deleted: ${deleted}`)
}

testNuke()
