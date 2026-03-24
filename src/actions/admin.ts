"use server"

import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

const ADMIN_PIN = process.env.ADMIN_PIN || "1234"

export async function login(pin: string) {
    if (pin === ADMIN_PIN) {
        // Set a cookie that lasts for 24 hours
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const cookieStore = await cookies()
        cookieStore.set("admin_session", "true", { expires, httpOnly: true })
        return { success: true }
    }
    return { success: false, error: "PIN incorrecto" }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")
}

export async function checkAuth() {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")
    return session?.value === "true"
}

export async function addLocale(formData: FormData) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File
    const prize_pool = parseInt((formData.get("prize_pool") as string) || "0", 10)
    const discount_pool = parseInt((formData.get("discount_pool") as string) || "0", 10)
    const pin = (formData.get("pin") as string) || "1234"

    if (!name) return { success: false, error: "El nombre es obligatorio" }

    let image_url = "/logo.png" // Default

    // Handle File Upload
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
        try {
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")

            const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabaseAdmin.storage
                .from('locales')
                .upload(filePath, imageFile)

            if (uploadError) {
                console.error("Upload error:", uploadError)
                return { success: false, error: "Error subiendo imagen: " + uploadError.message }
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('locales')
                .getPublicUrl(filePath)

            image_url = publicUrl
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido"
            console.error("Upload exception:", error)
            return { success: false, error: "Error procesando la imagen: " + message }
        }
    } else {
        // Fallback to text input if provided (legacy support)
        const urlInput = formData.get("image_url") as string
        if (urlInput) image_url = urlInput
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const { error } = await supabaseAdmin
        .from("locales")
        .insert({ name, description, image_url, prize_pool, discount_pool, pin })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
}

export async function editLocale(formData: FormData) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File
    const prize_pool = parseInt((formData.get("prize_pool") as string) || "0", 10)
    const discount_pool = parseInt((formData.get("discount_pool") as string) || "0", 10)
    const pin = (formData.get("pin") as string) || "1234"

    if (!id) return { success: false, error: "ID no válido" }
    if (!name) return { success: false, error: "El nombre es obligatorio" }

    let image_url = formData.get("current_image_url") as string || "/logo.png"

    // Handle New File Upload if present
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
        try {
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")

            const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabaseAdmin.storage
                .from('locales')
                .upload(filePath, imageFile)

            if (uploadError) {
                console.error("Upload error:", uploadError)
                return { success: false, error: "Error subiendo imagen: " + uploadError.message }
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('locales')
                .getPublicUrl(filePath)

            image_url = publicUrl
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido"
            console.error("Upload exception:", error)
            return { success: false, error: "Error procesando la imagen: " + message }
        }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const { error } = await supabaseAdmin
        .from("locales")
        .update({ name, description, image_url, prize_pool, discount_pool, pin })
        .eq("id", id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
}

export async function deleteLocale(id: string) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // First delete all votes associated with this locale
    const { error: votesError } = await supabaseAdmin
        .from("votes")
        .delete()
        .eq("locale_id", id)

    if (votesError) {
        console.error("Error deleting votes:", votesError)
        return { success: false, error: "Error borrando votos asociados: " + votesError.message }
    }

    // Then delete the locale
    const { error } = await supabaseAdmin
        .from("locales")
        .delete()
        .eq("id", id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
}

export async function injectVotes(localeId: string, amount: number) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    if (!amount || amount <= 0) return { success: false, error: "Cantidad inválida" }
    if (amount > 10000) return { success: false, error: "Máximo 10,000 votos por inyección" }

    // Create array of votes for batch insert
    const votes = Array.from({ length: amount }).map(() => ({
        locale_id: localeId,
        voter_name: 'Voto Manual Admin',
        voter_contact: 'admin@system.internal'
    }))

    // Supabase allows batch inserts
    // We might need to chunk if it's too large, but 10,000 should be okay for most standard configs
    // If not, we can chunk it safely to 1000 at a time

    const CHUNK_SIZE = 1000
    for (let i = 0; i < votes.length; i += CHUNK_SIZE) {
        const chunk = votes.slice(i, i + CHUNK_SIZE)
        const { error } = await supabase
            .from("votes")
            .insert(chunk)

        if (error) {
            console.error("Injection error:", error)
            return { success: false, error: `Error en inyección (lote ${i}): ` + error.message }
        }
    }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
}

