'use server'

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { TreasureHuntVisit, TreasureHuntPrize } from "@/types"

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

    // Base Prize pool logic
    let prizes = [
        { name: "10% de Descuento", type: "discount" as const, weight: 40 },
        { name: "15% de Descuento", type: "discount" as const, weight: 20 },
        { name: "20% de Descuento", type: "discount" as const, weight: 10 },
        { name: "Licuadora", type: "gift" as const, weight: 2 },
        { name: "Masaje Relajante", type: "gift" as const, weight: 3 },
        { name: "Gracias por participar, ¡sigue intentando!", type: "try_again" as const, weight: 25 },
    ]

    // If prize pool is exhausted, remove gifts
    if (giftCount >= prizePool) {
        prizes = prizes.filter(p => p.type !== 'gift')
    }
    // If discount pool is exhausted, remove discounts
    if (discountCount >= discountPool) {
        prizes = prizes.filter(p => p.type !== 'discount')
    }

    const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0)
    let random = Math.random() * totalWeight
    let selectedPrize = prizes[prizes.length - 1]

    for (const p of prizes) {
        if (random < p.weight) {
            selectedPrize = p
            break
        }
        random -= p.weight
    }

    // Save prize
    const { data: newPrize, error } = await supabase
        .from('treasure_hunt_prizes')
        .insert({
            user_id: userId,
            locale_id: localeId,
            prize_name: selectedPrize.name,
            prize_type: selectedPrize.type
        })
        .select()
        .single()

    if (error) {
        console.error("Error saving prize:", error)
        return { success: false, error: "No se pudo generar el premio" }
    }

    revalidatePath("/treasure-hunt")
    return { success: true, prize: newPrize as TreasureHuntPrize }
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

    const { error } = await supabase
        .from('treasure_hunt_prizes')
        .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
        .eq('id', prizeId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}
