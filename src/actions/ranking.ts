"use server"

import { supabase } from "@/lib/supabase"

export interface RankedLocale {
    id: string
    name: string
    image_url: string
    avg_flavor: number
    avg_service: number
    avg_presentation: number
    total_avg: number
    rating_count: number
    votes: number
}

export async function getRanking(): Promise<RankedLocale[]> {
    try {
        // 1. Fetch all locales
        const { data: locales, error: localesError } = await supabase
            .from('locales')
            .select('id, name, image_url')

        if (localesError) throw localesError
        if (!locales) return []

        const ranking: RankedLocale[] = []

        for (const locale of locales) {
                // 2. Fetch all ratings for this locale
                const { data: ratings, error } = await supabase
                    .from('ratings')
                    .select('flavor, service, presentation')
                    .eq('locale_id', locale.id)

                // 2.1 Fetch vote count for this locale
                const { count: voteCount } = await supabase
                    .from('votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('locale_id', locale.id)

                if (!error && ratings && ratings.length > 0) {
                    const count = ratings.length
                    const sumFlavor = (ratings as { flavor: number }[]).reduce((acc: number, r) => acc + (r.flavor || 0), 0)
                    const sumService = (ratings as { service: number }[]).reduce((acc: number, r) => acc + (r.service || 0), 0)
                    const sumPresentation = (ratings as { presentation: number }[]).reduce((acc: number, r) => acc + (r.presentation || 0), 0)

                    const avgFlavor = sumFlavor / count
                    const avgService = sumService / count
                    const avgPresentation = sumPresentation / count
                    const totalAvg = (avgFlavor + avgService + avgPresentation) / 3

                    ranking.push({
                        ...locale,
                        avg_flavor: avgFlavor,
                        avg_service: avgService,
                        avg_presentation: avgPresentation,
                        total_avg: totalAvg,
                        rating_count: count,
                        votes: voteCount || 0
                    })
                } else {
                    ranking.push({
                        ...locale,
                        avg_flavor: 0,
                        avg_service: 0,
                        avg_presentation: 0,
                        total_avg: 0,
                        rating_count: 0,
                        votes: voteCount || 0
                    })
                }
        }

        // 3. Sort by total average descending
        return ranking.sort((a, b) => b.total_avg - a.total_avg)

    } catch (error) {
        console.error("Error fetching ranking:", error)
        return []
    }
}