export async function purgeFraudVotes(localeId: string) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    console.log(`[PURGE] Starting purge for locale ${localeId}`)

    let allVotes: { id: string, voter_contact: string | null }[] = []
    let page = 0
    const pageSize = 2000
    let hasMore = true

    while (hasMore) {
        const { data, error } = await supabase
            .from('votes')
            .select('id, voter_contact')
            .eq('locale_id', localeId)
            .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error || !data || data.length === 0) {
            hasMore = false
        } else {
            allVotes = [...allVotes, ...data]
            page++
        }
    }

    console.log(`[PURGE] Processed ${allVotes.length} votes for analysis.`)

    const abusers = new Set<string>()
    const invalidFormatIds = new Set<string>()

    // 2. Identify Abusers AND Garbage Data
    const contactCounts: Record<string, number> = {}

    allVotes.forEach(v => {
        const raw = v.voter_contact || ''
        const clean = raw.replace(/\D/g, '') // digits only

        // CHECK 1: GARBAGE DATA (Letters, too short, too long)
        // Bolivia numbers are usually 8 digits. We'll be slightly lenient (7-15) but reject "asdasd"
        const isGarbage = clean.length < 7 || clean.length > 15 || raw.match(/[a-zA-Z]/)

        if (isGarbage) {
            invalidFormatIds.add(v.id)
            return // Don't count garbage towards frequency, just nuke it
        }

        const key = clean // Use cleaned number for frequency
        contactCounts[key] = (contactCounts[key] || 0) + 1
    })

    const repeaters = Object.entries(contactCounts)
        .filter(([, count]) => count > 3) // THRESHOLD > 3
        .map(([contact]) => contact)

    repeaters.forEach(c => abusers.add(c))

    console.log(`[PURGE] Found ${invalidFormatIds.size} garbage records and ${abusers.size} repeat abusers.`)

    if (abusers.size === 0 && invalidFormatIds.size === 0) return { success: true, message: "No se detectaron votos fraudulentos." }

    // 3. Collect IDs to delete
    // Convert abusers set back to ID matches
    const repeaterIds = allVotes
        .filter(v => {
            const clean = (v.voter_contact || '').replace(/\D/g, '')
            return abusers.has(clean)
        })
        .map(v => v.id)

    const finalIdsToDelete = [...Array.from(invalidFormatIds), ...repeaterIds]

    console.log(`[PURGE] Total records to delete: ${finalIdsToDelete.length}`)

    // 4. Delete in Batches
    const BATCH_SIZE = 100
    let deletedCount = 0

    for (let i = 0; i < finalIdsToDelete.length; i += BATCH_SIZE) {
        const batch = finalIdsToDelete.slice(i, i + BATCH_SIZE)
        const { count, error } = await supabase
            .from('votes')
            .delete({ count: 'exact' })
            .in('id', batch)

        if (error) console.error("Purge Error:", error)
        if (count) deletedCount += count
    }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true, message: `Limpieza completada: ${deletedCount} votos eliminados (Basura + Repetidos).` }
}

export async function removeVotes(localeId: string, amount: number) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    if (!amount || amount <= 0) return { success: false, error: "Cantidad inválida" }

    // Use Service Role Key to bypass RLS
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY")
        return { success: false, error: "Error de configuración: Falta SUAPBASE_SERVICE_ROLE_KEY" }
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // 1. Fetch the N most recent votes for this locale
    const { data: votesToDelete, error: fetchError } = await supabaseAdmin
        .from('votes')
        .select('id')
        .eq('locale_id', localeId)
        .order('created_at', { ascending: false })
        .limit(amount)

    if (fetchError) {
        return { success: false, error: "Error buscando votos: " + fetchError.message }
    }

    if (!votesToDelete || votesToDelete.length === 0) {
        return { success: false, error: "No se encontraron votos para eliminar." }
    }

    const ids = votesToDelete.map(v => v.id)
    console.log(`[REMOVE] Deleting ${ids.length} votes...`)

    // 2. Delete them in Batches to avoid "Bad Request" (URL/Payload too large)
    const BATCH_SIZE = 500
    let deletedCount = 0

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE)
        const { error: deleteError, count } = await supabaseAdmin
            .from('votes')
            .delete({ count: 'exact' })
            .in('id', batch)

        if (deleteError) {
            console.error("Delete Batch Error:", deleteError)
            // Continue trying other batches, but report error? 
            // Better to stop or log. We'll return the first error found but try to finish.
            return { success: false, error: "Error eliminando lote: " + deleteError.message }
        }

        if (count) deletedCount += count
    }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true, message: `Se eliminaron ${deletedCount} votos correctamente.` }
}

export async function toggleVoting(status: boolean) {
    const isAuth = await checkAuth()
    if (!isAuth) return { success: false, error: "No autorizado" }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const { error } = await supabaseAdmin
        .from('app_config')
        .upsert({ key: 'voting_active', value: String(status) })

    if (error) return { success: false, error: error.message }

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
}

export async function getVotingStatus() {
    const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'voting_active')
        .single()

    return data?.value === 'true'
}
