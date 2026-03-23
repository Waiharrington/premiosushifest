
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfaunwikfeeybmuzcme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmF1bndpa2ZlZXlibXV6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE0ODgsImV4cCI6MjA4MzI4NzQ4OH0.4s61l42ylnt--YbN8cz6945BVGjJ61SBExOLg2S49ZU'

const supabase = createClient(supabaseUrl, supabaseKey)

// Numbers identified as bots
const BLACKLIST = [
    '93928',
    '6245893',
    '65938897',
    '12345678',
    '62317605',
    '62956626', // New one
]

async function runGuardian() {
    console.log("🛡️  GUARDIAN SYSTEM ACTIVE - PROTECTING DATABASE 🛡️")
    console.log("Press Ctrl+C to stop.")

    while (true) {
        try {
            // 1. Delete known Blacklisted numbers immediately
            const { count, error: deleteError } = await supabase
                .from('votes')
                .delete({ count: 'exact' })
                .in('voter_contact', BLACKLIST)

            if (count && count > 0) {
                console.log(`[${new Date().toLocaleTimeString()}] 🗑️  Deleted ${count} votes from blacklist.`)
            }

            // 2. Velocity Check (Advanced)
            // Identify ANY contact that has more than 5 votes in total (strict rule for now)
            // This stops them even if they rotate numbers but reuse them slightly

            // Note: We can't do complex aggregation easily with simple RLS client, 
            // so we'll fetch recent votes and analyze locally.

            const { data: recentVotes } = await supabase
                .from('votes')
                .select('voter_contact, id')
                .order('created_at', { ascending: false })
                .limit(500)

            if (recentVotes) {
                const counts: Record<string, number> = {}
                recentVotes.forEach(v => {
                    counts[v.voter_contact] = (counts[v.voter_contact] || 0) + 1
                })

                // Find abusers not in blacklist
                const newAbusers = Object.entries(counts)
                    .filter(([contact, count]) => count > 5 && !BLACKLIST.includes(contact))
                    .map(([contact]) => contact)

                if (newAbusers.length > 0) {
                    console.log(`[${new Date().toLocaleTimeString()}] 🚨 Detected ${newAbusers.length} new abusing numbers: ${newAbusers.join(', ')}`)

                    // Nuke them too
                    const { count: abuserCount } = await supabase
                        .from('votes')
                        .delete({ count: 'exact' })
                        .in('voter_contact', newAbusers)

                    console.log(`[${new Date().toLocaleTimeString()}] ⚡ Deleted ${abuserCount} spam votes from new abusers.`)

                    // Auto-add to blacklist for next loop so we delete them faster/cheaper
                    BLACKLIST.push(...newAbusers)
                }
            }

        } catch (e) {
            console.error("Guardian Error (will retry):", e)
        }

        // Wait 5 seconds before next sweep
        await new Promise(r => setTimeout(r, 5000))
    }
}

runGuardian()
