'use server'

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

export async function submitRatingAndVote(
    userId: string,
    localeId: string,
    ratings: { flavor: number; service: number; presentation: number },
    wantToVote: boolean,
    confirmMoveVote: boolean = false
) {
    if (!userId || !localeId) {
        return { success: false, error: "Datos de usuario o local faltantes." }
    }

    // 1. Check if rating already exists
    const { data: existingRating } = await supabase
        .from('ratings')
        .select('id, flavor, service, presentation')
        .eq('user_id', userId)
        .eq('locale_id', localeId)
        .single()

    if (existingRating) {
        // If stars changed, reject (Ratings are immutable)
        if (existingRating.flavor !== ratings.flavor || 
            existingRating.service !== ratings.service || 
            existingRating.presentation !== ratings.presentation) {
            return { success: false, error: "La calificación de estrellas no se puede cambiar una vez enviada." }
        }
    } else {
        // 1.1 Save new Ratings
        const { error: ratingError } = await supabase
            .from('ratings')
            .insert({
                user_id: userId,
                locale_id: localeId,
                flavor: ratings.flavor,
                service: ratings.service,
                presentation: ratings.presentation
            })

        if (ratingError) {
            console.error("Rating Error:", ratingError)
            return { success: false, error: "Error al guardar la calificación." }
        }
    }

    // 2. Save Vote if requested
    if (wantToVote) {
        // 2.1 Check if user has a vote ELSEWHERE
        const { data: otherVote } = await supabase
            .from('votes')
            .select('locale_id, locales(name)')
            .eq('user_id', userId)
            .neq('locale_id', localeId)
            .single()

        if (otherVote && !confirmMoveVote) {
            const voteData = otherVote as unknown as { locales: { name: string } };
            return { 
                success: false, 
                code: 'VOTE_EXISTS', 
                currentLocaleName: voteData.locales?.name || "un restaurante" 
            }
        }

        // 2.2 Handle Vote Move or New Vote
        // We use Service Role to ensure we can delete/upsert correctly
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) return { success: false, error: "Error de configuración (Service Role)" }
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

        if (otherVote && confirmMoveVote) {
            // Delete old vote
            await supabaseAdmin.from('votes').delete().eq('user_id', userId)
        }

        // Upsert new vote
        const { error: voteError } = await supabaseAdmin
            .from('votes')
            .upsert({ user_id: userId, locale_id: localeId }, { onConflict: 'user_id' })

        if (voteError) {
            console.error("Vote Error:", voteError)
            return { success: false, error: "Error al registrar el voto." }
        }
    }

    revalidatePath("/ranking")
    revalidatePath("/votar")
    return { success: true }
}
