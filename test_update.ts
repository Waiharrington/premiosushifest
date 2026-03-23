
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdate() {
    console.log("TESTING UPDATE...")

    // Target the vote we failed to delete in test_cycle (or any vote)
    // We'll search for 'Test Cycle'
    const { data } = await supabase.from('votes').select('*').eq('voter_name', 'Test Cycle').limit(1)

    if (!data?.length) {
        console.log("No test vote found.")
        return
    }

    const vote = data[0]
    console.log(`Found candidate: ${vote.id}`)

    const newName = 'UPDATED-NAME'
    const { error, data: updated } = await supabase
        .from('votes')
        .update({ voter_name: newName })
        .eq('id', vote.id)
        .select()

    if (error) {
        console.error("Update failed:", error)
    } else {
        console.log("Update SUCCESS:", updated)
    }
}

testUpdate()
