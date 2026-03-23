"use client"

import { useState } from "react"
import { login } from "@/actions/admin"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { motion } from "framer-motion"

export function AdminLogin() {
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await login(pin)
            if (!res.success) {
                setError(res.error || "Error desconocido")
            } else {
                // Refresh to trigger referencing the cookie
                window.location.reload()
            }
        } catch {
            setError("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm w-full max-w-sm"
            >
                <div className="text-center mb-6">
                    <span className="text-4xl">🔐</span>
                    <h1 className="text-2xl font-bold mt-4">Acceso Admin</h1>
                    <p className="text-slate-400 text-sm">Gestiona el Sushifest 2026</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="password"
                            placeholder="PIN de acceso"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-center text-lg tracking-widest"
                            maxLength={8}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold"
                    >
                        {loading ? "Entrando..." : "Entrar al Dashboard"}
                    </Button>
                </form>
            </motion.div>
        </div>
    )
}
