'use server'

export async function verifyTurnstile(token: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
        console.error("TURNSTILE_SECRET_KEY not set")
        return true 
    }

    try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret, response: token }),
        })

        const data = await response.json()
        return data.success
    } catch (error) {
        console.error("Turnstile verification error:", error)
        return false
    }
}
