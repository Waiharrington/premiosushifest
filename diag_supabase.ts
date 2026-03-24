
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vyjzsggpucxhzsfpdgti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5anpzZ2dwdWN4aHpzZnBkZ3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3NzczOCwiZXhwIjoyMDg5ODUzNzM4fQ.nTDr0AHYneVYyEP71jToYJfL7TOdKvTbSLepr9RdsxU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log("Checking project:", supabaseUrl)
    
    const checkTable = async (name: string) => {
        const { data, error } = await supabase.from(name).select('*')
        if (error) console.log(`- ${name}: Error (${error.message})`)
        else console.log(`- ${name}: OK (${data.length} rows found)`)
    }
    
    await checkTable('locales')
    await checkTable('profiles')
    await checkTable('treasure_hunt_visits')
    await checkTable('app_config')
}

check()
