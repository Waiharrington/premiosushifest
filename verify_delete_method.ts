
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
    console.log("TESTING .IN() DELETION METHOD...")

    // First count them
    const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('voter_contact', '93928')

    console.log(`Votes for 93928: ${count}`)

    if (count === 0) return

    // Try delete using .in()
    const { count: deleted, error } = await supabase
        .from('votes')
        .delete({ count: 'exact' })
        .in('voter_contact', ['93928'])

    if (error) console.error(error)
    console.log(`Deleted using .in(): ${deleted}`)
}

verify()
