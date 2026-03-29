'use server'

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { TreasureHuntVisit, TreasureHuntPrize } from "@/types"
import { createClient } from "@supabase/supabase-js"

export async function registerVisit(userId: string, localeId: string) {
    if (!userId || !localeId) return { success: false, error: "Datos incompletos" }

    // Check if already visited
    const { data: existing } = await supabase
        .from('treasure_hunt_visits')
        .select('id')
        .eq('user_id', userId)
        .eq('locale_id', localeId)
        .single()

    if (existing) {
        return { success: true, alreadyVisited: true }
    }

    // Register visit
    const { error } = await supabase
        .from('treasure_hunt_visits')
        .insert({ user_id: userId, locale_id: localeId })

    if (error) {
        console.error("Error registering visit:", error)
        return { success: false, error: "No se pudo registrar la visita" }
    }

    revalidatePath("/treasure-hunt")
    return { success: true, alreadyVisited: false }
}

export async function getTreasureHuntStatus(userId: string) {
    if (!userId) return { visits: [], prizes: [] }

    const { data: visits } = await supabase
        .from('treasure_hunt_visits')
        .select('*')
        .eq('user_id', userId)

    const { data: prizes } = await supabase
        .from('treasure_hunt_prizes')
        .select('*')
        .eq('user_id', userId)

    return {
        visits: (visits || []) as TreasureHuntVisit[],
        prizes: (prizes || []) as TreasureHuntPrize[]
    }
}

export async function generateScratchPrize(userId: string, localeId: string) {
    if (!userId || !localeId) return { success: false, error: "Datos incompletos" }

    // Check if prize already generated for this visit
    const { data: existingPrize } = await supabase
        .from('treasure_hunt_prizes')
        .select('*')
        .eq('user_id', userId)
        .eq('locale_id', localeId)
        .single()

    if (existingPrize) {
        return { success: true, prize: existingPrize as TreasureHuntPrize }
    }

    // Fetch Locale's Prize Pool limit
    const { data: locale } = await supabase.from('locales').select('prize_pool, discount_pool').eq('id', localeId).single()
    const prizePool = locale?.prize_pool || 0
    const discountPool = locale?.discount_pool || 0

    // Count how many 'winning' prizes have been given out
    const { data: winningPrizes } = await supabase
        .from('treasure_hunt_prizes')
        .select('prize_type')
        .eq('locale_id', localeId)
        .neq('prize_type', 'try_again')

    const giftCount = winningPrizes?.filter(p => p.prize_type === 'gift').length || 0
    const discountCount = winningPrizes?.filter(p => p.prize_type === 'discount').length || 0

    // DEMO MODE TOGGLE
    const DEMO_MODE = true;
 
    if (DEMO_MODE) {
        // Count total visits for this user to determine if it's a prize or discount scan
        const { count: totalVisits } = await supabase
            .from('treasure_hunt_visits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        const visitNumber = totalVisits || 1;
        const isPrizeScan = visitNumber % 5 === 0;

        let prizeName = "";
        let prizeType: 'gift' | 'discount' | 'sponsor_gift' = 'discount';

        if (isPrizeScan) {
            const demoPrizeNames = ["Proyector Smart", "Barra de Sonido", "Aire Acondicionado", "Smart TV 50\""];
            prizeName = demoPrizeNames[Math.floor(Math.random() * demoPrizeNames.length)];
            prizeType = 'sponsor_gift';
        } else {
            prizeName = "DESCUENTO ESPECIAL";
            prizeType = 'discount';
        }
        
        const { data: newPrize, error } = await supabase
            .from('treasure_hunt_prizes')
            .insert({
                user_id: userId,
                locale_id: localeId,
                prize_name: prizeName,
                prize_type: prizeType,
            })
            .select()
            .single();
 
        if (error) {
            console.error("Error saving demo prize:", error);
            return { success: false, error: "Error al guardar el premio: " + error.message };
        }
 
        // Return visitNumber so the frontend can pick the right discount image (1-3 cycling)
        revalidatePath("/treasure-hunt");
        return { success: true, prize: newPrize as TreasureHuntPrize, visitNumber };
    }

    // Normal logic is currently disabled in favor of DEMO_MODE
    return { success: false, error: "Modo Demo activo." };
}


export async function getTreasureHuntLeaderboard() {
    // Logic to find users with most visits
    const { data, error } = await supabase
        .from('treasure_hunt_visits')
        .select('user_id, profiles(full_name)')
    
    if (error) return []

    // Count visits per user
    const counts: Record<string, { name: string, count: number }> = {}
    if (data) {
        data.forEach((v) => {
            const uid = v.user_id
            if (!counts[uid]) {
                const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
                counts[uid] = { name: profile?.full_name || "Anónimo", count: 0 }
            }
            counts[uid].count++
        })
    }

    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10)
}

export async function redeemPrize(prizeId: string) {
    if (!prizeId) return { success: false, error: "ID inválido" }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY en el servidor" }
    
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const { error, count } = await supabaseAdmin
        .from('treasure_hunt_prizes')
        .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
        .eq('id', prizeId)

    if (error) {
        console.error("Redeem error:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/treasure-hunt")
    return { success: true }
}

export async function awardGrandPrize(userId: string) {
    if (!userId) return { success: false, error: "Usuario no identificado" }

    // 1. Check if user already has a 'gift' (since they only come from Special QR now)
    const { count: giftPrizesCount } = await supabase
        .from('treasure_hunt_prizes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('prize_type', 'gift')

    if (giftPrizesCount && giftPrizesCount > 0) {
        return { success: false, error: "Ya recibiste tu Premio de Cortesía." }
    }

    // 2. Check Global Limit (200 plates total)
    const { count: totalGiftsAwarded } = await supabase
        .from('treasure_hunt_prizes')
        .select('*', { count: 'exact', head: true })
        .eq('prize_type', 'gift')

    if (totalGiftsAwarded !== null && totalGiftsAwarded >= 200) {
        return { success: false, error: "Lo sentimos, los 200 premios de cortesía ya han sido entregados." }
    }

    // 3. Select 3 random locales that have prize_pool available
    const { data: locales } = await supabase
        .from('locales')
        .select('id, name, prize_pool')
        .gt('prize_pool', 0)

    if (!locales || locales.length < 3) {
        return { success: false, error: "No hay suficientes locales con disponibilidad de platos gratis en este momento." }
    }

    // Shuffle and pick 3
    const shuffled = [...locales].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 3)

    // 4. Create the 3 prizes (using service role key to bypass RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, error: "Error de configuración del servidor" }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const prizeEntries = selected.map(locale => ({
        user_id: userId,
        locale_id: locale.id,
        prize_name: "PLATO ESPECIAL DE CORTESÍA",
        prize_type: "courtesy"
    }))

    const { error: insertError } = await supabaseAdmin
        .from('treasure_hunt_prizes')
        .insert(prizeEntries)

    if (insertError) {
        console.error("Error awarding grand prize:", insertError)
        return { success: false, error: "Hubo un error asignando tus premios." }
    }

    revalidatePath("/treasure-hunt")
    return { success: true, awardedTo: selected.map(s => s.name) }
}
