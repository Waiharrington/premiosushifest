'use server'

import { supabase } from "@/lib/supabase"

export async function getLocaleByName(name: string) {
    const { data, error } = await supabase
        .from('locales')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(1)
        .single()

    if (error) return null
    return data
}

export async function getRedeemedCoupons(localeId: string) {
    const { data, error } = await supabase
        .from('coupons')
        .select(`
            *,
            profiles:claimed_by (full_name, cedula)
        `)
        .eq('redeemed_at_locale', localeId)
        .eq('status', 'redeemed')
        .order('redeemed_at', { ascending: false })

    if (error) return []
    return data
}
