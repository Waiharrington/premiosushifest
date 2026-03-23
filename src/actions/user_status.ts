'use server'

import { supabase } from "@/lib/supabase"

export async function getUserLocaleStatus(userId: string, localeId: string) {
    if (!userId || !localeId) return null

    // 1. Fetch rating
    const { data: rating } = await supabase
        .from('ratings')
        .select('flavor, service, presentation')
        .eq('user_id', userId)
        .eq('locale_id', localeId)
        .single()

    // 2. Fetch if they have a vote for THIS locale
    const { data: vote } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', userId)
        .eq('locale_id', localeId)
        .single()

    // 3. Fetch if they have a vote for ANY locale (to see who they voted for)
    const { data: currentVote } = await supabase
        .from('votes')
        .select('locale_id, locales(name)')
        .eq('user_id', userId)
        .single()

    return {
        rating: rating || null,
        hasVoteHere: !!vote,
        activeVote: currentVote ? {
            localeId: (currentVote as unknown as { locale_id: string }).locale_id,
            localeName: (currentVote as unknown as { locales: { name: string } }).locales.name
        } : null
    }
}
