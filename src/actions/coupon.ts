'use server'

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function claimCoupon(userId: string) {
    if (!userId) return { success: false, error: "Usuario no identificado." }

    // 1. Check if user already has a coupon
    const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('claimed_by', userId)
        .single()

    if (existing) {
        return { success: false, error: "Ya has reclamado tu cupón sorpresa." }
    }

    // 2. Get an available coupon (randomly)
    // In a real scenario, we might want to assign specific restaurants.
    // For now, we take one 'available' coupon.
    const { data: availableCoupons, error: fetchError } = await supabase
        .from('coupons')
        .select('id')
        .eq('status', 'available')
        .limit(1)

    if (fetchError || !availableCoupons || availableCoupons.length === 0) {
        return { success: false, error: "No hay cupones disponibles en este momento." }
    }

    const couponId = availableCoupons[0].id

    // 3. Randomly assign a locale to this coupon if it doesn't have one
    const { data: locales } = await supabase.from('locales').select('id')
    if (!locales || locales.length === 0) return { success: false, error: "No hay restaurantes registrados." }
    
    const randomLocale = locales[Math.floor(Math.random() * locales.length)].id

    // 4. Claim it
    const { error: claimError } = await supabase
        .from('coupons')
        .update({
            status: 'claimed',
            claimed_by: userId,
            redeemed_at_locale: randomLocale,
            updated_at: new Date().toISOString()
        })
        .eq('id', couponId)
        .eq('status', 'available') // double check

    if (claimError) {
        return { success: false, error: "Error al reclamar el cupón." }
    }

    revalidatePath("/cupon")
    return { success: true }
}

export async function getMyCoupon(userId: string) {
    const { data, error } = await supabase
        .from('coupons')
        .select(`
            *,
            locales:redeemed_at_locale (name, image_url)
        `)
        .eq('claimed_by', userId)
        .single()

    if (error) return null
    return data
}

export async function redeemCoupon(couponId: string) {
    const { error } = await supabase
        .from('coupons')
        .update({
            status: 'redeemed',
            redeemed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', couponId)

    if (error) return { success: false, error: "Error al redimir el cupón." }
    
    revalidatePath("/cupon")
    return { success: true }
}
