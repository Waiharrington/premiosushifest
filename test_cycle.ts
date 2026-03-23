
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)
const LOCALE_ID = 'c86a6342-7992-46e9-aeea-af624996077b'

async function testCycle() {
    console.log("TESTING CREATE -> DELETE CYCLE")

    // 1. Insert
    const fakeContact = 'TEST-' + Date.now()
    const { data, error: insertError } = await supabase
        .from('votes')
        .insert({
            locale_id: LOCALE_ID,
            voter_name: 'Test Cycle',
            voter_contact: fakeContact
        })
        .select()

    if (insertError) {
        console.error("Insert failed:", insertError)
        return
    }

    const vote = data[0]
    console.log(`Inserted ID: ${vote.id}`)

    // 2. Delete
    console.log("Attempting delete...")
    const { count, error: deleteError } = await supabase
        .from('votes')
        .delete({ count: 'exact' })
        .eq('id', vote.id)

    if (deleteError) {
        console.error("Delete failed:", deleteError)
    } else {
        console.log(`Deleted count: ${count}`)
    }
}

testCycle()
